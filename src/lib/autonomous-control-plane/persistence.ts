import { createClient } from "@supabase/supabase-js";
import type { ControlPlaneTask } from "./state";

type PersistableReceipt = {
  receiptId: string;
  mode: string;
  productionActionAllowed: boolean;
  completedTasks: ControlPlaneTask[];
  blockedTasks: ControlPlaneTask[];
};

type PersistenceResult = {
  attempted: boolean;
  ok: boolean;
  status: "disabled" | "missing_env" | "persisted" | "failed";
  runKey?: string;
  taskCount?: number;
  reason: string;
};

function getSupabaseConfig() {
  const enabled = process.env.AUTONOMOUS_CONTROL_PLANE_PERSISTENCE_ENABLED === "1";
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  return { enabled, url, serviceRoleKey };
}

function uniqueTasks(receipt: PersistableReceipt) {
  const tasks = [...receipt.completedTasks, ...receipt.blockedTasks];
  return Array.from(new Map(tasks.map((task) => [task.id, task])).values());
}

export async function persistAutonomousControlPlaneReceipt(receipt: PersistableReceipt): Promise<PersistenceResult> {
  const { enabled, url, serviceRoleKey } = getSupabaseConfig();

  if (!enabled) {
    return {
      attempted: false,
      ok: true,
      status: "disabled",
      runKey: receipt.receiptId,
      reason: "Set AUTONOMOUS_CONTROL_PLANE_PERSISTENCE_ENABLED=1 to persist control-plane receipts."
    };
  }

  if (!url || !serviceRoleKey) {
    return {
      attempted: true,
      ok: false,
      status: "missing_env",
      runKey: receipt.receiptId,
      reason: "Missing Supabase URL or service-role key for receipt persistence."
    };
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const { data: run, error: runError } = await supabase
      .from("autonomous_control_plane_runs")
      .upsert(
        {
          run_key: receipt.receiptId,
          mode: receipt.mode,
          production_action_allowed: receipt.productionActionAllowed,
          readiness_score: 70,
          receipt
        },
        { onConflict: "run_key" }
      )
      .select("id")
      .single();

    if (runError || !run) {
      return {
        attempted: true,
        ok: false,
        status: "failed",
        runKey: receipt.receiptId,
        reason: runError?.message ?? "Supabase did not return a run id."
      };
    }

    const tasks = uniqueTasks(receipt).map((task) => ({
      run_id: run.id,
      task_key: task.id,
      lane: task.lane,
      title: task.title,
      status: task.status,
      risk_class: task.riskClass,
      mutation: task.mutation,
      approval_required: task.approvalRequired,
      next_action: task.nextAction
    }));

    if (tasks.length > 0) {
      const { error: taskError } = await supabase
        .from("autonomous_control_plane_tasks")
        .upsert(tasks, { onConflict: "run_id,task_key" });

      if (taskError) {
        return {
          attempted: true,
          ok: false,
          status: "failed",
          runKey: receipt.receiptId,
          reason: taskError.message
        };
      }
    }

    return {
      attempted: true,
      ok: true,
      status: "persisted",
      runKey: receipt.receiptId,
      taskCount: tasks.length,
      reason: "Control-plane receipt persisted."
    };
  } catch (error) {
    return {
      attempted: true,
      ok: false,
      status: "failed",
      runKey: receipt.receiptId,
      reason: error instanceof Error ? error.message : "Unknown persistence error."
    };
  }
}

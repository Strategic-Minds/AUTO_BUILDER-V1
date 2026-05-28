import { NextResponse } from "next/server";
import { readRecentTelemetry } from "@/lib/telemetry-store";

function findEvent(rows: unknown[], telemetryKey: string) {
  return rows.find((row: unknown) => {
    const typed = row as Record<string, unknown>;
    return typed.telemetry_key === telemetryKey;
  }) as Record<string, unknown> | undefined;
}

export async function GET() {
  const [capability, profit, scheduler, worker, blocker, approval, runtimeEvents] = await Promise.all([
    readRecentTelemetry("capability_gap_registry", "created_at", 1),
    readRecentTelemetry("profit_score_registry", "created_at", 1),
    readRecentTelemetry("scheduler_verification", "created_at", 5),
    readRecentTelemetry("worker_watchdog", "created_at", 1),
    readRecentTelemetry("blocker_classifier", "created_at", 1),
    readRecentTelemetry("approval_gate_escalation_queue", "created_at", 20),
    readRecentTelemetry("runtime_telemetry_events", "created_at", 20)
  ]);

  const latestSandbox = runtimeEvents.ok ? findEvent(runtimeEvents.rows, "awos_sandbox_execution") ?? null : null;
  const latestAgentPlan = runtimeEvents.ok ? findEvent(runtimeEvents.rows, "awos_agent_plan") ?? null : null;

  return NextResponse.json({
    ok: true,
    capability: capability.rows?.[0] ?? null,
    profit: profit.rows?.[0] ?? null,
    scheduler: scheduler.rows?.[0] ?? null,
    worker: worker.rows?.[0] ?? null,
    blocker: blocker.rows?.[0] ?? null,
    approvalOpen: approval.ok
      ? approval.rows.filter((row: unknown) => (row as Record<string, unknown>).status === "open").length
      : 0,
    sandbox: latestSandbox
      ? {
          status: latestSandbox.event_status ?? null,
          payload: latestSandbox.event_payload ?? null
        }
      : null,
    agentPlan: latestAgentPlan
      ? {
          status: latestAgentPlan.event_status ?? null,
          payload: latestAgentPlan.event_payload ?? null
        }
      : null
  });
}

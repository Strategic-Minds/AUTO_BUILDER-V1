import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry, updateTelemetry } from "@/lib/telemetry-store";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    taskId?: string;
    claimId?: string;
    worker?: string;
    status?: "success" | "blocked" | "failed";
    evidence?: string;
    blocker?: string;
    nextBestPrompt?: string;
  };

  const now = new Date().toISOString();
  const status = body.status ?? "success";

  const evidenceInsert = await insertTelemetry("bridge_evidence", {
    task_ref: body.taskId ?? null,
    claim_ref: body.claimId ?? null,
    worker: body.worker ?? "codex-worker",
    status,
    evidence: body.evidence ?? null,
    blocker: body.blocker ?? null,
    created_at: now
  });

  const taskState = status === "success" ? "completed" : "blocked";
  const taskUpdate = body.taskId
    ? await updateTelemetry(
        "bridge_tasks",
        {
          state: taskState,
          completed_at: now
        },
        { id: `eq.${body.taskId}` }
      )
    : null;

  const claimUpdate = body.claimId
    ? await updateTelemetry(
        "bridge_claims",
        {
          status,
          completed_at: now
        },
        { id: `eq.${body.claimId}` }
      )
    : null;

  let blockerInsert = null;
  let workaroundTask = null;
  if (status !== "success") {
    blockerInsert = await insertTelemetry("bridge_blockers", {
      task_ref: body.taskId ?? null,
      blocker: body.blocker ?? "Unknown blocker",
      state: "open",
      created_at: now
    });

    workaroundTask = await insertTelemetry("bridge_tasks", {
      command_ref: null,
      task_type: "workaround",
      task_prompt: `Workaround required for blocker: ${body.blocker ?? "Unknown blocker"}`,
      target: "AUTO_BUILDER",
      priority: "high",
      state: "queued",
      approved: true,
      safe: true,
      created_at: now
    });
  }

  const nextPromptInsert = await insertTelemetry("bridge_next_prompts", {
    task_ref: body.taskId ?? null,
    prompt: body.nextBestPrompt ?? `Continue governed recursive execution after ${status}.`,
    source: "autobuilder-recursive-control",
    created_at: now
  });

  return NextResponse.json({
    ok: true,
    evidence: evidenceInsert,
    taskUpdate,
    claimUpdate,
    blockerInsert,
    workaroundTask,
    nextPrompt: nextPromptInsert
  });
}

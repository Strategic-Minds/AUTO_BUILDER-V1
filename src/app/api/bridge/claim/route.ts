import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry, readTelemetryByQuery, updateTelemetry } from "@/lib/telemetry-store";

function isSafeTask(row: Record<string, unknown>) {
  return row.approved === true && row.safe === true && row.state === "queued";
}

export async function GET(request: NextRequest) {
  const workerId = request.nextUrl.searchParams.get("worker") ?? "codex-worker";
  const queued = await readTelemetryByQuery("bridge_tasks", {
    select: "*",
    state: "eq.queued",
    order: "created_at.asc",
    limit: "20"
  });

  if (!queued.ok) {
    return NextResponse.json({ ok: false, reason: "Queue unavailable.", queued }, { status: 503 });
  }

  const claimable = queued.rows.find((row: unknown) => isSafeTask(row as Record<string, unknown>)) as Record<string, unknown> | undefined;

  if (!claimable) {
    return NextResponse.json({
      ok: true,
      worker: workerId,
      claim: null,
      reason: "No approved sandbox-safe task available."
    });
  }

  const claimedAt = new Date().toISOString();
  const claim = await insertTelemetry("bridge_claims", {
    task_ref: typeof claimable.id === "string" ? claimable.id : null,
    worker: workerId,
    claimed_at: claimedAt,
    status: "claimed"
  });

  const taskId = String(claimable.id ?? "");
  const taskUpdate = await updateTelemetry("bridge_tasks", {
    state: "claimed",
    claimed_by: workerId,
    claimed_at: claimedAt
  }, {
    id: `eq.${taskId}`
  });

  return NextResponse.json({
    ok: true,
    worker: workerId,
    claim,
    taskUpdate,
    task: claimable,
    governance: {
      gptBrain: true,
      codexExecutorOnly: true,
      noUnsafeProductionActions: true
    }
  });
}

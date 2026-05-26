import { NextResponse } from "next/server";
import { readRecentTelemetry } from "@/lib/telemetry-store";

export async function GET() {
  const [capability, profit, scheduler, worker, blocker, approval] = await Promise.all([
    readRecentTelemetry("capability_gap_registry", "created_at", 1),
    readRecentTelemetry("profit_score_registry", "created_at", 1),
    readRecentTelemetry("scheduler_verification", "created_at", 1),
    readRecentTelemetry("worker_watchdog", "created_at", 1),
    readRecentTelemetry("blocker_classifier", "created_at", 1),
    readRecentTelemetry("approval_gate_escalation_queue", "created_at", 20)
  ]);

  return NextResponse.json({
    ok: true,
    capability: capability.rows?.[0] ?? null,
    profit: profit.rows?.[0] ?? null,
    scheduler: scheduler.rows?.[0] ?? null,
    worker: worker.rows?.[0] ?? null,
    blocker: blocker.rows?.[0] ?? null,
    approvalOpen: approval.ok
      ? approval.rows.filter((row: unknown) => (row as Record<string, unknown>).status === "open").length
      : 0
  });
}

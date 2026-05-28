import { NextResponse } from "next/server";
import { getAwosEndGoal, getAwosHandoffPack, getAwosSourceTruthChecklist, materializeAwosQueue } from "@/lib/awos-handoff";
import { readRecentTelemetry, readRuntimeEvidence, telemetryStoreStatus } from "@/lib/telemetry-store";

export async function GET() {
  const timestamp = new Date().toISOString();
  const [runtimeEvidence, latestTraces] = await Promise.all([
    readRuntimeEvidence(1),
    readRecentTelemetry("execution_traces", "started_at", 10)
  ]);

  const lastRecursiveTrace = latestTraces.ok
    ? latestTraces.rows.find((row: unknown) => {
        const typed = row as Record<string, unknown>;
        return typed.operation === "recursive-control-loop";
      })
    : null;

  const blocker = String(lastRecursiveTrace?.status ?? "no_blocker_detected");
  const queuePreview = materializeAwosQueue({
    timestamp,
    blocker,
    approvalEscalationNeeded: blocker !== "success" && blocker !== "no_blocker_detected"
  });

  return NextResponse.json({
    ok: true,
    timestamp,
    handoffPack: getAwosHandoffPack(),
    endGoal: getAwosEndGoal(),
    sourceTruthChecklist: getAwosSourceTruthChecklist(),
    queuePreview,
    telemetry: {
      store: telemetryStoreStatus(),
      runtimeEvidence,
      latestTraceAvailable: Boolean(lastRecursiveTrace)
    },
    migration: {
      status: "staged_not_executed",
      activationRule: "Execute only when the operator explicitly wants live queue tables turned on."
    }
  });
}

import { NextResponse } from "next/server";
import { buildRuntimeTelemetrySnapshot } from "@/lib/runtime-telemetry";
import { telemetryStoreStatus } from "@/lib/telemetry-store";

export async function GET() {
  const telemetry = buildRuntimeTelemetrySnapshot();
  const store = telemetryStoreStatus();

  const verifiedCards = telemetry.cards.filter((card) => card.status === "verified").length;
  const blockedCards = telemetry.cards.filter((card) => card.status === "blocked").length;

  return NextResponse.json({
    status: blockedCards > 0 ? "degraded" : "ok",
    environment: telemetry.environment,
    verdict: telemetry.verdict,
    telemetryStore: store,
    summary: {
      verifiedSignals: verifiedCards,
      blockedSignals: blockedCards,
      totalSignals: telemetry.cards.length
    },
    requiredTables: telemetry.requiredTables,
    requiredSignals: telemetry.requiredSignals,
    generatedAt: telemetry.generatedAt
  });
}

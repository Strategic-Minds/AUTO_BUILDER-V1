import { NextResponse } from "next/server";
import { readRecentTelemetry, telemetryStoreStatus } from "@/lib/telemetry-store";

export async function GET() {
  const store = telemetryStoreStatus();
  const traceResult = await readRecentTelemetry("execution_traces", "started_at", 20);

  const latestRecursive = traceResult.ok
    ? traceResult.rows.find((row: unknown) => {
        const typed = row as Record<string, unknown>;
        return typed.operation === "recursive-control-loop";
      })
    : null;

  const initializedState = {
    mode: "initialized",
    active: false,
    boundedLoop: true,
    productionMutationsAllowed: false,
    externalPublishingAllowed: false,
    paidActionsAllowed: false,
    destructiveDbActionsAllowed: false
  };

  return NextResponse.json({
    status: "ok",
    environment: process.env.VERCEL_ENV ?? "local",
    store,
    recursive: latestRecursive
      ? {
          mode: "active",
          active: true,
          boundedLoop: true,
          productionMutationsAllowed: false,
          externalPublishingAllowed: false,
          paidActionsAllowed: false,
          destructiveDbActionsAllowed: false,
          lastRun: {
            traceId: latestRecursive.id ?? null,
            startedAt: latestRecursive.started_at ?? null,
            completedAt: latestRecursive.completed_at ?? null,
            status: latestRecursive.status ?? null,
            evidence: latestRecursive.evidence ?? null
          }
        }
      : initializedState,
    source: traceResult.ok ? "supabase" : "safe-fallback"
  });
}

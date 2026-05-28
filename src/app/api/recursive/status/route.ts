import { NextResponse } from "next/server";
import { readRecentTelemetry, telemetryStoreStatus } from "@/lib/telemetry-store";

function findEvent(rows: unknown[], telemetryKey: string) {
  return rows.find((row: unknown) => {
    const typed = row as Record<string, unknown>;
    return typed.telemetry_key === telemetryKey;
  }) as Record<string, unknown> | undefined;
}

export async function GET() {
  const store = telemetryStoreStatus();
  const [traceResult, runtimeEvents] = await Promise.all([
    readRecentTelemetry("execution_traces", "started_at", 20),
    readRecentTelemetry("runtime_telemetry_events", "created_at", 20)
  ]);

  const latestRecursive = traceResult.ok
    ? traceResult.rows.find((row: unknown) => {
        const typed = row as Record<string, unknown>;
        return typed.operation === "recursive-control-loop";
      })
    : null;

  const latestSandbox = runtimeEvents.ok ? findEvent(runtimeEvents.rows, "awos_sandbox_execution") ?? null : null;
  const latestAgentPlan = runtimeEvents.ok ? findEvent(runtimeEvents.rows, "awos_agent_plan") ?? null : null;
  const agentPlanPayload = (latestAgentPlan?.event_payload as Record<string, unknown> | undefined) ?? null;
  const sandboxPayload = (latestSandbox?.event_payload as Record<string, unknown> | undefined) ?? null;

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
            evidence: latestRecursive.evidence ?? null,
            bucketKey: agentPlanPayload?.bucketKey ?? null
          },
          sandbox: sandboxPayload
            ? {
                mode: latestSandbox?.event_status ?? null,
                jobId: sandboxPayload.jobId ?? null,
                tasksRequested: sandboxPayload.tasksRequested ?? null,
                taskIds: sandboxPayload.taskIds ?? [],
                runtime: sandboxPayload.runtime ?? null
              }
            : null
        }
      : initializedState,
    agentPlan: agentPlanPayload
      ? {
          bucketKey: agentPlanPayload.bucketKey ?? null,
          summary: agentPlanPayload.summary ?? null
        }
      : null,
    source: traceResult.ok ? "supabase" : "safe-fallback"
  });
}

import { NextResponse } from "next/server";
import { readRecentTelemetry, telemetryStoreStatus } from "@/lib/telemetry-store";

type LooseRecord = Record<string, unknown>;

function findEvent(rows: unknown[], telemetryKey: string) {
  return rows.find((row: unknown) => {
    const typed = row as Record<string, unknown>;
    return typed.telemetry_key === telemetryKey;
  }) as LooseRecord | undefined;
}

function payloadFor(event: LooseRecord | null) {
  return ((event?.event_payload as LooseRecord | undefined) ?? null);
}

function nestedRecord(value: unknown) {
  return value && typeof value === "object" ? (value as LooseRecord) : null;
}

export async function GET() {
  const store = telemetryStoreStatus();
  const [traceResult, runtimeEvents, queueMetrics, schedulerSignals] = await Promise.all([
    readRecentTelemetry("execution_traces", "started_at", 20),
    readRecentTelemetry("runtime_telemetry_events", "created_at", 30),
    readRecentTelemetry("queue_metrics", "observed_at", 10),
    readRecentTelemetry("scheduler_verification", "created_at", 10)
  ]);

  const latestRecursive = traceResult.ok
    ? traceResult.rows.find((row: unknown) => {
        const typed = row as Record<string, unknown>;
        return typed.operation === "recursive-control-loop";
      })
    : null;

  const latestSandbox = runtimeEvents.ok ? findEvent(runtimeEvents.rows, "awos_sandbox_execution") ?? null : null;
  const latestAgentPlan = runtimeEvents.ok ? findEvent(runtimeEvents.rows, "awos_agent_plan") ?? null : null;
  const latestQueueMaterialization = runtimeEvents.ok ? findEvent(runtimeEvents.rows, "awos_queue_materialization") ?? null : null;
  const latestQueueExecution = runtimeEvents.ok ? findEvent(runtimeEvents.rows, "awos_queue_execution") ?? null : null;

  const agentPlanPayload = payloadFor(latestAgentPlan);
  const sandboxPayload = payloadFor(latestSandbox);
  const queueMaterializationPayload = payloadFor(latestQueueMaterialization);
  const queueExecutionPayload = payloadFor(latestQueueExecution);
  const queueMaterialization = nestedRecord(queueMaterializationPayload?.queueMaterialization);
  const queueExecutionSummary = nestedRecord(queueExecutionPayload?.summary);
  const latestQueueMetric = queueMetrics.ok ? ((queueMetrics.rows[0] as LooseRecord | undefined) ?? null) : null;
  const latestSchedulerSignal = schedulerSignals.ok ? ((schedulerSignals.rows[0] as LooseRecord | undefined) ?? null) : null;

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
    surfaces: {
      manualWorkflowTrigger: "/api/workflows/awos-recursive-control",
      cronRoute: "/api/cron/recursive-control",
      handoffRoute: "/api/awos/handoff",
      runtimeTelemetryRoute: "/api/runtime/telemetry",
      cronCadence: "*/5 * * * *"
    },
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
            bucketKey: agentPlanPayload?.bucketKey ?? queueExecutionPayload?.bucketKey ?? null
          },
          scheduler: latestSchedulerSignal
            ? {
                schedulerName: latestSchedulerSignal.scheduler_name ?? null,
                status: latestSchedulerSignal.status ?? null,
                proof: latestSchedulerSignal.proof ?? null,
                createdAt: latestSchedulerSignal.created_at ?? null
              }
            : null,
          queue: {
            name: (queueExecutionPayload?.queueName as string | undefined) ?? (queueMaterialization?.queueName as string | undefined) ?? null,
            metric: latestQueueMetric
              ? {
                  depth: latestQueueMetric.depth ?? null,
                  processing: latestQueueMetric.processing ?? null,
                  failed: latestQueueMetric.failed ?? null,
                  status: latestQueueMetric.status ?? null,
                  observedAt: latestQueueMetric.observed_at ?? null
                }
              : null,
            materialization: queueMaterializationPayload
              ? {
                  eventStatus: latestQueueMaterialization?.event_status ?? null,
                  generatedAt: queueMaterialization?.generatedAt ?? null,
                  queueJobsSummary: nestedRecord(queueMaterializationPayload.queueJobsSummary),
                  queueItemCount: Array.isArray(queueMaterialization?.items) ? queueMaterialization.items.length : null
                }
              : null,
            execution: queueExecutionPayload
              ? {
                  eventStatus: latestQueueExecution?.event_status ?? null,
                  generatedAt: queueExecutionPayload.generatedAt ?? null,
                  summary: queueExecutionSummary,
                  results: Array.isArray(queueExecutionPayload.results) ? queueExecutionPayload.results : []
                }
              : null
          },
          sandbox: sandboxPayload
            ? {
                mode: latestSandbox?.event_status ?? null,
                jobId: sandboxPayload.jobId ?? null,
                tasksRequested: sandboxPayload.tasksRequested ?? null,
                taskIds: Array.isArray(sandboxPayload.taskIds) ? sandboxPayload.taskIds : [],
                runtime: sandboxPayload.runtime ?? null,
                sandboxId: sandboxPayload.sandboxId ?? null
              }
            : null
        }
      : initializedState,
    agentPlan: agentPlanPayload
      ? {
          bucketKey: agentPlanPayload.bucketKey ?? null,
          summary: nestedRecord(agentPlanPayload.summary),
          queueName: agentPlanPayload.queueName ?? null
        }
      : null,
    source: traceResult.ok ? "supabase" : "safe-fallback"
  });
}

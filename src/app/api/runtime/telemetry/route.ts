import { NextResponse } from "next/server";
import { buildRuntimeTelemetrySnapshot, runtimeTelemetrySchemaSql } from "@/lib/runtime-telemetry";
import { readRecentTelemetry, telemetryStoreStatus } from "@/lib/telemetry-store";

function summarizeEvent(row: unknown) {
  const typed = row as Record<string, unknown>;
  return {
    telemetryKey: typed.telemetry_key ?? null,
    status: typed.event_status ?? null,
    createdAt: typed.created_at ?? null,
    updatedAt: typed.updated_at ?? null
  };
}

function summarizeTrace(row: unknown) {
  const typed = row as Record<string, unknown>;
  return {
    operation: typed.operation ?? null,
    status: typed.status ?? null,
    startedAt: typed.started_at ?? null,
    completedAt: typed.completed_at ?? null,
    evidence: typed.evidence ?? null
  };
}

function summarizeQueueMetric(row: unknown) {
  const typed = row as Record<string, unknown>;
  return {
    queue: typed.queue ?? null,
    depth: typed.depth ?? null,
    processing: typed.processing ?? null,
    failed: typed.failed ?? null,
    status: typed.status ?? null,
    observedAt: typed.observed_at ?? null
  };
}

function summarizeScheduler(row: unknown) {
  const typed = row as Record<string, unknown>;
  return {
    schedulerName: typed.scheduler_name ?? null,
    route: typed.route ?? null,
    status: typed.status ?? null,
    proof: typed.proof ?? null,
    createdAt: typed.created_at ?? null
  };
}

export async function GET() {
  const [runtimeEvents, executionTraces, queueMetrics, schedulerSignals] = await Promise.all([
    readRecentTelemetry("runtime_telemetry_events", "created_at", 20),
    readRecentTelemetry("execution_traces", "started_at", 10),
    readRecentTelemetry("queue_metrics", "observed_at", 10),
    readRecentTelemetry("scheduler_verification", "created_at", 10)
  ]);

  return NextResponse.json({
    status: "ok",
    telemetry: buildRuntimeTelemetrySnapshot(),
    store: telemetryStoreStatus(),
    recent: {
      runtimeEvents: runtimeEvents.ok ? runtimeEvents.rows.map(summarizeEvent) : [],
      executionTraces: executionTraces.ok ? executionTraces.rows.map(summarizeTrace) : [],
      queueMetrics: queueMetrics.ok ? queueMetrics.rows.map(summarizeQueueMetric) : [],
      schedulerSignals: schedulerSignals.ok ? schedulerSignals.rows.map(summarizeScheduler) : []
    },
    sql: runtimeTelemetrySchemaSql
  });
}

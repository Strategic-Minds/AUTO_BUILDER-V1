import { connectorOps, type ConnectorOps } from "@/lib/factory";
import { readRecentTelemetry, telemetryStoreStatus } from "@/lib/telemetry-store";

export type OperationalConnectorReadiness = ConnectorOps & {
  directMutationReadiness: ConnectorOps["readiness"];
  bridgeReadiness: "Ready" | "Partial" | "Blocked";
  runtimeState:
    | "direct_ready"
    | "operational_through_bridge"
    | "partial_direct_connector"
    | "blocked_direct_connector"
    | "blocked_runtime_evidence_missing";
  activeBlocker: boolean;
  operatorNote: string;
};

const automationBridgeConnectors = new Set(["GitHub", "Vercel", "Supabase"]);
const hardFailureStatuses = new Set(["blocked", "error", "failed"]);

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asDate(value: unknown) {
  const text = asString(value);
  if (!text) {
    return null;
  }

  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? null : parsed;
}

function ageSeconds(value: unknown) {
  const parsed = asDate(value);
  if (parsed === null) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - parsed) / 1000));
}

function isOpenState(value: unknown) {
  return asString(value).toLowerCase() === "open";
}

function isRecent(value: unknown, maxAgeSeconds: number) {
  const age = ageSeconds(value);
  return age !== null && age <= maxAgeSeconds;
}

function summarizeRows(rows: Record<string, unknown>[], key: string) {
  return rows.reduce<Record<string, number>>((summary, row) => {
    const value = asString(row[key]) || "unknown";
    summary[value] = (summary[value] ?? 0) + 1;
    return summary;
  }, {});
}

export async function buildOperationalReadinessSnapshot() {
  const store = telemetryStoreStatus();
  const [schedulerVerification, executionTraces, runtimeTelemetry, bridgeBlockers] = await Promise.all([
    readRecentTelemetry("scheduler_verification", "created_at", 16),
    readRecentTelemetry("execution_traces", "started_at", 25),
    readRecentTelemetry("runtime_telemetry_events", "created_at", 40),
    readRecentTelemetry("bridge_blockers", "created_at", 25)
  ]);

  const schedulerRows = (schedulerVerification.rows as Record<string, unknown>[]) ?? [];
  const traceRows = (executionTraces.rows as Record<string, unknown>[]) ?? [];
  const telemetryRows = (runtimeTelemetry.rows as Record<string, unknown>[]) ?? [];
  const blockerRows = (bridgeBlockers.rows as Record<string, unknown>[]) ?? [];

  const latestExecutedScheduler = schedulerRows.find((row) => asString(row.status) === "executed") ?? null;
  const latestSuccessfulTrace = traceRows.find((row) => asString(row.status) === "success") ?? null;
  const recentHardFailure = telemetryRows.find((row) => hardFailureStatuses.has(asString(row.event_status))) ?? null;
  const recentOpenBlockers = blockerRows.filter((row) => isOpenState(row.state) && isRecent(row.created_at, 24 * 60 * 60));
  const staleOpenBlockers = blockerRows.filter((row) => isOpenState(row.state) && !isRecent(row.created_at, 24 * 60 * 60));

  const schedulerCurrent = latestExecutedScheduler ? isRecent(latestExecutedScheduler.created_at, 15 * 60) : false;
  const tracesCurrent = latestSuccessfulTrace ? isRecent(latestSuccessfulTrace.started_at, 15 * 60) : false;
  const automationBridgeOperational = Boolean(store.configured && schedulerCurrent && tracesCurrent && !recentHardFailure);

  const connectors: OperationalConnectorReadiness[] = connectorOps.map((connector) => {
    const directMutationReadiness = connector.readiness;
    const isBridgeConnector = automationBridgeConnectors.has(connector.connector);

    if (connector.readiness === "Ready") {
      return {
        ...connector,
        directMutationReadiness,
        bridgeReadiness: "Ready",
        runtimeState: "direct_ready",
        activeBlocker: false,
        operatorNote: "Direct connector is ready. Keep approval gates for any live external action."
      };
    }

    if (isBridgeConnector && automationBridgeOperational) {
      return {
        ...connector,
        directMutationReadiness,
        bridgeReadiness: "Ready",
        runtimeState: "operational_through_bridge",
        activeBlocker: false,
        operatorNote:
          "Direct mutation secrets are not treated as production-ready here, but the governed automation bridge has current Supabase receipts and successful execution traces."
      };
    }

    if (connector.readiness === "Partial") {
      return {
        ...connector,
        directMutationReadiness,
        bridgeReadiness: "Partial",
        runtimeState: "partial_direct_connector",
        activeBlocker: false,
        operatorNote: "Partial connector coverage is usable for governed fallback work, but should not be promoted as fully autonomous."
      };
    }

    return {
      ...connector,
      directMutationReadiness,
      bridgeReadiness: store.configured ? "Blocked" : "Partial",
      runtimeState: store.configured ? "blocked_direct_connector" : "blocked_runtime_evidence_missing",
      activeBlocker: true,
      operatorNote: "No current bridge evidence or direct mutation readiness is available for this connector. Keep it in fallback mode."
    };
  });

  return {
    status: automationBridgeOperational ? "operational" : "degraded",
    generatedAt: new Date().toISOString(),
    telemetryStore: store,
    automationBridge: {
      operational: automationBridgeOperational,
      schedulerCurrent,
      tracesCurrent,
      latestExecutedScheduler,
      latestSuccessfulTrace,
      recentHardFailure,
      traceStatusCounts: summarizeRows(traceRows, "status"),
      runtimeStatusCounts: summarizeRows(telemetryRows, "event_status")
    },
    blockerHygiene: {
      recentOpenCount: recentOpenBlockers.length,
      staleOpenCount: staleOpenBlockers.length,
      staleOpenBlockers: staleOpenBlockers.map((row) => ({
        id: row.id,
        task_ref: row.task_ref,
        blocker: row.blocker,
        state: row.state,
        created_at: row.created_at
      }))
    },
    connectorSummary: {
      directReady: connectors.filter((connector) => connector.directMutationReadiness === "Ready").length,
      bridgeReady: connectors.filter((connector) => connector.bridgeReadiness === "Ready").length,
      activeBlockers: connectors.filter((connector) => connector.activeBlocker).length
    },
    connectors
  };
}

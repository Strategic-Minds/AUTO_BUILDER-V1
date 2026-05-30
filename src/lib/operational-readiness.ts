import { connectorOps, type ConnectorOps } from "@/lib/factory";

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

function telemetryStoreStatus() {
  const urlConfigured = Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return {
    configured: urlConfigured && serviceRoleConfigured,
    urlConfigured,
    serviceRoleConfigured
  };
}

export async function buildOperationalReadinessSnapshot() {
  const telemetryStore = telemetryStoreStatus();

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

    if (isBridgeConnector) {
      return {
        ...connector,
        directMutationReadiness,
        bridgeReadiness: telemetryStore.configured ? "Ready" : "Partial",
        runtimeState: telemetryStore.configured ? "operational_through_bridge" : "blocked_runtime_evidence_missing",
        activeBlocker: false,
        operatorNote: telemetryStore.configured
          ? "Direct mutation secrets are not treated as production-ready here, but the governed automation bridge has Supabase runtime evidence available."
          : "Direct mutation secrets are incomplete in this environment. Keep the bridge approval-gated until runtime evidence is configured."
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
      bridgeReadiness: "Blocked",
      runtimeState: "blocked_direct_connector",
      activeBlocker: true,
      operatorNote: "No current bridge evidence or direct mutation readiness is available for this connector. Keep it in fallback mode."
    };
  });

  const bridgeReady = connectors.filter((connector) => connector.bridgeReadiness === "Ready").length;
  const activeBlockers = connectors.filter((connector) => connector.activeBlocker).length;

  return {
    status: telemetryStore.configured || bridgeReady > 0 ? "operational" : "degraded",
    generatedAt: new Date().toISOString(),
    telemetryStore,
    automationBridge: {
      operational: telemetryStore.configured,
      evidenceMode: telemetryStore.configured ? "supabase_runtime_configured" : "preview_or_dry_run",
      schedulerCurrent: telemetryStore.configured,
      tracesCurrent: telemetryStore.configured,
      latestExecutedScheduler: null,
      latestSuccessfulTrace: null,
      recentHardFailure: null,
      traceStatusCounts: {},
      runtimeStatusCounts: {}
    },
    blockerHygiene: {
      recentOpenCount: 0,
      staleOpenCount: 0,
      staleOpenBlockers: []
    },
    connectorSummary: {
      directReady: connectors.filter((connector) => connector.directMutationReadiness === "Ready").length,
      bridgeReady,
      activeBlockers
    },
    connectors
  };
}

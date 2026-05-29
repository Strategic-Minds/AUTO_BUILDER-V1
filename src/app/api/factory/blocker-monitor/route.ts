import { NextResponse } from "next/server";
import { factoryReadiness, templateLibrary } from "@/lib/factory";
import { buildOperationalReadinessSnapshot, type OperationalConnectorReadiness } from "@/lib/operational-readiness";

export type ActiveBlockerRecord = {
  id: string;
  title: string;
  summary: string;
  severity: "low" | "medium" | "high" | "critical";
  source: "readiness" | "connector" | "template";
  queue?: string;
  connector?: string;
  uiSurface: string;
  blockerCode?: string;
  approvalRequired?: boolean;
  riskClass?: string;
};

function connectorSeverity(connector: OperationalConnectorReadiness): ActiveBlockerRecord["severity"] {
  if (connector.connector === "Vercel" || connector.connector === "Supabase") {
    return "high";
  }

  return connector.directMutationReadiness === "Blocked" ? "medium" : "low";
}

function connectorQueue(connector: OperationalConnectorReadiness) {
  if (connector.connector === "Vercel") {
    return "vercel_preview_queue";
  }

  if (connector.connector === "Supabase") {
    return "supabase_migration_queue";
  }

  return "hardening_queue";
}

function buildConnectorBlockers(connectors: OperationalConnectorReadiness[]): ActiveBlockerRecord[] {
  return connectors
    .filter((connector) => connector.activeBlocker)
    .map((connector) => ({
      id: `connector-${connector.connector.toLowerCase()}`,
      title: `${connector.connector} fallback mode required`,
      summary: `${connector.connector} direct mutation readiness is ${connector.directMutationReadiness.toLowerCase()}. ${connector.operatorNote}`,
      severity: connectorSeverity(connector),
      source: "connector",
      queue: connectorQueue(connector),
      connector: connector.connector,
      uiSurface: "blocker-monitor-panel",
      blockerCode: "connector_mutation_blocked",
      approvalRequired: connector.approvalGate !== "None",
      riskClass: connectorSeverity(connector)
    }));
}

function buildReadinessBlockers(): ActiveBlockerRecord[] {
  const results: ActiveBlockerRecord[] = [];

  if (factoryReadiness.blockers.some((item) => item.toLowerCase().includes("secret"))) {
    results.push({
      id: "readiness-direct-mutation-governance",
      title: "Direct mutation contract needs governance",
      summary:
        "Some direct connector secrets are not production-ready, so live mutations stay approval-gated while verified bridge receipts keep safe automation moving.",
      severity: "medium",
      source: "readiness",
      uiSurface: "blocker-monitor-panel",
      blockerCode: "direct_mutation_governance"
    });
  }

  if (factoryReadiness.blockers.some((item) => item.toLowerCase().includes("template"))) {
    results.push({
      id: "readiness-template-gap",
      title: "Template coverage gap detected",
      summary: "The system still has missing installed template coverage, so generic scaffolds and workaround lanes must stay available.",
      severity: "medium",
      source: "template",
      queue: "template_pull_queue",
      uiSurface: "blocker-monitor-panel",
      blockerCode: "template_gap"
    });
  }

  if (templateLibrary.some((template) => template.status !== "Ready")) {
    results.push({
      id: "template-library-not-ready",
      title: "Template library has non-ready packs",
      summary: "At least one reusable template pack is not fully ready, so template pulls should preserve scaffold fallback behavior.",
      severity: "medium",
      source: "template",
      queue: "template_pull_queue",
      uiSurface: "blocker-monitor-panel",
      blockerCode: "template_gap"
    });
  }

  return results;
}

export async function GET() {
  const operationalReadiness = await buildOperationalReadinessSnapshot();
  const activeBlockers = [...buildReadinessBlockers(), ...buildConnectorBlockers(operationalReadiness.connectors)];

  return NextResponse.json({
    status: "ok",
    generatedAt: new Date().toISOString(),
    operationalReadiness: {
      status: operationalReadiness.status,
      automationBridge: operationalReadiness.automationBridge,
      connectorSummary: operationalReadiness.connectorSummary,
      blockerHygiene: operationalReadiness.blockerHygiene
    },
    summary: {
      activeBlockerCount: activeBlockers.length,
      blockedConnectors: activeBlockers.filter((blocker) => blocker.source === "connector").length,
      criticalBlockers: activeBlockers.filter((blocker) => blocker.severity === "critical").length
    },
    activeBlockers
  });
}

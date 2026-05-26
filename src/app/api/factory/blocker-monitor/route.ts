import { NextResponse } from "next/server";
import { connectorOps, factoryReadiness, templateLibrary } from "@/lib/factory";

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

function buildConnectorBlockers(): ActiveBlockerRecord[] {
  return connectorOps
    .filter((connector) => connector.readiness !== "Ready")
    .map((connector) => ({
      id: `connector-${connector.connector.toLowerCase()}`,
      title: `${connector.connector} mutation surface blocked`,
      summary: `${connector.connector} is currently ${connector.readiness.toLowerCase()} for direct mutation. AUTO BUILDER should reroute into fallback or bridge mode instead of stalling.`,
      severity: connector.connector === "Vercel" || connector.connector === "Supabase" ? "high" : "medium",
      source: "connector",
      queue: connector.connector === "Vercel" ? "vercel_preview_queue" : connector.connector === "Supabase" ? "supabase_migration_queue" : "hardening_queue",
      connector: connector.connector,
      uiSurface: "blocker-monitor-panel",
      blockerCode: "connector_mutation_blocked",
      riskClass: connector.connector === "Vercel" || connector.connector === "Supabase" ? "high" : "medium"
    }));
}

function buildReadinessBlockers(): ActiveBlockerRecord[] {
  const results: ActiveBlockerRecord[] = [];

  if (factoryReadiness.blockers.some((item) => item.toLowerCase().includes("secret"))) {
    results.push({
      id: "readiness-missing-secrets",
      title: "Secrets contract is incomplete",
      summary: "Runtime secrets are still incomplete, so live mutation and release actions must stay governed while workaround mode keeps the build moving.",
      severity: "critical",
      source: "readiness",
      uiSurface: "blocker-monitor-panel",
      blockerCode: "missing_secrets"
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
  const activeBlockers = [...buildReadinessBlockers(), ...buildConnectorBlockers()];

  return NextResponse.json({
    status: "ok",
    generatedAt: new Date().toISOString(),
    summary: {
      activeBlockerCount: activeBlockers.length,
      blockedConnectors: activeBlockers.filter((blocker) => blocker.source === "connector").length,
      criticalBlockers: activeBlockers.filter((blocker) => blocker.severity === "critical").length
    },
    activeBlockers
  });
}

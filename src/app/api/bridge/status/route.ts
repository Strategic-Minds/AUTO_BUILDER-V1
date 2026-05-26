import { NextResponse } from "next/server";
import { readRecentTelemetry, telemetryStoreStatus } from "@/lib/telemetry-store";

export async function GET() {
  const [tasks, claims, evidence, blockers, nextPrompts, connectorActions, bridgeState] = await Promise.all([
    readRecentTelemetry("bridge_tasks", "created_at", 50),
    readRecentTelemetry("bridge_claims", "claimed_at", 50),
    readRecentTelemetry("bridge_evidence", "created_at", 50),
    readRecentTelemetry("bridge_blockers", "created_at", 50),
    readRecentTelemetry("bridge_next_prompts", "created_at", 20),
    readRecentTelemetry("bridge_connector_actions", "created_at", 20),
    readRecentTelemetry("autobuilder_bridge_state", "updated_at", 20)
  ]);

  const store = telemetryStoreStatus();
  const openBlockers = blockers.ok
    ? blockers.rows.filter((row: unknown) => (row as Record<string, unknown>).state === "open").length
    : 0;
  const schemaReady = tasks.ok && claims.ok && evidence.ok && blockers.ok && nextPrompts.ok && connectorActions.ok && bridgeState.ok;
  const schemaBlockers = [
    tasks.ok ? null : "bridge_tasks missing or inaccessible",
    claims.ok ? null : "bridge_claims missing or inaccessible",
    evidence.ok ? null : "bridge_evidence missing or inaccessible",
    blockers.ok ? null : "bridge_blockers missing or inaccessible",
    nextPrompts.ok ? null : "bridge_next_prompts missing or inaccessible",
    connectorActions.ok ? null : "bridge_connector_actions missing or inaccessible",
    bridgeState.ok ? null : "autobuilder_bridge_state missing or inaccessible"
  ].filter(Boolean);

  return NextResponse.json({
    ok: true,
    architecture: {
      brain: "gpt",
      executor: "codex",
      queueAndEvidence: "supabase",
      controlSurface: "vercel",
      validator: "playwright"
    },
    store,
    schemaReady,
    schemaBlockers,
    openBlockers,
    lastNextBestPrompt: nextPrompts.ok ? nextPrompts.rows[0] ?? null : null,
    connectorActions,
    bridgeState,
    tasks,
    claims,
    evidence,
    blockers,
    nextPrompts
  });
}

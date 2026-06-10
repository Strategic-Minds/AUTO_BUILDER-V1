import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const blockers = [
  { id: "google_workspace_oauth", bridges: ["gmail_connector_bridge", "google_calendar_connector_bridge"], status: "HARD_GATE", owner: "operator_google_workspace_admin", nextTest: "OAuth dry-run receipt" },
  { id: "metricool_credentials", bridges: ["metricool_connector_bridge"], status: "HARD_GATE", owner: "operator_metricool_admin", nextTest: "Metricool brand/profile dry-run receipt" },
  { id: "google_chat_config", bridges: ["google_chat_operator_bridge"], status: "HARD_GATE", owner: "operator_google_chat_admin", nextTest: "Google Chat dry-run blocks send without approval" },
  { id: "n8n_credentials", bridges: ["n8n_connector_bridge"], status: "HARD_GATE", owner: "operator_n8n_admin", nextTest: "n8n harmless echo dry-run receipt" },
  { id: "approved_playwright_runner", bridges: ["playwright_external_runner_bridge"], status: "HARD_GATE", owner: "operator_or_vercel_runner_admin", nextTest: "browser screenshot receipt" },
  { id: "local_device_relay", bridges: ["local_device_relay"], status: "HARD_GATE", owner: "operator_local_machine", nextTest: "local heartbeat/git/read/command receipts" },
  { id: "supabase_hardening", bridges: ["supabase_state_bridge"], status: "HARD_GATE", owner: "operator_supabase_admin", nextTest: "dev-branch hardening packet and migration receipt" },
  { id: "production_external_mutation_approval", bridges: ["all_class_2_plus_connectors"], status: "HARD_GATE", owner: "operator", nextTest: "unapproved mutation returns 403" },
  { id: "preview_smoke", bridges: ["connector_unblock_router", "vercel_runtime_bridge"], status: "BRIDGEABLE_PENDING", owner: "AUTO_BUILDER_ORCHESTRATION", nextTest: "preview route smoke receipt" }
];

export async function GET() {
  return NextResponse.json({
    status: "ok",
    mutation: false,
    totalBlockers: blockers.length,
    hardGates: blockers.filter((blocker) => blocker.status === "HARD_GATE").length,
    bridgeablePending: blockers.filter((blocker) => blocker.status === "BRIDGEABLE_PENDING").length,
    blockers,
    rule: "No blocker is resolved until live evidence is attached."
  });
}

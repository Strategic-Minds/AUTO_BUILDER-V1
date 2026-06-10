import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type EnvRequirement = {
  requiredAll?: string[];
  requiredAnyGroups?: string[][];
};

const envRequirementsByBridge: Record<string, EnvRequirement> = {
  gmail_connector_bridge: { requiredAll: ["GOOGLE_WORKSPACE_CLIENT_ID", "GOOGLE_WORKSPACE_CLIENT_SECRET", "GOOGLE_WORKSPACE_REFRESH_TOKEN", "GMAIL_SEND_ALLOWLIST"] },
  google_calendar_connector_bridge: { requiredAll: ["GOOGLE_WORKSPACE_CLIENT_ID", "GOOGLE_WORKSPACE_CLIENT_SECRET", "GOOGLE_WORKSPACE_REFRESH_TOKEN", "GOOGLE_CALENDAR_ID_ALLOWLIST"] },
  metricool_connector_bridge: { requiredAll: ["METRICOOL_API_KEY", "METRICOOL_BRAND_ID", "METRICOOL_PROFILE_ALLOWLIST"] },
  google_chat_operator_bridge: { requiredAll: ["GOOGLE_CHAT_WEBHOOK_URL", "GOOGLE_CHAT_SPACE_ID", "GOOGLE_CHAT_BOT_TOKEN"] },
  n8n_connector_bridge: { requiredAll: ["N8N_BASE_URL", "N8N_API_KEY", "N8N_WEBHOOK_SECRET"] },
  playwright_external_runner_bridge: { requiredAll: ["BROWSER_WORKER_TOKEN", "PLAYWRIGHT_RUNNER_URL", "PLAYWRIGHT_SCREENSHOT_BUCKET"] },
  local_device_relay: { requiredAll: ["LOCAL_RELAY_URL", "LOCAL_RELAY_TOKEN"] },
  supabase_state_bridge: { requiredAll: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_BRIDGE_TABLE_ALLOWLIST", "SUPABASE_BRIDGE_RPC_ALLOWLIST", "AUTO_BUILDER_ADMIN_WRITE_ENABLED"] },
  heygen_video_bridge: { requiredAll: ["HEYGEN_API_KEY"] },
  higgsfield_media_bridge: { requiredAnyGroups: [["HIGGINGFIELD_API_KEY", "HIGGSFIELD_API_KEY"]] }
};

function missingRequirementNames(requirement: EnvRequirement | undefined) {
  if (!requirement) return ["recognized_bridge_id"];
  const missingAll = (requirement.requiredAll || []).filter((name) => !process.env[name]);
  const missingAny = (requirement.requiredAnyGroups || [])
    .filter((group) => !group.some((name) => Boolean(process.env[name])))
    .map((group) => group.join("|"));
  return [...missingAll, ...missingAny];
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const bridgeId = String(body.bridgeId || body.bridge_id || "unknown");
  const requirement = envRequirementsByBridge[bridgeId];
  const missingEnvNames = missingRequirementNames(requirement);
  const hasHardGate = missingEnvNames.length > 0;

  return NextResponse.json({
    status: hasHardGate ? "hard_gate" : "dry_run_passed",
    mutation: false,
    receipt: {
      kind: hasHardGate ? "hard_gate" : "validation",
      bridgeId,
      operation: "connector_dry_run",
      riskClass: 1,
      approvalState: "not_required",
      missingEnvNames,
      summary: hasHardGate
        ? "Connector cannot be live-smoked until required env names are configured or bridge id is recognized."
        : "Connector has required env names present. Live external calls remain disabled in this dry-run scaffold."
    },
    nextAction: hasHardGate
      ? "Configure missing env names through approved secret channels, then repeat dry-run."
      : "Run approved harmless live receipt test from the connector-specific runner."
  }, { status: hasHardGate ? 428 : 200 });
}

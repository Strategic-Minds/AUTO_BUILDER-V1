import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ConnectorContract = {
  bridgeId: string;
  requiredEnvNames: string[];
  approvalGate: string;
};

const connectorContracts: ConnectorContract[] = [
  { bridgeId: "gmail_connector_bridge", requiredEnvNames: ["GOOGLE_WORKSPACE_CLIENT_ID", "GOOGLE_WORKSPACE_CLIENT_SECRET", "GOOGLE_WORKSPACE_REFRESH_TOKEN", "GMAIL_SEND_ALLOWLIST"], approvalGate: "send email or modify mailbox" },
  { bridgeId: "google_calendar_connector_bridge", requiredEnvNames: ["GOOGLE_WORKSPACE_CLIENT_ID", "GOOGLE_WORKSPACE_CLIENT_SECRET", "GOOGLE_WORKSPACE_REFRESH_TOKEN", "GOOGLE_CALENDAR_ID_ALLOWLIST"], approvalGate: "create/update/delete event" },
  { bridgeId: "metricool_connector_bridge", requiredEnvNames: ["METRICOOL_API_KEY", "METRICOOL_BRAND_ID", "METRICOOL_PROFILE_ALLOWLIST"], approvalGate: "schedule, publish, profile mutation" },
  { bridgeId: "google_chat_operator_bridge", requiredEnvNames: ["GOOGLE_CHAT_WEBHOOK_URL", "GOOGLE_CHAT_SPACE_ID", "GOOGLE_CHAT_BOT_TOKEN"], approvalGate: "send operator message" },
  { bridgeId: "n8n_connector_bridge", requiredEnvNames: ["N8N_BASE_URL", "N8N_API_KEY", "N8N_WEBHOOK_SECRET"], approvalGate: "execute external workflow" },
  { bridgeId: "playwright_external_runner_bridge", requiredEnvNames: ["BROWSER_WORKER_TOKEN", "PLAYWRIGHT_RUNNER_URL", "PLAYWRIGHT_SCREENSHOT_BUCKET"], approvalGate: "credentialed browser action" },
  { bridgeId: "supabase_state_bridge", requiredEnvNames: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_BRIDGE_TABLE_ALLOWLIST", "SUPABASE_BRIDGE_RPC_ALLOWLIST", "AUTO_BUILDER_ADMIN_WRITE_ENABLED"], approvalGate: "schema, RLS, writes, RPC" }
];

function envStatus(requiredEnvNames: string[]) {
  const present = requiredEnvNames.filter((name) => Boolean(process.env[name]));
  const missing = requiredEnvNames.filter((name) => !process.env[name]);
  return { presentEnvNames: present, missingEnvNames: missing, ready: missing.length === 0 };
}

export async function GET() {
  const connectors = connectorContracts.map((contract) => ({
    bridgeId: contract.bridgeId,
    approvalGate: contract.approvalGate,
    ...envStatus(contract.requiredEnvNames),
    mutation: false
  }));

  return NextResponse.json({
    status: "ok",
    mutation: false,
    secretsPolicy: "names_and_presence_only_never_values",
    connectors,
    nextAction: "Run connector dry-runs. Missing env names are hard gates until configured through approved secret channels."
  });
}

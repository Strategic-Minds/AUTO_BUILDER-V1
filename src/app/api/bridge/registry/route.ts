import { NextResponse } from "next/server";
import { bridgeRegistry } from "@/lib/autobuilder/mcp-core";

export const dynamic = "force-dynamic";

const recursiveBridgeIds = [
  "gpt_cloud_control_plane",
  "github_repo_bridge",
  "vercel_runtime_bridge",
  "vercel_workflow_bridge",
  "vercel_sandbox_bridge",
  "supabase_state_bridge",
  "drive_source_truth_bridge",
  "gmail_connector_bridge",
  "google_calendar_connector_bridge",
  "google_chat_operator_bridge",
  "n8n_connector_bridge",
  "playwright_external_runner_bridge",
  "local_device_relay",
  "metricool_connector_bridge",
  "heygen_video_bridge",
  "higgsfield_media_bridge",
  "shopify_commerce_bridge",
  "stripe_finance_bridge",
  "connector_unblock_router",
  "audit_receipt_recovery_bridge"
];

export async function GET() {
  return NextResponse.json({
    ...bridgeRegistry(),
    recursiveClearance: {
      version: "2026-06-07",
      status: "promoted_for_preview_smoke",
      mutation: false,
      bridgeCount: recursiveBridgeIds.length,
      bridgeIds: recursiveBridgeIds,
      operatorMessaging: "Google Chat",
      removedDefaultAssumption: "Slack is not the operator bridge for this clearance lane.",
      smokeOrder: [
        "GET /api/bridge/registry",
        "GET /api/bridge/connectors/status",
        "POST /api/bridge/connectors/dry-run",
        "POST /api/bridge/connectors/execute-approved",
        "GET /api/bridge/unblock/scan"
      ],
      rule: "Do not mark a blocker resolved without live evidence or a hard-gate receipt."
    }
  });
}

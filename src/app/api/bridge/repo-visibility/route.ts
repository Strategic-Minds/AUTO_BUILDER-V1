import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const repos = [
  {
    role: "orchestration_runtime",
    name: "Strategic-Minds/AUTO_BUILDER",
    branch: "auto-builder/autonomous-bridge-suite-20260606",
    pullRequest: 13,
    visibility: "read_contract_and_preview_routes",
    canMutateFromFrontend: false
  },
  {
    role: "frontend_command_center",
    name: "Strategic-Minds/v0-auto-builder-v2",
    branch: "ui/autonomous-bridge-command-center-20260606",
    pullRequest: 1,
    visibility: "ui_registry_and_action_surfaces",
    canMutateFromFrontend: false
  }
];

const bidirectionalModel = {
  currentState: "read_sync_ready_command_write_pending",
  frontendReads: [
    "/api/bridge/registry",
    "/api/bridge/env-names",
    "/api/bridge/smoke",
    "/api/bridge/supabase-admin",
    "/api/bridge/repo-visibility"
  ],
  frontendWrites: {
    status: "not_enabled_yet",
    reason: "Frontend command submission must go through a token-authenticated queue route with receipts and approval gates before live mutation is allowed.",
    intendedRoute: "/api/bridge/command"
  },
  v0RepoVisibility: {
    status: "contract_visible",
    limitation: "v0 can display repo/action-surface state from bridge routes, but direct GitHub mutation remains server-side and approval-gated."
  }
};

export async function GET() {
  return NextResponse.json({
    status: "ready",
    mutation: false,
    source: "repo_visibility_bridge_contract",
    repos,
    bidirectionalModel,
    operatorMessaging: {
      primary: "google_chat_operator_bridge",
      removed: "slack_operator_bridge"
    },
    payments: {
      primaryForNow: "shopify_payments",
      stripe: "deferred_until_payday_phase"
    }
  }, {
    headers: {
      "access-control-allow-origin": "*",
      "cache-control": "no-store"
    }
  });
}

import { NextResponse } from "next/server";
import { telemetryStoreStatus } from "@/lib/telemetry-store";

export const dynamic = "force-dynamic";

const docs = [
  "docs/autobuilder-generator/00_REPO_ANALYSIS_AND_FEATURE_TODO.md",
  "docs/autobuilder-generator/01_GENERATOR_SYSTEM_BRIEF.md",
  "docs/autobuilder-generator/02_VERCEL_WORKFLOW_SANDBOX_AI_GATEWAY_CRON_PACKET.md",
  "docs/autobuilder-generator/03_FRONTEND_ALIGNMENT_CONTRACT.md"
];

const panels = [
  { id: "generator_status", label: "Generator Status", state: "installed" },
  { id: "queue_receipts", label: "Queue And Receipts", state: "persistence_gated" },
  { id: "approvals", label: "Approvals", state: "required_for_mutation" },
  { id: "build_packet", label: "Build Packet", state: "docs_installed" },
  { id: "browser_evidence", label: "Browser Evidence", state: "workflow_ready" }
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    mutation: false,
    source: "autobuilder_generator_public_status",
    state: "installed_cron_protected_execution_gated",
    route: {
      publicStatus: "/api/generator/status",
      protectedGenerator: "/api/cron/autobuilder-generator",
      protectedBy: ["CRON_SECRET", "CRON_API_TOKEN"]
    },
    cadence: "*/5 * * * *",
    docs,
    panels,
    queuePersistence: {
      state: "scaffold_ready_write_gated",
      telemetry: telemetryStoreStatus(),
      requiredBeforeWrites: [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_BRIDGE_TABLE_ALLOWLIST includes runtime_telemetry_events and queue_jobs",
        "AUTO_BUILDER_ADMIN_WRITE_ENABLED=true",
        "approvalId for risk class 2+"
      ]
    },
    smoke: {
      generatorWorkflow: ".github/workflows/awos-generator-factory-smoke.yml",
      bridgeWorkflow: ".github/workflows/awos-autonomous-bridge-smoke.yml",
      browserEvidence: "pending_artifacts"
    },
    governance: {
      autonomous: ["inspect", "plan", "dry_run_queue", "validate", "record_read_receipt"],
      approvalRequired: ["persistent_queue_write", "supabase_mutation", "production_deploy", "env_mutation", "google_chat_send", "commerce_or_billing", "credentialed_browser_action"]
    }
  }, { headers: { "cache-control": "no-store", "access-control-allow-origin": "*" } });
}

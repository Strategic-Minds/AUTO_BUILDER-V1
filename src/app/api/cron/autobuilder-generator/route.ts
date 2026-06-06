import { NextRequest, NextResponse } from "next/server";
import { authorizeCronRequest } from "@/lib/cron-auth";
import { insertTelemetry, telemetryStoreStatus } from "@/lib/telemetry-store";

export const dynamic = "force-dynamic";

const featureGroups = [
  "control_plane",
  "generator_os",
  "vercel_workflow",
  "vercel_sandbox",
  "ai_gateway_agents",
  "browser_qa",
  "supabase_telemetry",
  "frontend_v0",
  "github_release",
  "google_chat_operator",
  "commerce_payments",
  "local_device_phone_bridge"
];

const generatorAgents = [
  "master_brain_agent",
  "repo_analyst_agent",
  "reverse_engineer_agent",
  "build_packet_agent",
  "sandbox_planner_agent",
  "frontend_alignment_agent",
  "workflow_agent",
  "qa_agent",
  "governance_agent",
  "recovery_agent"
];

const workflowSteps = [
  "rehydrate_source_truth",
  "read_repo_and_frontend_state",
  "define_done_state",
  "reverse_engineer_delta",
  "generate_feature_todo_matrix",
  "generate_build_packet",
  "generate_sandbox_tasks",
  "generate_frontend_alignment_payload",
  "record_receipt",
  "stop_at_approval_gates"
];

const sandboxPlan = {
  runtime: "node24",
  allowNetwork: false,
  artifactPath: "generator-artifact.json",
  usesLiveSecrets: false,
  allowed: ["validate_generated_packet", "validate_schema", "simulate_harmless_build", "produce_artifact_receipt"],
  blocked: ["production_deploy", "secret_mutation", "database_mutation", "billing", "publishing", "credentialed_browser_action"]
};

const sourceTruth = [
  "docs/autobuilder-generator/00_REPO_ANALYSIS_AND_FEATURE_TODO.md",
  "docs/autobuilder-generator/01_GENERATOR_SYSTEM_BRIEF.md",
  "docs/autobuilder-generator/02_VERCEL_WORKFLOW_SANDBOX_AI_GATEWAY_CRON_PACKET.md",
  "docs/autobuilder-generator/03_FRONTEND_ALIGNMENT_CONTRACT.md",
  "docs/awos-max-autonomy/00_SOURCE_OF_TRUTH_MAP.md",
  "docs/awos-max-autonomy/06_VERCEL_WORKFLOW_AND_CRON_PLAN.md",
  "docs/awos-max-autonomy/09_BUILD_PACKET.md"
];

function bucketKey(date = new Date()) {
  const ms = date.getTime();
  const bucket = 5 * 60 * 1000;
  return new Date(Math.floor(ms / bucket) * bucket).toISOString();
}

export async function GET(request: NextRequest) {
  const authorization = authorizeCronRequest(request);
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.reason, authorization }, { status: authorization.status });
  }

  const generatedAt = new Date().toISOString();
  const bucket = bucketKey(new Date(generatedAt));
  const receipt = {
    receipt_id: `autobuilder-generator-${bucket}`,
    generated_at: generatedAt,
    bucket_key: bucket,
    actor: "autobuilder-generator-cron",
    mutation: false,
    risk_class: 0,
    approval_state: "not_required",
    result: "generator_plan_ready",
    next_action: "run_generator_smoke_then_implement_queue_persistence_and_frontend_panels"
  };

  const plan = {
    status: "ready",
    mutation: false,
    source: "autobuilder_generator_factory",
    bucketKey: bucket,
    cadence: "*/5 * * * *",
    sourceTruth,
    featureGroups,
    generatorAgents,
    workflowSteps,
    sandboxPlan,
    aiGateway: {
      envName: "AI_GATEWAY_API_KEY",
      mode: "server_only_model_routing",
      secretValuesExposed: false,
      requiresBudgetGuardrails: true
    },
    frontend: {
      repo: "Strategic-Minds/v0-auto-builder-v2",
      route: "/bridges",
      nextPanel: "Generator Factory status, queue, receipts, and approvals"
    },
    governance: {
      autonomous: ["inspect", "plan", "queue_dry_run", "validate", "record_receipt", "draft_google_chat_update"],
      approvalRequired: ["production_deploy", "env_mutation", "supabase_write", "shopify_mutation", "stripe_money_movement", "google_chat_send", "public_publish", "credentialed_browser_action"]
    },
    telemetry: telemetryStoreStatus(),
    receipt
  };

  const telemetry = await insertTelemetry("runtime_telemetry_events", {
    telemetry_key: "autobuilder_generator_factory",
    event_status: "planned",
    event_payload: plan,
    created_at: generatedAt,
    updated_at: generatedAt
  });

  return NextResponse.json({ ok: true, authorization, plan, telemetry }, { headers: { "cache-control": "no-store" } });
}

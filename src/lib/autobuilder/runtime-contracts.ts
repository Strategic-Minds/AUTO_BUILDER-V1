export const protectedGates = [
  "production_deploy",
  "production_db_migration",
  "secret_mutation",
  "shopify_live_write",
  "stripe_payment_action",
  "live_social_publish",
  "customer_message",
  "destructive_action",
  "capital_spend"
] as const;

export const workflowStages = [
  "plan",
  "discovery",
  "brand_options",
  "approval",
  "docs",
  "submit_to_vercel_build",
  "validate",
  "release_operate"
] as const;

export const requiredAgents = [
  "planner",
  "governance",
  "recovery",
  "browser",
  "connector",
  "social",
  "commerce",
  "brand",
  "qa",
  "memory"
] as const;

export function envStatus(names: string[]) {
  return Object.fromEntries(names.map((name) => [name, Boolean(process.env[name])]));
}

export function workflowContract() {
  return {
    ok: true,
    runtime: "vercel_workflow_contract",
    stages: workflowStages,
    cron: "*/5 * * * *",
    defaultMutationMode: "non_mutating_until_approved_queue_item_exists",
    idempotency: "bucketed_by_5_minute_tick_or_build_packet_id",
    retries: "bounded_retry_with_dead_letter_receipt",
    protectedGates,
    requiredRoutes: [
      "/api/workflows/status",
      "/api/cron/autobuilder-generator",
      "/api/bridge/retry",
      "/api/cron/social-bridge"
    ]
  };
}

export function sandboxContract() {
  return {
    ok: true,
    runtime: "vercel_sandbox_contract",
    defaultMode: "branch_scoped_preview_only",
    records: ["sandbox_run", "branch_ref", "preview_url", "screenshot_receipt", "rollback_ref"],
    protectedGates,
    executionBoundary: "Vercel executes builds from packets; GPT/AUTO BUILDER orchestrates and validates."
  };
}

export function agentContract() {
  return {
    ok: true,
    runtime: "vercel_agents_contract",
    agents: requiredAgents.map((agent) => ({
      id: agent,
      status: "contract_ready",
      allowed: ["read", "plan", "draft", "queue", "validate", "receipt"],
      blocked: protectedGates,
      receiptsRequired: true
    })),
    protectedGates
  };
}

export function aiGatewayContract() {
  return {
    ok: true,
    runtime: "ai_gateway_contract",
    env: envStatus(["AI_GATEWAY_API_KEY", "AI_GATEWAY_BASE_URL", "OPENAI_API_KEY", "GROQ_API_KEY"]),
    modelPolicy: {
      allowlistRequired: true,
      budgetCapsRequired: true,
      costReceiptsRequired: true,
      fallbackAllowed: "approved_provider_or_direct_openai_with_cost_receipt"
    }
  };
}

export function googleChatContract() {
  return {
    ok: true,
    runtime: "google_chat_operator_bridge",
    env: envStatus(["GOOGLE_CHAT_WEBHOOK_URL", "GOOGLE_CHAT_SPACE_ID", "GOOGLE_CHAT_BOT_TOKEN"]),
    defaultMode: "draft_only",
    sendRequires: ["approvalState=approved", "GOOGLE_CHAT_SEND_ENABLED=true"],
    fallback: "in_app_approval_queue"
  };
}

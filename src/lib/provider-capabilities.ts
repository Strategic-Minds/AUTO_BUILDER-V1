export const providerCapabilities = {
  github: ["read", "write", "admin", "repo", "workflow", "pull_request"],
  vercel: ["deploy", "logs", "project", "domain", "env", "workflow", "sandbox", "agents", "cron"],
  supabase: ["database", "storage", "auth", "advisors", "branching", "sql", "edge_functions", "live_bridge_actions"],
  shopify: ["products", "themes", "pages", "discounts", "customers", "orders"],
  google_workspace: ["gmail", "drive", "docs", "sheets", "calendar", "tasks"],
  google_chat: ["approval_messages", "webhooks", "spaces", "operator_notifications"],
  openai: ["responses", "files", "vector_stores", "batches", "agents"],
  ai_gateway: ["model_routing", "fallback", "cost_receipts", "budget_caps"],
  groq: ["chat", "fast-inference"],
  codex: ["coding", "repo_patch", "pr_handoff", "branch_jobs", "test_runs"],
  n8n: ["webhooks", "workflow_replay", "external_routing", "retry_receipts"],
  playwright: ["browser_smoke", "screenshots", "ui_regression", "local_worker"],
  heygen: ["avatar_video", "voice", "draft_generation"],
  xyla: ["creative_generation", "scheduling", "publishing"],
  metricool: ["social_scheduling", "analytics", "draft_posts", "publish_gated"],
  opus: ["repurposing", "clip_jobs", "captions"]
} as const;

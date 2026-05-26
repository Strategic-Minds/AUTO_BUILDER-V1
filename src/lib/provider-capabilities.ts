export const providerCapabilities = {
  github: ["read", "write", "admin", "repo", "workflow", "pull_request"],
  vercel: ["deploy", "logs", "project", "domain", "env"],
  supabase: ["database", "storage", "auth", "advisors", "branching", "live_bridge_actions"],
  shopify: ["products", "themes", "pages", "discounts", "customers", "orders"],
  google_workspace: ["gmail", "drive", "docs", "sheets", "calendar", "tasks"],
  openai: ["responses", "files", "vector_stores", "batches", "agents"],
  groq: ["chat", "fast-inference"],
  codex: ["coding", "repo_patch", "pr_handoff"],
  xyla: ["creative_generation", "scheduling", "publishing"],
  opus: ["repurposing", "clip_jobs", "captions"]
} as const;

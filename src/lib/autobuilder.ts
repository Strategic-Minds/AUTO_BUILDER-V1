export const repoRoles = {
  source: "Strategic-Minds/AUTO_BUILDER",
  sandbox: "Strategic-Minds/SANDBOX",
  frontend: "Strategic-Minds/FRONTEND"
} as const;

export const entryPrompts = [
  {
    id: "create-system",
    title: "CREATE A SYSTEM",
    starter:
      "Start in the AUTO BUILDER GPT project folder. Use executive intake, self reflection, discovery, brand structuring, sandbox build, source promotion, frontend promotion, validation, and audit until the system is complete."
  },
  {
    id: "create-workflow",
    title: "CREATE A WORKFLOW",
    starter:
      "Start in the AUTO BUILDER GPT project folder. Build a repeatable trigger, scheduler, cron, validation, and approval loop across AUTO_BUILDER, SANDBOX, and FRONTEND."
  },
  {
    id: "create-agent",
    title: "CREATE AN AGENT",
    starter:
      "Start in the AUTO BUILDER GPT project folder. Build a governed agent with memory, tools, approvals, bridge access, validation, and recursive improvement."
  }
] as const;

export const providers = [
  "github",
  "vercel",
  "supabase",
  "shopify",
  "openai",
  "groq",
  "codex",
  "google_workspace",
  "xyla",
  "opus"
] as const;

export const workflow = [
  "executive-intake",
  "self-reflection",
  "discovery",
  "branding",
  "build-in-sandbox",
  "promote-source",
  "promote-frontend",
  "validate",
  "audit",
  "improve"
] as const;

export const factorySurfaces = [
  "/api/factory/readiness",
  "/api/factory/router",
  "/api/factory/build-packet",
  "/api/factory/capability-test",
  "/api/factory/reverse-engineering",
  "/api/bridge/providers/runtime-status",
  "/api/bridge/eden/runtime",
  "/api/bridge/github/workflows",
  "/api/bridge/vercel/eden-preview",
  "/api/bridge/vercel/redeploy",
  "/api/cron/factory-readiness",
  "/api/cron/reverse-engineering-passive"
] as const;

export const readiness = {
  status: "factory-install-required",
  solved: [
    "3 prompt entry contract exists",
    "3 repo operating model exists",
    "frontend promotion model exists",
    "validation and audit endpoints exist",
    "GPT alignment docs exist",
    "one-hour build factory runtime surfaces now exist",
    "passive reverse-engineering and capability test routes now exist",
    "Eden Skye Studios Vercel preview executor bridge exists",
    "Governed Vercel redeploy bridge exists",
    "Governed GitHub workflow reader and dispatcher bridge exists",
    "Eden universal runtime bridge exists for GitHub, Vercel, Supabase, Drive, Shopify, and HeyGen"
  ],
  nextActions: [
    "Add production environment variables in Vercel",
    "Connect Supabase persistence",
    "Connect the GPT project actions to the published routes",
    "Promote the frontend app into the FRONTEND deployment",
    "Install the canonical factory schema, queues, templates, and workers into the live repo"
  ]
} as const;

export const audit = {
  surfaces: [
    "GPT project surface",
    "workflow system",
    "template system",
    "shopify operating surface",
    "frontend delivery surface",
    "one-hour build factory",
    "passive reverse-engineering system",
    "Eden universal runtime bridge",
    "Eden Vercel preview executor",
    "Governed Vercel redeploy executor",
    "Governed GitHub workflow executor and reader"
  ],
  status: "factory-scaffold-ready"
} as const;

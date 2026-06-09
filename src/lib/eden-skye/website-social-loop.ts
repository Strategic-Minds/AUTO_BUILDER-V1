const METRICOOL_BASE_URL_ENVS = [
  "METRICOOL_API_URL",
  "METRICOOL_BASE_URL",
  "METRICOOL_API_BASE_URL",
  "METRICOOL_URL",
  "METRICOOL_ENDPOINT",
  "METRICOOL_API_ENDPOINT",
  "EDEN_METRICOOL_API_URL",
  "EDEN_SKYE_METRICOOL_API_URL",
  "EDEN_SKYE_METRICOOL_BASE_URL"
];

const METRICOOL_TOKEN_ENVS = [
  "METRICOOL_API_TOKEN",
  "METRICOOL_API_KEY",
  "METRICOOL_TOKEN",
  "EDEN_METRICOOL_API_KEY",
  "EDEN_SKYE_METRICOOL_API_KEY",
  "EDEN_SKYE_METRICOOL_TOKEN"
];

const SHOPIFY_TOKEN_ENVS = [
  "SHOPIFY_ADMIN_TOKEN",
  "SHOPIFY_ACCESS_TOKEN",
  "SHOPIFY_ADMIN_ACCESS_TOKEN",
  "SHOPIFY_API_TOKEN",
  "EDEN_CLOSET_SHOPIFY_ADMIN_TOKEN",
  "XYLA_SHOPIFY_ADMIN_TOKEN"
];

const SHOPIFY_SHOP_ENVS = [
  "SHOPIFY_SHOP",
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_SHOP_DOMAIN",
  "SHOPIFY_STORE_URL",
  "SHOPIFY_DOMAIN",
  "SHOPIFY_STORE",
  "EDEN_CLOSET_SHOPIFY_SHOP",
  "EDEN_CLOSET_SHOPIFY_STORE_DOMAIN",
  "XYLA_SHOPIFY_SHOP",
  "XYLA_SHOPIFY_STORE_DOMAIN"
];

function envPresent(name: string) {
  return Boolean(process.env[name]);
}

function readyAny(names: string[]) {
  return names.some(envPresent);
}

export function getEdenSkyeWebsiteSocialLoopReadiness() {
  const env = {
    vercel: envPresent("VERCEL_TOKEN") && readyAny(["EDEN_SKYE_VERCEL_PROJECT_ID", "TARGET_VERCEL_PROJECT_ID"]),
    supabase: envPresent("SUPABASE_SERVICE_ROLE_KEY") && readyAny(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]),
    googleWorkspace: envPresent("GOOGLE_CLIENT_EMAIL") && envPresent("GOOGLE_PRIVATE_KEY"),
    heygen: envPresent("HEYGEN_API_KEY"),
    metricool: readyAny(METRICOOL_BASE_URL_ENVS) && readyAny(METRICOOL_TOKEN_ENVS),
    shopifyXyla: readyAny(SHOPIFY_TOKEN_ENVS) && readyAny(SHOPIFY_SHOP_ENVS),
    aiGateway: envPresent("AI_GATEWAY_API_KEY"),
    stripeOrShopifyPayments: readyAny(["STRIPE_SECRET_KEY", ...SHOPIFY_TOKEN_ENVS])
  };

  return {
    ok: true,
    productionActionAllowed: false,
    secretsExposed: false,
    targetDomain: "edenskyestudios.com",
    readiness: env,
    acceptedEnvAliases: {
      metricoolBaseUrl: METRICOOL_BASE_URL_ENVS,
      metricoolToken: METRICOOL_TOKEN_ENVS,
      shopifyToken: SHOPIFY_TOKEN_ENVS,
      shopifyShop: SHOPIFY_SHOP_ENVS
    },
    readyForDraftLoop: env.vercel && env.supabase && env.googleWorkspace && env.aiGateway,
    readyForWebsiteBuildDraft: env.vercel && env.supabase,
    readyForMetricoolDraftScheduling: env.metricool,
    readyForXylaViaShopifyDrafts: env.shopifyXyla,
    readyForHeyGenDrafts: env.heygen,
    readyForPaidMembershipActivation: false,
    paidMembershipBlocker: "Eden's Closet/Black Card membership billing, age-gating, adult-content compliance, terms, privacy, consent, and payout flows require explicit owner approval before activation."
  };
}

export function getEdenSkyeAgents() {
  return [
    {
      id: "eden-master-orchestrator",
      role: "Owns the DISCOVER -> PLAN -> CREATE -> VALIDATE -> SCHEDULE -> ANALYZE -> HEAL loop.",
      autonomy: "draft_and_queue",
      approvalRequiredFor: ["Drive writes", "publishing", "paid generation", "billing", "adult membership activation"]
    },
    {
      id: "eden-website-builder",
      role: "Builds edenskyestudios.com frontend/backend drafts, Eden's Closet routes, account pages, and model landing surfaces.",
      autonomy: "sandbox_build",
      approvalRequiredFor: ["production deploy", "domain alias", "payment activation"]
    },
    {
      id: "eden-social-producer",
      role: "Creates captions, image/video prompts, platform variants, and Metricool draft packets.",
      autonomy: "draft_only",
      approvalRequiredFor: ["public post", "comment", "DM", "sponsored content"]
    },
    {
      id: "eden-media-librarian",
      role: "Indexes model images, faceless account assets, taxonomy, quarantine, and Drive manifests.",
      autonomy: "read_and_queue",
      approvalRequiredFor: ["image upload", "Drive archive write", "sensitive asset release"]
    },
    {
      id: "eden-compliance-guardian",
      role: "Enforces age-gating, consent, content safety classes, adult membership guardrails, and approval gates.",
      autonomy: "block_or_escalate",
      approvalRequiredFor: ["any bypass or policy downgrade"]
    },
    {
      id: "eden-growth-optimizer",
      role: "Runs A/B test plans, conversion reviews, funnel scoring, publish-window recommendations, and self-reflection reports.",
      autonomy: "analysis_and_recommendation",
      approvalRequiredFor: ["pricing change", "campaign launch", "ad spend"]
    }
  ];
}

export function getEdenSkyeWorkflowPlan() {
  return {
    loopName: "eden-skye-website-social-automation-loop",
    cadence: "5-minute validator plus hourly planning and daily strategy/reflection passes",
    productionActionAllowed: false,
    lifecycle: [
      "discover trends, model opportunities, website funnel gaps, and content themes",
      "plan model/account calendar, Eden's Closet offers, website experiments, and social variants",
      "create draft content, website tasks, image/video prompts, membership copy, and queue records",
      "quarantine failed, sensitive, incomplete, noncompliant, or low-confidence outputs",
      "validate links, assets, claims, safety class, schedule windows, and approval gates",
      "schedule approved drafts through Metricool or Shopify/Xyla draft packets only",
      "analyze telemetry, engagement, conversions, queue health, and blocker state",
      "auto-heal safe metadata, regenerate draft alternatives, and produce fix PRs or tasks",
      "optimize A/B tests, model variants, website funnels, and membership conversion paths",
      "reflect into memory, update taxonomy, and queue the next loop"
    ],
    websiteSurfaces: [
      "/",
      "/models",
      "/models/[slug]",
      "/faceless",
      "/eden-closet",
      "/black-card",
      "/members/sign-in",
      "/members/account",
      "/members/age-gate",
      "/api/eden-skye/loop",
      "/api/eden-skye/membership/draft-checkout",
      "/api/eden-skye/content/queue",
      "/api/eden-skye/metricool/draft",
      "/api/eden-skye/shopify-xyla/draft"
    ],
    backendObjects: [
      "models",
      "model_personas",
      "faceless_accounts",
      "media_assets",
      "asset_quarantine",
      "taxonomy_terms",
      "content_items",
      "publishing_queue",
      "engagement_queue",
      "membership_products",
      "membership_entitlements",
      "age_gate_receipts",
      "experiments",
      "agent_runs",
      "memory_entries",
      "receipts"
    ],
    governance: {
      adultMembership: "Design and draft only until owner approval. Require age gate, consent records, legal pages, payment processor compliance, and no autonomous adult-content publication.",
      socialPosting: "Metricool draft scheduling may be prepared; public posting, comments, DMs, and responses require approval.",
      payments: "Checkout and membership activation require explicit approval and configured processor compliance.",
      drive: "Drive writes/imports/uploads require full dry-run PASS and exact approval.",
      quarantine: "Any failed validation, missing consent, sensitive media, broken link, rejected claim, or uncertain asset routes to quarantine."
    }
  };
}

export function buildEdenSkyeLoopDryRun() {
  const readiness = getEdenSkyeWebsiteSocialLoopReadiness();
  const workflow = getEdenSkyeWorkflowPlan();
  const agents = getEdenSkyeAgents();

  return {
    ok: true,
    productionActionAllowed: false,
    status: "dry_run_pass",
    noMutationPerformed: true,
    noPublishingPerformed: true,
    noPaymentActivated: true,
    noAdultContentPublished: true,
    readiness,
    workflow,
    agents,
    queuesToMaterialize: [
      "website_build_queue",
      "model_registry_queue",
      "media_generation_queue",
      "metricool_draft_queue",
      "shopify_xyla_draft_queue",
      "eden_closet_membership_queue",
      "approval_gate_queue",
      "quarantine_queue",
      "reflection_memory_queue"
    ],
    nextAction: "Run preview validation, then request approval before Drive writes, payment activation, public posting, or paid media generation."
  };
}

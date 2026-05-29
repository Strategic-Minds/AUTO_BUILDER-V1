import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type ForbiddenFruitPersona = {
  id?: string;
  persona_key: string;
  display_name: string;
  persona_number?: number | null;
  parent_brand: string;
  archetype: string;
  audience_promise: string;
  ai_disclosure: string;
  age_rating: string;
  status: string;
  policy_risk_level: string;
  boundaries_json?: Record<string, unknown>;
  metadata_json?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type PersonaAsset = {
  id?: string;
  persona_key: string;
  persona_id?: string;
  asset_key: string;
  asset_role: string;
  asset_type: string;
  content_rating?: string;
  source_path?: string | null;
  public_url?: string | null;
  storage_provider?: string | null;
  status: string;
  approval_required: boolean;
  metadata_json?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type PromptBankItem = {
  id?: string;
  persona_key: string;
  persona_id?: string;
  tool_surface: string;
  prompt_name: string;
  prompt_type: string;
  prompt_text: string;
  negative_prompt?: string | null;
  reference_asset_key?: string | null;
  status: string;
  risk_level: string;
  approval_required: boolean;
  metadata_json?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type ContentQueueItem = {
  id?: string;
  persona_key: string;
  persona_id?: string;
  platform: string;
  content_pillar: string;
  product_type?: string;
  content_type?: string;
  title: string;
  description?: string | null;
  caption?: string | null;
  first_comment?: string | null;
  asset_keys: string[];
  price_cents?: number | null;
  scheduled_for?: string | null;
  timezone: string;
  status: string;
  risk_level: string;
  content_rating?: string;
  approval_request_id?: string | null;
  external_job_id?: string | null;
  external_url?: string | null;
  metadata_json?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type InteractionMode = {
  id?: string;
  persona_key: string;
  mode_key: string;
  mode_type: string;
  display_name: string;
  user_promise: string;
  status: string;
  risk_level: string;
  age_gate_required: boolean;
  ai_disclosure_required: boolean;
  approval_required: boolean;
  moderation_required: boolean;
  boundaries_json?: Record<string, unknown>;
  metadata_json?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type ApprovalEvent = {
  id?: string;
  persona_key?: string | null;
  target_table: string;
  target_id: string;
  action_requested: string;
  risk_level: string;
  status: string;
  requested_by?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  evidence_json?: Record<string, unknown>;
  blocker?: string | null;
  workaround?: string | null;
  rollback_path?: string | null;
  created_at?: string;
};

export type SignalLog = {
  id?: string;
  persona_key?: string | null;
  persona_id?: string;
  content_product_id?: string | null;
  content_queue_id?: string | null;
  interaction_mode_id?: string | null;
  platform: string;
  measured_at?: string;
  impressions?: number;
  views?: number;
  watch_time_seconds?: number;
  likes?: number;
  comments?: number;
  saves?: number;
  shares?: number;
  clicks?: number;
  email_opt_ins?: number;
  product_views?: number;
  purchases?: number;
  revenue_cents?: number;
  metadata_json?: Record<string, unknown>;
  created_at?: string;
};

export type EdenReviewData = {
  personas: ForbiddenFruitPersona[];
  personaAssets: PersonaAsset[];
  promptBank: PromptBankItem[];
  contentQueue: ContentQueueItem[];
  interactionModes: InteractionMode[];
  approvalEvents: ApprovalEvent[];
  signalLogs: SignalLog[];
};

export type EdenReadResult<T> = {
  source: "supabase" | "static_seed";
  rows: T[];
  blockers: string[];
};

export type ReadinessSnapshot = {
  status: "sandbox_ready" | "needs_review" | "blocked";
  source: "supabase" | "static_seed" | "mixed";
  counts: Record<string, number>;
  blockers: string[];
  approvalGates: string[];
  nextActions: string[];
};

const TABLES = {
  personas: "forbidden_fruit_personas",
  personaAssets: "persona_assets",
  promptBank: "persona_prompt_bank",
  contentQueue: "content_products",
  interactionModes: "interaction_modes",
  approvalEvents: "approval_events",
  signalLogs: "signal_logs"
} as const;

export const edenSeedData: EdenReviewData = {
  personas: [
    {
      persona_key: "eden-skye",
      display_name: "Eden Skye",
      persona_number: 1,
      parent_brand: "Forbidden Fruit",
      archetype: "premium brunette luxury muse",
      audience_promise: "Cinematic adult AI fantasy entertainment with clear fictional disclosure and governed interaction boundaries.",
      ai_disclosure: "Eden Skye is a fictional AI persona for adult fantasy entertainment.",
      age_rating: "adult_only",
      status: "needs_review",
      policy_risk_level: "high",
      boundaries_json: {
        required: "adult-only, fictional AI disclosure, no real-person impersonation, no minors, no coercive or non-consensual scenarios",
        blocked: ["underage or ambiguous age presentation", "real-person impersonation", "unsupported relationship claims", "unapproved explicit generation"]
      },
      metadata_json: { parent_company: "Forbidden Fruit", persona_label: "Persona 001" }
    }
  ],
  personaAssets: [
    {
      persona_key: "eden-skye",
      persona_id: "eden-skye",
      asset_key: "eden-master-reference-01",
      asset_role: "master_reference",
      asset_type: "image",
      content_rating: "adult_safe",
      source_path: "user_files/01-ChatGPT-Image-May-28-2026-05_56_46-PM.png",
      public_url: null,
      storage_provider: "pending_asset_store",
      status: "draft",
      approval_required: true,
      metadata_json: { lane: "persona_identity", use: "visual continuity reference", parent_company: "Forbidden Fruit" }
    },
    {
      persona_key: "eden-skye",
      persona_id: "eden-skye",
      asset_key: "eden-voice-style-guide",
      asset_role: "voice_reference",
      asset_type: "doc",
      content_rating: "adult_safe",
      source_path: "docs/sol-persistent-live-avatar/eden-skye-operating-pack/CHARACTER_BIBLE.md",
      public_url: null,
      storage_provider: "repo",
      status: "draft",
      approval_required: true,
      metadata_json: { lane: "brand_governance", use: "caption and script continuity", parent_company: "Forbidden Fruit" }
    }
  ],
  promptBank: [
    {
      persona_key: "eden-skye",
      persona_id: "eden-skye",
      tool_surface: "kling",
      prompt_name: "Hero loop - cinematic avatar continuity",
      prompt_type: "video_generation",
      prompt_text: "Generate a short cinematic Eden Skye lifestyle loop using the approved master reference only. Maintain face, wardrobe, hair, lighting, and luxury fantasy-entertainment tone. Keep the result fictional, adult, suggestive-safe, and non-explicit.",
      negative_prompt: "No face drift, no exaggerated glamour, no unreadable text, no medical claims, no financial guarantees, no explicit nudity, no underage cues, no real-person resemblance.",
      reference_asset_key: "eden-master-reference-01",
      status: "draft",
      risk_level: "high",
      approval_required: true,
      metadata_json: { duration_seconds: 5, approval_gate: "visual_identity_and_policy" }
    },
    {
      persona_key: "eden-skye",
      persona_id: "eden-skye",
      tool_surface: "heygen",
      prompt_name: "Thirty-second AI disclosure welcome script",
      prompt_type: "avatar_script",
      prompt_text: "Welcome to Forbidden Fruit. I am Eden Skye, a fictional AI persona built for adult fantasy entertainment. Every experience here is designed, reviewed, and bounded before it reaches you.",
      negative_prompt: null,
      reference_asset_key: "eden-voice-style-guide",
      status: "draft",
      risk_level: "high",
      approval_required: true,
      metadata_json: { approval_gate: "voice_identity_ai_disclosure_and_policy" }
    },
    {
      persona_key: "eden-skye",
      persona_id: "eden-skye",
      tool_surface: "metricool",
      prompt_name: "Caption seed - Forbidden Fruit teaser",
      prompt_type: "social_caption",
      prompt_text: "Forbidden Fruit starts with one rule: the fantasy is designed before it is released. Persona 001: Eden Skye. Fictional AI. Adult-only brand world.",
      negative_prompt: null,
      reference_asset_key: "eden-master-reference-01",
      status: "draft",
      risk_level: "high",
      approval_required: true,
      metadata_json: { approval_gate: "public_distribution_and_platform_policy" }
    }
  ],
  contentQueue: [
    {
      persona_key: "eden-skye",
      persona_id: "eden-skye",
      platform: "Instagram",
      content_pillar: "Forbidden Fruit Teaser",
      product_type: "social_teaser",
      content_type: "social_teaser",
      title: "Persona 001 reveal",
      description: "Social-safe teaser for Forbidden Fruit Persona 001.",
      caption: "Persona 001: Eden Skye. Fictional AI. Adult-only fantasy-entertainment brand world. Built with rules before release.",
      first_comment: null,
      asset_keys: ["eden-master-reference-01"],
      scheduled_for: null,
      timezone: "America/New_York",
      status: "needs_review",
      risk_level: "high",
      content_rating: "adult_safe",
      approval_request_id: null,
      metadata_json: { source: "metricool-calendar-seed", approval_gate: "public_distribution" }
    },
    {
      persona_key: "eden-skye",
      persona_id: "eden-skye",
      platform: "Shopify",
      content_pillar: "Digital Download",
      product_type: "digital_download",
      content_type: "digital_download",
      title: "Eden Skye cinematic intro pack",
      description: "Draft product concept for a downloadable fictional AI persona video/image pack. Not approved for live checkout.",
      caption: null,
      first_comment: null,
      asset_keys: ["eden-master-reference-01", "eden-voice-style-guide"],
      scheduled_for: null,
      timezone: "America/New_York",
      status: "draft",
      risk_level: "high",
      content_rating: "adult_safe",
      approval_request_id: null,
      metadata_json: { source: "shopify-offer-asset-sheet", approval_gate: "commerce_policy_validation" }
    }
  ],
  interactionModes: [
    {
      persona_key: "eden-skye",
      mode_key: "eden-chat-preview",
      mode_type: "chat",
      display_name: "Eden Skye Chat Preview",
      user_promise: "Scripted adult fantasy chat with clear AI disclosure and blocked-topic moderation.",
      status: "draft",
      risk_level: "high",
      age_gate_required: true,
      ai_disclosure_required: true,
      approval_required: true,
      moderation_required: true,
      boundaries_json: { requires: ["age_gate", "ai_disclosure", "moderation", "privacy_notice"], blocked: ["underage content", "real-person impersonation", "coercive or non-consensual roleplay"] },
      metadata_json: { launch_blocker: "moderation and platform policy validation required" }
    },
    {
      persona_key: "eden-skye",
      mode_key: "eden-video-downloads",
      mode_type: "download",
      display_name: "Eden Skye Video Downloads",
      user_promise: "Approved downloadable fictional persona media after storage, payment, and storefront policy validation.",
      status: "draft",
      risk_level: "high",
      age_gate_required: true,
      ai_disclosure_required: true,
      approval_required: true,
      moderation_required: true,
      boundaries_json: { requires: ["age_gate", "ai_disclosure", "content_rating", "payment_policy_validation"], blocked: ["unapproved explicit content", "unreviewed public links"] },
      metadata_json: { launch_blocker: "payment and storage policy validation required" }
    }
  ],
  approvalEvents: [
    {
      persona_key: "eden-skye",
      target_table: "content_products",
      target_id: "00000000-0000-0000-0000-000000000000",
      action_requested: "publish_or_schedule",
      risk_level: "high",
      status: "needs_review",
      requested_by: "AUTO_BUILDER",
      evidence_json: { reason: "Static seed indicates approval flow shape before sandbox table is verified." },
      blocker: "Forbidden Fruit platform policy matrix and sandbox schema are not fully validated.",
      workaround: "Use static read-only queue review until sandbox schema and policy gates are confirmed.",
      rollback_path: "Archive seed queue row before any downstream scheduling."
    }
  ],
  signalLogs: []
};

let readClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

function firstPresent(...values: Array<string | undefined>) {
  return values.find((value) => typeof value === "string" && value.length > 0) || "";
}

function getSupabaseUrl() {
  return firstPresent(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
    process.env.EDEN_SKYE_SUPABASE_URL
  );
}

function getSupabaseAnonKey() {
  return firstPresent(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.EDEN_SKYE_SUPABASE_ANON_KEY
  );
}

function getSupabaseServiceKey() {
  return firstPresent(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.EDEN_SKYE_SUPABASE_SERVICE_ROLE_KEY
  );
}

function getApprovalToken() {
  return firstPresent(process.env.EDEN_SKYE_APPROVAL_TOKEN, process.env.SOL_APPROVAL_TOKEN);
}

function solReadOnlyMode() {
  return process.env.SOL_READ_ONLY_MODE !== "false";
}

function solRequiresApprovals() {
  return process.env.SOL_REQUIRE_APPROVALS !== "false";
}

export function getEdenReadClient() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();
  const anonKey = getSupabaseAnonKey();
  const key = serviceKey || anonKey;

  if (!url || !key) return null;
  if (!readClient) readClient = createClient(url, key);
  return readClient;
}

export function getEdenAdminClient() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  if (!url || !serviceKey) return null;
  if (!adminClient) adminClient = createClient(url, serviceKey);
  return adminClient;
}

async function readTable<T>(table: string, fallback: T[]): Promise<EdenReadResult<T>> {
  const client = getEdenReadClient();
  if (!client) {
    return {
      source: "static_seed",
      rows: fallback,
      blockers: ["Supabase read environment is not configured; serving static Forbidden Fruit / Eden Skye seed data."]
    };
  }

  const { data, error } = await client.from(table).select("*").order("created_at", { ascending: false }).limit(200);
  if (error) {
    return {
      source: "static_seed",
      rows: fallback,
      blockers: [`Supabase read failed for ${table}: ${error.message}`]
    };
  }

  return {
    source: "supabase",
    rows: (data || []) as T[],
    blockers: []
  };
}

export async function readPersonas() {
  return readTable<ForbiddenFruitPersona>(TABLES.personas, edenSeedData.personas);
}

export async function readPersonaAssets() {
  return readTable<PersonaAsset>(TABLES.personaAssets, edenSeedData.personaAssets);
}

export async function readPromptBank() {
  return readTable<PromptBankItem>(TABLES.promptBank, edenSeedData.promptBank);
}

export async function readContentQueue() {
  return readTable<ContentQueueItem>(TABLES.contentQueue, edenSeedData.contentQueue);
}

export async function readInteractionModes() {
  return readTable<InteractionMode>(TABLES.interactionModes, edenSeedData.interactionModes);
}

export async function readApprovalEvents() {
  return readTable<ApprovalEvent>(TABLES.approvalEvents, edenSeedData.approvalEvents);
}

export async function readSignalLogs() {
  return readTable<SignalLog>(TABLES.signalLogs, edenSeedData.signalLogs);
}

export async function readAllEdenReviewData() {
  const [personas, personaAssets, promptBank, contentQueue, interactionModes, approvalEvents, signalLogs] = await Promise.all([
    readPersonas(),
    readPersonaAssets(),
    readPromptBank(),
    readContentQueue(),
    readInteractionModes(),
    readApprovalEvents(),
    readSignalLogs()
  ]);

  const sources = [personas.source, personaAssets.source, promptBank.source, contentQueue.source, interactionModes.source, approvalEvents.source, signalLogs.source];
  const source = sources.every((item) => item === "supabase")
    ? "supabase"
    : sources.every((item) => item === "static_seed")
      ? "static_seed"
      : "mixed";

  return {
    source,
    data: {
      personas: personas.rows,
      personaAssets: personaAssets.rows,
      promptBank: promptBank.rows,
      contentQueue: contentQueue.rows,
      interactionModes: interactionModes.rows,
      approvalEvents: approvalEvents.rows,
      signalLogs: signalLogs.rows
    },
    blockers: [
      ...personas.blockers,
      ...personaAssets.blockers,
      ...promptBank.blockers,
      ...contentQueue.blockers,
      ...interactionModes.blockers,
      ...approvalEvents.blockers,
      ...signalLogs.blockers
    ]
  };
}

export function buildReadinessSnapshot(data: EdenReviewData, source: ReadinessSnapshot["source"], blockers: string[]): ReadinessSnapshot {
  const unresolvedAssets = data.personaAssets.filter((asset) => !asset.public_url && asset.asset_type !== "doc");
  const approvalNeeded = data.contentQueue.filter((item) => item.status === "needs_review" || item.status === "draft");
  const highRiskQueue = data.contentQueue.filter((item) => item.risk_level === "high");
  const pendingModes = data.interactionModes.filter((item) => item.status === "draft" || item.status === "needs_review");
  const computedBlockers = [...blockers];

  if (unresolvedAssets.length > 0) {
    computedBlockers.push("One or more media assets still need a public sandbox asset URL before downstream scheduling or product download setup.");
  }

  if (pendingModes.some((mode) => mode.mode_type === "chat" || mode.mode_type === "voice" || mode.mode_type === "video")) {
    computedBlockers.push("Forbidden Fruit chat, voice, or video interaction modes require age-gate, AI disclosure, moderation, and platform-policy validation before launch.");
  }

  if (source === "static_seed") {
    computedBlockers.push("Forbidden Fruit sandbox schema has not been verified through live Supabase reads yet.");
  }

  const status: ReadinessSnapshot["status"] = computedBlockers.length > 0 ? "blocked" : approvalNeeded.length > 0 ? "needs_review" : "sandbox_ready";

  return {
    status,
    source,
    counts: {
      personas: data.personas.length,
      personaAssets: data.personaAssets.length,
      promptBank: data.promptBank.length,
      contentProducts: data.contentQueue.length,
      interactionModes: data.interactionModes.length,
      approvalEvents: data.approvalEvents.length,
      signalLogs: data.signalLogs.length,
      approvalNeeded: approvalNeeded.length,
      highRiskQueue: highRiskQueue.length
    },
    blockers: computedBlockers,
    approvalGates: [
      "Adult-only access and AI/fictional persona disclosure are required before any customer-facing Forbidden Fruit experience.",
      "Public scheduling requires content and platform-policy approval.",
      "Shopify or payment mutation requires commerce and adult-content policy approval.",
      "HeyGen Digital Twin or synthetic voice/video creation requires identity, consent, and platform-policy approval.",
      "Chat, voice, and video interaction launch requires moderation, privacy, and blocked-topic validation.",
      "Supabase production SQL remains blocked; sandbox only.",
      "Paid or repeated cost-bearing generation requires explicit approval."
    ],
    nextActions: [
      "Verify Vercel preview reads Forbidden Fruit rows through the existing Supabase env contract.",
      "Attach public sandbox asset URLs before scheduler export or downloadable-product setup.",
      "Complete platform-policy validation matrix before live commerce or distribution.",
      "Review high-risk content products and interaction modes before any downstream automation.",
      "Run gated approval, rejection, and signal logging tests only after SOL read-only mode is disabled for the confirmed sandbox target."
    ]
  };
}

export function mutationGate(request: Request) {
  const readOnly = solReadOnlyMode();
  const requiresApproval = solRequiresApprovals();
  const expectedToken = getApprovalToken();
  const suppliedToken = request.headers.get("x-eden-approval-token") || request.headers.get("x-sol-approval-token") || "";

  if (readOnly) {
    return {
      ok: false,
      status: 423,
      message: "SOL read-only mode is enabled. Set SOL_READ_ONLY_MODE=false only in preview after read-only validation passes."
    };
  }

  if (requiresApproval && (!expectedToken || suppliedToken !== expectedToken)) {
    return {
      ok: false,
      status: 403,
      message: "Missing or invalid SOL/Eden approval token."
    };
  }

  if (!getEdenAdminClient()) {
    return {
      ok: false,
      status: 503,
      message: "Supabase service-role environment is not configured for guarded Forbidden Fruit / Eden Skye writes."
    };
  }

  return { ok: true, status: 200, message: "Mutation gate passed." };
}

export async function parseJsonBody(request: Request) {
  return (await request.json().catch(() => ({}))) as Record<string, unknown>;
}

export function asOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

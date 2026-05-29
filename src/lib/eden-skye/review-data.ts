import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type PersonaAsset = {
  id?: string;
  persona_id: string;
  asset_key: string;
  asset_role: string;
  asset_type: string;
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
  persona_id: string;
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
  persona_id: string;
  platform: string;
  content_pillar: string;
  content_type: string;
  title: string;
  caption?: string | null;
  first_comment?: string | null;
  asset_keys: string[];
  scheduled_for?: string | null;
  timezone: string;
  status: string;
  risk_level: string;
  approval_request_id?: string | null;
  external_job_id?: string | null;
  external_url?: string | null;
  metadata_json?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type ApprovalEvent = {
  id?: string;
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
  content_queue_id?: string | null;
  persona_id: string;
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
  personaAssets: PersonaAsset[];
  promptBank: PromptBankItem[];
  contentQueue: ContentQueueItem[];
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
  personaAssets: "eden_persona_assets",
  promptBank: "eden_prompt_bank",
  contentQueue: "eden_content_queue",
  approvalEvents: "eden_approval_events",
  signalLogs: "eden_signal_logs"
} as const;

export const edenSeedData: EdenReviewData = {
  personaAssets: [
    {
      persona_id: "eden-skye",
      asset_key: "eden-master-reference-01",
      asset_role: "master_reference",
      asset_type: "image",
      source_path: "user_files/01-ChatGPT-Image-May-28-2026-05_56_46-PM.png",
      public_url: null,
      storage_provider: "pending_asset_store",
      status: "draft",
      approval_required: true,
      metadata_json: { lane: "persona_identity", use: "visual continuity reference" }
    },
    {
      persona_id: "eden-skye",
      asset_key: "eden-voice-style-guide",
      asset_role: "voice_reference",
      asset_type: "doc",
      source_path: "docs/sol-persistent-live-avatar/eden-skye-operating-pack/CHARACTER_BIBLE.md",
      public_url: null,
      storage_provider: "repo",
      status: "draft",
      approval_required: true,
      metadata_json: { lane: "brand_governance", use: "caption and script continuity" }
    }
  ],
  promptBank: [
    {
      persona_id: "eden-skye",
      tool_surface: "kling",
      prompt_name: "Hero loop - cinematic avatar continuity",
      prompt_type: "video_generation",
      prompt_text: "Generate a short cinematic Eden Skye lifestyle loop using the approved master reference only. Maintain face, wardrobe, hair, lighting, and luxury wellness tone.",
      negative_prompt: "No face drift, no exaggerated glamour, no unreadable text, no medical claims, no financial guarantees.",
      reference_asset_key: "eden-master-reference-01",
      status: "draft",
      risk_level: "medium",
      approval_required: true,
      metadata_json: { duration_seconds: 5, approval_gate: "visual_identity" }
    },
    {
      persona_id: "eden-skye",
      tool_surface: "heygen",
      prompt_name: "Thirty-second welcome script",
      prompt_type: "avatar_script",
      prompt_text: "Welcome to Eden Skye. This is where calm execution meets intelligent systems, and every asset is built with intention before it is released.",
      negative_prompt: null,
      reference_asset_key: "eden-voice-style-guide",
      status: "draft",
      risk_level: "medium",
      approval_required: true,
      metadata_json: { approval_gate: "voice_and_identity" }
    },
    {
      persona_id: "eden-skye",
      tool_surface: "metricool",
      prompt_name: "Caption seed - operating rhythm",
      prompt_type: "social_caption",
      prompt_text: "Your system should feel calm before it scales. Build the review layer first, then let automation carry only what has earned approval.",
      negative_prompt: null,
      reference_asset_key: "eden-voice-style-guide",
      status: "draft",
      risk_level: "low",
      approval_required: true,
      metadata_json: { pillar: "systems_and_rituals" }
    }
  ],
  contentQueue: [
    {
      persona_id: "eden-skye",
      platform: "instagram",
      content_pillar: "systems_and_rituals",
      content_type: "reel",
      title: "Calm systems before scale",
      caption: "A quiet system beats a loud scramble. Eden Skye starts with review, approval, and signal before distribution expands.",
      first_comment: "Save this if your content system needs a calmer operating rhythm.",
      asset_keys: ["eden-master-reference-01"],
      scheduled_for: null,
      timezone: "America/New_York",
      status: "needs_review",
      risk_level: "low",
      approval_request_id: null,
      metadata_json: { source: "seed_queue", downstream: ["metricool", "xyla", "repurpose"] }
    },
    {
      persona_id: "eden-skye",
      platform: "shopify",
      content_pillar: "commerce",
      content_type: "product_draft",
      title: "Eden Skye Starter System",
      caption: "Draft offer placeholder for a governed starter system. Pricing, claims, product page, and fulfillment must be approved before launch.",
      first_comment: null,
      asset_keys: ["eden-voice-style-guide"],
      scheduled_for: null,
      timezone: "America/New_York",
      status: "draft",
      risk_level: "high",
      approval_request_id: null,
      metadata_json: { source: "shopify_seed", approval_gate: "commerce_mutation" }
    }
  ],
  approvalEvents: [
    {
      target_table: "eden_content_queue",
      target_id: "seed:calm-systems-before-scale",
      action_requested: "approve_for_sandbox_review",
      risk_level: "low",
      status: "needs_review",
      requested_by: "AUTO_BUILDER",
      reviewed_by: null,
      reviewed_at: null,
      evidence_json: { source: "static_seed" },
      blocker: "Sandbox Supabase branch not yet selected.",
      workaround: "Use static read-only queue review until sandbox schema is applied.",
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
      blockers: ["Supabase read environment is not configured; serving static Eden Skye seed data."]
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

export async function readPersonaAssets() {
  return readTable<PersonaAsset>(TABLES.personaAssets, edenSeedData.personaAssets);
}

export async function readPromptBank() {
  return readTable<PromptBankItem>(TABLES.promptBank, edenSeedData.promptBank);
}

export async function readContentQueue() {
  return readTable<ContentQueueItem>(TABLES.contentQueue, edenSeedData.contentQueue);
}

export async function readApprovalEvents() {
  return readTable<ApprovalEvent>(TABLES.approvalEvents, edenSeedData.approvalEvents);
}

export async function readSignalLogs() {
  return readTable<SignalLog>(TABLES.signalLogs, edenSeedData.signalLogs);
}

export async function readAllEdenReviewData() {
  const [personaAssets, promptBank, contentQueue, approvalEvents, signalLogs] = await Promise.all([
    readPersonaAssets(),
    readPromptBank(),
    readContentQueue(),
    readApprovalEvents(),
    readSignalLogs()
  ]);

  const sources = [personaAssets.source, promptBank.source, contentQueue.source, approvalEvents.source, signalLogs.source];
  const source = sources.every((item) => item === "supabase")
    ? "supabase"
    : sources.every((item) => item === "static_seed")
      ? "static_seed"
      : "mixed";

  return {
    source,
    data: {
      personaAssets: personaAssets.rows,
      promptBank: promptBank.rows,
      contentQueue: contentQueue.rows,
      approvalEvents: approvalEvents.rows,
      signalLogs: signalLogs.rows
    },
    blockers: [
      ...personaAssets.blockers,
      ...promptBank.blockers,
      ...contentQueue.blockers,
      ...approvalEvents.blockers,
      ...signalLogs.blockers
    ]
  };
}

export function buildReadinessSnapshot(data: EdenReviewData, source: ReadinessSnapshot["source"], blockers: string[]): ReadinessSnapshot {
  const unresolvedAssets = data.personaAssets.filter((asset) => !asset.public_url && asset.asset_type !== "doc");
  const approvalNeeded = data.contentQueue.filter((item) => item.status === "needs_review" || item.status === "draft");
  const highRiskQueue = data.contentQueue.filter((item) => item.risk_level === "high");
  const computedBlockers = [...blockers];

  if (unresolvedAssets.length > 0) {
    computedBlockers.push("One or more media assets still need a public sandbox asset URL before downstream scheduling.");
  }

  if (source === "static_seed") {
    computedBlockers.push("Eden Skye schema has not been verified through live Supabase reads yet.");
  }

  const status: ReadinessSnapshot["status"] = computedBlockers.length > 0 ? "blocked" : approvalNeeded.length > 0 ? "needs_review" : "sandbox_ready";

  return {
    status,
    source,
    counts: {
      personaAssets: data.personaAssets.length,
      promptBank: data.promptBank.length,
      contentQueue: data.contentQueue.length,
      approvalEvents: data.approvalEvents.length,
      signalLogs: data.signalLogs.length,
      approvalNeeded: approvalNeeded.length,
      highRiskQueue: highRiskQueue.length
    },
    blockers: computedBlockers,
    approvalGates: [
      "Public scheduling requires content approval.",
      "Shopify mutation requires commerce approval.",
      "HeyGen Digital Twin creation requires identity approval.",
      "Supabase production SQL remains blocked; sandbox only.",
      "Paid or repeated cost-bearing generation requires explicit approval."
    ],
    nextActions: [
      "Verify Vercel preview reads Eden Skye rows through the existing Supabase env contract.",
      "Attach public sandbox asset URLs before scheduler export.",
      "Review low-risk content queue rows before any downstream automation.",
      "Run gated approval, rejection, and signal logging tests only after SOL read-only mode is disabled for preview."
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
      message: "Supabase service-role environment is not configured for guarded Eden Skye writes."
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

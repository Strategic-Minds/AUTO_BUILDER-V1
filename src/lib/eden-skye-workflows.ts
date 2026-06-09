import {
  buildEdenReceipt,
  buildModelRegistrySeed,
  buildQueueSeed,
  gateForOperation,
  getConnectorReadiness,
  getSupabaseAdmin,
  persistEdenReceipt,
  type EdenGate,
  type EdenOperation
} from "@/lib/eden-skye-os";

export type EdenWorkflowName =
  | "supervisor"
  | "discover"
  | "analyze"
  | "create_drafts"
  | "image_inventory"
  | "asset_linking"
  | "quarantine"
  | "approval_queue"
  | "schedule_drafts"
  | "validate"
  | "heal"
  | "memory_reflection"
  | "dispatch_approved";

export type EdenWorkflowMode = "simulation" | "dry_run" | "approval_gated";
export type EdenWorkflowStatus = "completed" | "blocked_for_approval" | "failed";

type EdenModelRecord = {
  id: string;
  external_key: string;
  display_name: string;
  cohort: string;
  age_band: string;
  persona: string;
};

type DraftQueueCounts = {
  contentItems: number;
  engagementTickets: number;
  experiments: number;
  memoryEntries: number;
};

export type EdenWorkflowSpec = {
  name: EdenWorkflowName;
  operation: EdenOperation;
  description: string;
  mode: EdenWorkflowMode;
  maxRetries: number;
  approvalRequired: boolean;
  externalWritesAllowed: boolean;
  queueLane: string;
  toolScope: string[];
};

export type EdenWorkflowInput = {
  trigger?: string;
  workflow?: EdenWorkflowName;
  simulateOnly?: boolean;
  requestedBy?: string;
  payload?: Record<string, unknown>;
};

export type EdenChildWorkflowResult = {
  ok: boolean;
  runId: string;
  workflow: EdenWorkflowName;
  operation?: EdenOperation;
  description?: string;
  status: EdenWorkflowStatus;
  gate?: EdenGate;
  trigger: string;
  queueLane?: string;
  mode?: EdenWorkflowMode;
  productionActionAllowed: false;
  externalWritesAllowed: false;
  approvalRequired?: boolean;
  maxRetries?: number;
  toolScope?: string[];
  mediaQueue?: unknown;
  draftSeed?: unknown;
  persistence?: unknown;
  agentRunPersistence?: unknown;
  receipt?: unknown;
  error?: string;
};

export const edenChildWorkflowSpecs: EdenWorkflowSpec[] = [
  {
    name: "discover",
    operation: "discover",
    description: "Discover platform signals, benchmark ideas, model/page opportunities, and content themes.",
    mode: "dry_run",
    maxRetries: 3,
    approvalRequired: false,
    externalWritesAllowed: false,
    queueLane: "discovery",
    toolScope: ["supabase", "metricool_dry_run", "google_drive_read"]
  },
  {
    name: "analyze",
    operation: "analyze",
    description: "Analyze model registry coverage, image gaps, queue pressure, experiments, and connector readiness.",
    mode: "dry_run",
    maxRetries: 3,
    approvalRequired: false,
    externalWritesAllowed: false,
    queueLane: "analysis",
    toolScope: ["supabase", "receipts", "analytics"]
  },
  {
    name: "create_drafts",
    operation: "create",
    description: "Create draft-only content, prompt, caption, script, and website/admin backlog items.",
    mode: "dry_run",
    maxRetries: 2,
    approvalRequired: false,
    externalWritesAllowed: false,
    queueLane: "draft_creation",
    toolScope: ["supabase", "templates", "heygen_dry_run"]
  },
  {
    name: "image_inventory",
    operation: "analyze",
    description: "Inventory Drive image folders, classify available model/faceless media, and identify missing batches.",
    mode: "dry_run",
    maxRetries: 2,
    approvalRequired: false,
    externalWritesAllowed: false,
    queueLane: "media_library",
    toolScope: ["google_drive_read", "supabase"]
  },
  {
    name: "asset_linking",
    operation: "create",
    description: "Link approved Drive image IDs or URLs into asset records after sandbox validation.",
    mode: "approval_gated",
    maxRetries: 2,
    approvalRequired: true,
    externalWritesAllowed: false,
    queueLane: "media_library",
    toolScope: ["google_drive_read", "supabase"]
  },
  {
    name: "quarantine",
    operation: "quarantine",
    description: "Route failed, unsafe, missing, or unverified assets and jobs into quarantine with reasons.",
    mode: "dry_run",
    maxRetries: 2,
    approvalRequired: false,
    externalWritesAllowed: false,
    queueLane: "quarantine",
    toolScope: ["supabase", "receipts"]
  },
  {
    name: "approval_queue",
    operation: "approve",
    description: "Prepare owner approval requests for live actions, paid generation, external writes, and adult/membership releases.",
    mode: "approval_gated",
    maxRetries: 1,
    approvalRequired: true,
    externalWritesAllowed: false,
    queueLane: "approval_center",
    toolScope: ["supabase", "admin_console"]
  },
  {
    name: "schedule_drafts",
    operation: "schedule",
    description: "Build Metricool/Xyla-ready schedule drafts while keeping external scheduling locked pending approval.",
    mode: "approval_gated",
    maxRetries: 1,
    approvalRequired: true,
    externalWritesAllowed: false,
    queueLane: "publishing_queue",
    toolScope: ["supabase", "metricool_dry_run", "shopify_xyla_dry_run"]
  },
  {
    name: "validate",
    operation: "validate",
    description: "Validate preview health, route responses, connector readiness, receipts, and workflow child results.",
    mode: "dry_run",
    maxRetries: 3,
    approvalRequired: false,
    externalWritesAllowed: false,
    queueLane: "validation",
    toolScope: ["vercel", "supabase", "receipts"]
  },
  {
    name: "heal",
    operation: "heal",
    description: "Generate non-production repair recommendations, retry plans, and quarantine actions.",
    mode: "dry_run",
    maxRetries: 2,
    approvalRequired: false,
    externalWritesAllowed: false,
    queueLane: "recovery",
    toolScope: ["github", "vercel", "supabase"]
  },
  {
    name: "memory_reflection",
    operation: "analyze",
    description: "Record operating memory, self-reflection, optimization notes, and next queue priorities.",
    mode: "dry_run",
    maxRetries: 2,
    approvalRequired: false,
    externalWritesAllowed: false,
    queueLane: "memory",
    toolScope: ["supabase", "memory", "receipts"]
  },
  {
    name: "dispatch_approved",
    operation: "dispatch",
    description: "Dispatch only pre-approved external jobs; simulation keeps all external writes locked.",
    mode: "approval_gated",
    maxRetries: 1,
    approvalRequired: true,
    externalWritesAllowed: false,
    queueLane: "dispatch",
    toolScope: ["metricool", "shopify_xyla", "google_drive", "n8n"]
  }
];

export function buildWorkflowRunId(name: EdenWorkflowName) {
  return `eden-${name}-${Date.now()}`;
}

function workflowGate(spec: EdenWorkflowSpec): EdenGate {
  if (spec.approvalRequired) return "owner_approval_required";
  return gateForOperation(spec.operation);
}

function asJsonRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function buildImagePrompt(model: EdenModelRecord) {
  if (model.cohort === "faceless") {
    return `Create a brand-safe faceless social page visual system for ${model.display_name}: profile icon, reusable cover image, short-form post template, and neutral background set. No real-person identity claims. Approval-gated before external use.`;
  }
  return `Create a brand-safe draft digital creator profile image set for ${model.display_name}, cohort ${model.cohort}, age band ${model.age_band}. Include profile portrait concept, lifestyle feed concept, vertical short-form thumbnail concept, and website card concept. Synthetic/digital model only. Approval-gated before external use.`;
}

function scheduleDraftAt(index: number) {
  const base = new Date();
  base.setUTCDate(base.getUTCDate() + 1);
  base.setUTCHours(0, 0, 0, 0);
  base.setUTCMinutes((index % 96) * 15);
  base.setUTCDate(base.getUTCDate() + Math.floor(index / 96));
  return base.toISOString();
}

function contentPillarFor(model: EdenModelRecord) {
  if (model.cohort === "faceless") return "faceless_authority_page";
  if (model.cohort.includes("50")) return "confidence_longevity_lifestyle";
  if (model.cohort === "international") return "global_trend_localization";
  return "digital_creator_intro_and_offer";
}

function draftQueueWorkflows(name: EdenWorkflowName) {
  return ["create_drafts", "quarantine", "approval_queue", "schedule_drafts", "memory_reflection"].includes(name);
}

export async function ensureEdenImageAssetQueue() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: true, mode: "memory_only", reason: "Supabase env not configured", targetAssets: buildModelRegistrySeed().length };

  const { data: models, error: modelError } = await supabase
    .from("eden_models")
    .select("id, external_key, display_name, cohort, age_band, persona")
    .order("external_key", { ascending: true })
    .limit(1000);

  if (modelError) return { ok: false, mode: "supabase", stage: "load_models", reason: modelError.message };

  const records = (((models || []) as unknown) as EdenModelRecord[]).map((model) => ({
    asset_key: `${model.external_key}:primary_image_queue`,
    model_id: model.id,
    asset_type: model.cohort === "faceless" ? "faceless_page_image_queue" : "model_image_queue",
    provider: "eden_image_queue",
    prompt: buildImagePrompt(model),
    file_url: null,
    storage_path: null,
    qa_status: "missing_or_pending_upload",
    approval_state: "draft",
    metadata: {
      external_key: model.external_key,
      display_name: model.display_name,
      cohort: model.cohort,
      persona: model.persona,
      queue_state: "needs_generation_or_drive_upload",
      drive_state: "not_linked",
      generation_state: "not_started",
      paid_generation_allowed: false,
      external_writes_allowed: false,
      approval_required_before_publish: true,
      required_outputs: ["profile_image", "feed_image", "short_form_thumbnail", "website_card"]
    }
  }));

  if (records.length === 0) return { ok: false, mode: "supabase", stage: "build_records", reason: "No eden_models records found" };

  const { error: upsertError } = await supabase
    .from("eden_assets")
    .upsert(records, { onConflict: "asset_key" });

  if (upsertError) {
    return {
      ok: false,
      mode: "supabase",
      stage: "upsert_assets",
      reason: upsertError.message,
      expectedMigration: "20260609060000_eden_image_asset_queue.sql"
    };
  }

  const { count, error: countError } = await supabase
    .from("eden_assets")
    .select("id", { count: "exact", head: true })
    .eq("provider", "eden_image_queue");

  if (countError) return { ok: false, mode: "supabase", stage: "count_assets", reason: countError.message, requestedAssets: records.length };

  return {
    ok: true,
    mode: "supabase",
    requestedAssets: records.length,
    queuedAssets: count || 0,
    qaStatus: "missing_or_pending_upload",
    approvalState: "draft",
    externalWritesAllowed: false,
    paidGenerationAllowed: false
  };
}

async function countDraftRows(): Promise<DraftQueueCounts> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { contentItems: 0, engagementTickets: 0, experiments: 0, memoryEntries: 0 };

  const [content, engagement, experiments, memory] = await Promise.all([
    supabase.from("eden_content_items").select("id", { count: "exact", head: true }),
    supabase.from("eden_engagement_tickets").select("id", { count: "exact", head: true }),
    supabase.from("eden_experiments").select("id", { count: "exact", head: true }),
    supabase.from("eden_memory_entries").select("id", { count: "exact", head: true })
  ]);

  return {
    contentItems: content.count || 0,
    engagementTickets: engagement.count || 0,
    experiments: experiments.count || 0,
    memoryEntries: memory.count || 0
  };
}

export async function ensureEdenDraftOperatingQueues() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      ok: true,
      mode: "memory_only",
      reason: "Supabase env not configured",
      externalWritesAllowed: false,
      livePublishingAllowed: false
    };
  }

  const { data: models, error: modelError } = await supabase
    .from("eden_models")
    .select("id, external_key, display_name, cohort, age_band, persona")
    .order("external_key", { ascending: true })
    .limit(1000);

  if (modelError) return { ok: false, mode: "supabase", stage: "load_models", reason: modelError.message };

  const modelRows = (((models || []) as unknown) as EdenModelRecord[]);
  if (modelRows.length === 0) return { ok: false, mode: "supabase", stage: "build_drafts", reason: "No eden_models records found" };

  const contentRows = modelRows.map((model, index) => ({
    content_key: `${model.external_key}:starter_calendar_post_01`,
    model_id: model.id,
    platform: index % 2 === 0 ? "instagram" : "tiktok",
    content_type: model.cohort === "faceless" ? "faceless_short" : "model_intro_short",
    pillar: contentPillarFor(model),
    hook: model.cohort === "faceless"
      ? `A faceless page system can turn ${model.display_name} into a daily content lane without live posting yet.`
      : `Meet ${model.display_name}: a draft digital creator profile queued for media QA and approval.` ,
    caption: `Draft-only starter post for ${model.display_name}. Media, schedule, and external publishing remain approval-gated until assets pass QA.`,
    cta: "Join the Eden Skye list for approved drops and behind-the-scenes updates.",
    scheduled_for: scheduleDraftAt(index),
    approval_state: "draft",
    connector_state: "not_sent",
    metadata: {
      queue_key: `${model.external_key}:starter_calendar_post_01`,
      queue_lane: "publishing_queue",
      source: "eden_workflow_create_drafts",
      schedule_state: "metricool_xyla_ready_after_approval",
      external_writes_allowed: false,
      live_publish_allowed: false
    }
  }));

  const engagementRows = [
    ["engage:welcome_dm_template", "instagram", "low", "Thanks for joining Eden Skye. We are collecting preferences for future approved drops. What style do you want to see first?"],
    ["engage:model_interest_reply", "instagram", "medium", "Appreciate the love. This profile is in draft review, so I can only share approved public updates for now."],
    ["engage:membership_waitlist", "website", "medium", "Eden's Closet is approval-gated while membership, payment, and age-gate checks are completed. I can add this to the waitlist queue."],
    ["engage:brand_collab_intake", "email", "low", "Thanks for reaching out. Please send campaign goals, timeline, budget range, and required usage rights for review."],
    ["engage:quarantine_sensitive_reply", "instagram", "high", "This needs owner review before any response. Routing to quarantine and approval desk."],
    ["engage:asset_request_reply", "website", "medium", "Image and video assets are still draft-only until QA and approval are complete."],
    ["engage:international_localization", "tiktok", "medium", "We can localize this concept after region, language, and compliance checks are approved."],
    ["engage:faceless_page_cta", "pinterest", "low", "This is a draft faceless-page response template. Save the post and join the list for approved resource drops."]
  ].map(([ticket_key, platform, risk_class, draft_response]) => ({
    ticket_key,
    platform,
    source_url: null,
    inbound_text: `Draft inbound scenario for ${ticket_key}.`,
    risk_class,
    draft_response,
    approval_state: "draft",
    outbound_state: "locked",
    metadata: {
      queue_lane: "engagement_desk",
      source: "eden_workflow_create_drafts",
      external_writes_allowed: false,
      outbound_send_allowed: false,
      approval_required_before_send: true
    }
  }));

  const experimentRows = [
    {
      experiment_key: "exp:website_hero_positioning_v1",
      experiment_type: "website_ab_test",
      hypothesis: "A creator-network hero will outperform a generic studio hero for waitlist conversion.",
      variants: ["creator_network", "studio_platform"],
      primary_metric: "waitlist_signup_rate",
      winner_rule: "Run until 500 qualified sessions or 14 days, then select higher conversion with no policy issues."
    },
    {
      experiment_key: "exp:edens_closet_offer_v1",
      experiment_type: "membership_offer_test",
      hypothesis: "Black Card positioning will generate stronger intent than standard premium membership copy.",
      variants: ["black_card", "premium_club"],
      primary_metric: "approved_waitlist_intent",
      winner_rule: "Select the variant with higher approved waitlist intent after review."
    },
    {
      experiment_key: "exp:model_intro_hook_v1",
      experiment_type: "content_hook_test",
      hypothesis: "Identity-led intro hooks will outperform behind-the-scenes production hooks for model accounts.",
      variants: ["identity_intro", "behind_the_scenes"],
      primary_metric: "save_and_follow_rate",
      winner_rule: "Use preview metrics only until publishing approval exists."
    },
    {
      experiment_key: "exp:faceless_page_niche_v1",
      experiment_type: "faceless_page_test",
      hypothesis: "Creator tools and templates will outperform generic lifestyle quotes for faceless pages.",
      variants: ["creator_tools", "lifestyle_quotes"],
      primary_metric: "profile_click_rate",
      winner_rule: "Pick after approved posts collect enough signal."
    },
    {
      experiment_key: "exp:image_style_qa_v1",
      experiment_type: "media_style_test",
      hypothesis: "Clean studio-card images will pass QA more reliably than lifestyle-feed concepts for first launch.",
      variants: ["studio_card", "lifestyle_feed"],
      primary_metric: "qa_pass_rate",
      winner_rule: "Use the style with better QA pass rate and lower revision count."
    },
    {
      experiment_key: "exp:metricool_schedule_cadence_v1",
      experiment_type: "schedule_test",
      hypothesis: "Two daily posts per active account will be safer for launch than maximum posting limits.",
      variants: ["two_daily", "six_daily_cap"],
      primary_metric: "approval_pass_rate_and_queue_health",
      winner_rule: "Prefer lower-risk cadence unless performance evidence justifies scaling."
    }
  ].map((experiment) => ({
    ...experiment,
    status: "planned",
    result: {
      source: "eden_workflow_create_drafts",
      external_writes_allowed: false,
      requires_approved_tracking: true
    }
  }));

  const memoryRows = [
    ["mem:operating_loop", "Eden Skye runs DISCOVER -> VALIDATE -> BRAND -> BUILD -> DEPLOY -> DISTRIBUTE -> MONETIZE -> ANALYZE -> OPTIMIZE -> SCALE -> REPLICATE -> REPEAT with live actions locked until approval."],
    ["mem:approval_policy", "Live publishing, outbound messages, paid generation, adult/membership release, Drive archive writes, and production mutations require explicit approval receipts."],
    ["mem:model_registry_target", "The operating registry target is 160 accounts: 140 model profiles and 20 faceless pages across the scaffolded cohorts."],
    ["mem:media_gap", "The current media queue can track 160 image assets, but actual image generation/upload/linking remains separate and approval-gated."],
    ["mem:connectors_ready", "Supabase, Vercel, Metricool, Shopify/Xyla, and HeyGen are expected connectors; n8n remains non-critical until API root readiness is restored."],
    ["mem:website_goal", "EdenSkyeStudios.com should feed the automation system through registries, approvals, media libraries, publishing queues, experiments, and receipts."],
    ["mem:edens_closet_gate", "Eden's Closet is a locked membership concept until payment, policy, access, and age-gate controls are validated and approved."],
    ["mem:self_healing", "The supervisor should validate, quarantine, write receipts, record reflections, and create repair plans without production mutation."]
  ].map(([memory_key, fact]) => ({
    memory_key,
    scope: "eden_skye_operating_system",
    fact,
    source: "eden_workflow_memory_reflection",
    confidence: "verified_runtime_policy",
    tags: ["eden-skye", "auto-social", "draft-ops", "governance"],
    status: "active"
  }));

  const contentResult = await supabase.from("eden_content_items").upsert(contentRows, { onConflict: "content_key" });
  if (contentResult.error) {
    return { ok: false, mode: "supabase", stage: "upsert_content", reason: contentResult.error.message, expectedMigration: "20260609063000_eden_draft_ops_queue_keys.sql" };
  }

  const engagementResult = await supabase.from("eden_engagement_tickets").upsert(engagementRows, { onConflict: "ticket_key" });
  if (engagementResult.error) {
    return { ok: false, mode: "supabase", stage: "upsert_engagement", reason: engagementResult.error.message, expectedMigration: "20260609063000_eden_draft_ops_queue_keys.sql" };
  }

  const experimentResult = await supabase.from("eden_experiments").upsert(experimentRows, { onConflict: "experiment_key" });
  if (experimentResult.error) {
    return { ok: false, mode: "supabase", stage: "upsert_experiments", reason: experimentResult.error.message, expectedMigration: "20260609063000_eden_draft_ops_queue_keys.sql" };
  }

  const memoryResult = await supabase.from("eden_memory_entries").upsert(memoryRows, { onConflict: "memory_key" });
  if (memoryResult.error) {
    return { ok: false, mode: "supabase", stage: "upsert_memory", reason: memoryResult.error.message, expectedMigration: "20260609063000_eden_draft_ops_queue_keys.sql" };
  }

  const counts = await countDraftRows();
  return {
    ok: true,
    mode: "supabase",
    requested: {
      contentItems: contentRows.length,
      engagementTickets: engagementRows.length,
      experiments: experimentRows.length,
      memoryEntries: memoryRows.length
    },
    counts,
    approvalState: "draft",
    connectorState: "not_sent",
    outboundState: "locked",
    externalWritesAllowed: false,
    livePublishingAllowed: false,
    paidGenerationAllowed: false
  };
}

async function persistWorkflowAgentRun(spec: EdenWorkflowSpec, result: unknown) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { mode: "memory_only", ok: true, reason: "Supabase env not configured" };

  const resultRecord = asJsonRecord(result);
  const { error } = await supabase.from("eden_agent_runs").insert({
    agent_name: `eden_workflow_${spec.name}`,
    trigger: String(resultRecord.trigger || "manual_or_cron"),
    status: resultRecord.status === "blocked_for_approval" ? "blocked" : "completed",
    gate: workflowGate(spec),
    production_action_allowed: false,
    logs: [resultRecord],
    reflection: {
      workflow: spec.name,
      queue_lane: spec.queueLane,
      approval_required: spec.approvalRequired,
      external_writes_allowed: false,
      next_action: spec.approvalRequired ? "wait_for_owner_approval" : "advance_next_safe_child_workflow"
    }
  });

  if (error) return { mode: "supabase", ok: false, reason: error.message };
  return { mode: "supabase", ok: true };
}

export async function runEdenChildWorkflow(name: EdenWorkflowName, input: EdenWorkflowInput = {}): Promise<EdenChildWorkflowResult> {
  const spec = edenChildWorkflowSpecs.find((item) => item.name === name);
  if (!spec) {
    return {
      ok: false,
      runId: buildWorkflowRunId(name),
      workflow: name,
      status: "failed",
      trigger: input.trigger || "manual_or_cron",
      error: "Unknown Eden Skye child workflow",
      productionActionAllowed: false,
      externalWritesAllowed: false
    };
  }

  const trigger = input.trigger || "manual_or_cron";
  const runId = buildWorkflowRunId(spec.name);
  const gate = workflowGate(spec);
  const status: EdenWorkflowStatus = spec.approvalRequired ? "blocked_for_approval" : "completed";
  const mediaQueue = spec.name === "image_inventory" ? await ensureEdenImageAssetQueue() : null;
  const draftSeed = draftQueueWorkflows(spec.name) ? await ensureEdenDraftOperatingQueues() : null;
  const receipt = buildEdenReceipt(spec.operation, {
    runId,
    workflow: spec.name,
    workflowMode: spec.mode,
    trigger,
    queueLane: spec.queueLane,
    maxRetries: spec.maxRetries,
    approvalRequired: spec.approvalRequired,
    externalWritesAllowed: false,
    simulateOnly: input.simulateOnly !== false,
    requestedBy: input.requestedBy || "system",
    payload: input.payload || {},
    mediaQueue,
    draftSeed
  });
  const persistence = await persistEdenReceipt(receipt);

  const result: EdenChildWorkflowResult = {
    ok: true,
    runId,
    workflow: spec.name,
    operation: spec.operation,
    description: spec.description,
    status,
    gate,
    trigger,
    queueLane: spec.queueLane,
    mode: spec.mode,
    productionActionAllowed: false,
    externalWritesAllowed: false,
    approvalRequired: spec.approvalRequired,
    maxRetries: spec.maxRetries,
    toolScope: spec.toolScope,
    mediaQueue,
    draftSeed,
    persistence,
    receipt
  };

  const agentRunPersistence = await persistWorkflowAgentRun(spec, result);
  return { ...result, agentRunPersistence };
}

export async function runEdenWorkflowSupervisor(input: EdenWorkflowInput = {}) {
  const trigger = input.trigger || "manual_or_cron";
  const runId = buildWorkflowRunId("supervisor");
  const childResults: EdenChildWorkflowResult[] = [];

  for (const spec of edenChildWorkflowSpecs) {
    childResults.push(await runEdenChildWorkflow(spec.name, { ...input, trigger, simulateOnly: input.simulateOnly !== false }));
  }

  const completed = childResults.filter((item) => item.ok && item.status === "completed").length;
  const blockedForApproval = childResults.filter((item) => item.ok && item.status === "blocked_for_approval").length;
  const failed = childResults.filter((item) => !item.ok || item.status === "failed").length;
  const connectors = getConnectorReadiness();
  const registry = buildModelRegistrySeed();
  const mediaQueue = childResults.find((item) => item.workflow === "image_inventory")?.mediaQueue || null;
  const draftSeed = childResults.find((item) => item.workflow === "create_drafts")?.draftSeed || null;

  const supervisorReceipt = buildEdenReceipt("validate", {
    runId,
    workflow: "supervisor",
    trigger,
    simulateOnly: input.simulateOnly !== false,
    childWorkflowCount: childResults.length,
    completed,
    blockedForApproval,
    failed,
    connectors,
    registryTarget: registry.length,
    queueSeed: buildQueueSeed(),
    imageAssetTarget: registry.length,
    mediaQueue,
    draftSeed,
    missingImageAssetPolicy: "generate_or_upload_batches_only_after_approval_and_available_packets",
    draftOpsPolicy: "content_calendar_engagement_experiments_and_memory_seeded_as_draft_only_idempotent_rows"
  });
  const persistence = await persistEdenReceipt(supervisorReceipt);

  const supervisorSpec: EdenWorkflowSpec = {
    name: "supervisor",
    operation: "validate",
    description: "Five-minute supervisor for Eden Skye child workflows.",
    mode: "dry_run",
    maxRetries: 3,
    approvalRequired: false,
    externalWritesAllowed: false,
    queueLane: "supervisor",
    toolScope: ["vercel_cron", "supabase", "receipts"]
  };
  const agentRunPersistence = await persistWorkflowAgentRun(supervisorSpec, {
    ok: true,
    runId,
    workflow: "supervisor",
    trigger,
    status: "completed",
    completed,
    blockedForApproval,
    failed,
    mediaQueue,
    draftSeed
  });

  return {
    ok: failed === 0,
    runId,
    workflow: "supervisor",
    trigger,
    productionActionAllowed: false,
    externalWritesAllowed: false,
    completed,
    blockedForApproval,
    failed,
    connectors,
    mediaQueue,
    draftSeed,
    childWorkflows: childResults,
    persistence,
    agentRunPersistence,
    receipt: supervisorReceipt
  };
}

export function getEdenWorkflowReadiness() {
  return {
    ok: true,
    productionActionAllowed: false,
    workflowPackageInstalled: true,
    cronPath: "/api/cron/eden-skye-five-minute",
    supervisorPath: "/api/eden-skye/workflows",
    childWorkflowPath: "/api/eden-skye/workflows/{workflow}",
    childWorkflows: edenChildWorkflowSpecs,
    draftOpsSeed: {
      installed: true,
      expectedMigration: "20260609063000_eden_draft_ops_queue_keys.sql",
      seededTables: ["eden_content_items", "eden_engagement_tickets", "eden_experiments", "eden_memory_entries"],
      externalWritesAllowed: false
    },
    requiredApprovalBeforeExternalWrites: true,
    protectedExternalWrites: ["Metricool publish/schedule", "Shopify/Xyla write", "Google Drive archive write", "HeyGen paid generation", "n8n dispatch", "social replies/messages"]
  };
}

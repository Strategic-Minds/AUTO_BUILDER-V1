import {
  buildQueueSeed,
  edenCohorts,
  edenModules,
  edenProtectedActions,
  getConnectorReadiness,
  getSupabaseAdmin
} from "@/lib/eden-skye-os";
import { getEdenWorkflowReadiness } from "@/lib/eden-skye-workflows";

type Row = Record<string, unknown>;
type CountMap = Record<string, number>;

function countBy(rows: Row[], key: string, fallback = "unknown"): CountMap {
  return rows.reduce<CountMap>((acc, row) => {
    const value = typeof row[key] === "string" && row[key] ? String(row[key]) : fallback;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function countWhere(rows: Row[], key: string, value: string) {
  return rows.filter((row) => row[key] === value).length;
}

async function readRows(table: string, columns: string, limit = 1000, orderBy = "created_at") {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, rows: [] as Row[], reason: "Supabase env not configured" };

  try {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(orderBy, { ascending: false })
      .limit(limit);

    if (error) return { ok: false, rows: [] as Row[], reason: error.message };
    return { ok: true, rows: (data || []) as Row[] };
  } catch (error) {
    return { ok: false, rows: [] as Row[], reason: error instanceof Error ? error.message : "Unknown Supabase read error" };
  }
}

export async function buildEdenAdminControlSnapshot() {
  const [models, assets, content, engagement, experiments, agentRuns, receipts, memory] = await Promise.all([
    readRows("eden_models", "external_key, display_name, cohort, status, risk_class, automation_capabilities, content_boundaries", 1000, "external_key"),
    readRows("eden_assets", "asset_key, asset_type, provider, qa_status, approval_state, quarantine_reason, metadata, created_at", 1000),
    readRows("eden_content_items", "platform, content_type, pillar, approval_state, connector_state, scheduled_for, created_at", 1000),
    readRows("eden_engagement_tickets", "platform, risk_class, approval_state, outbound_state, created_at", 1000),
    readRows("eden_experiments", "experiment_type, status, primary_metric, winner_rule, created_at", 1000),
    readRows("eden_agent_runs", "agent_name, trigger, status, gate, production_action_allowed, created_at", 25),
    readRows("eden_receipts", "action, gate, ok, production_action_allowed, created_at", 25),
    readRows("eden_memory_entries", "scope, status, confidence, created_at", 1000)
  ]);

  const assetRows = assets.rows;
  const modelRows = models.rows;
  const contentRows = content.rows;
  const engagementRows = engagement.rows;
  const experimentRows = experiments.rows;
  const receiptRows = receipts.rows;
  const agentRunRows = agentRuns.rows;
  const memoryRows = memory.rows;

  const queuedImageAssets = assetRows.filter((row) => row.provider === "eden_image_queue");
  const missingImageAssets = queuedImageAssets.filter((row) => row.qa_status === "missing_or_pending_upload");
  const draftApprovalAssets = queuedImageAssets.filter((row) => row.approval_state === "draft");

  const approvalLocks = [
    { lane: "asset_linking", status: "blocked_for_approval", reason: "Requires validated Drive image IDs or URLs." },
    { lane: "schedule_drafts", status: "blocked_for_approval", reason: "Requires owner approval before Metricool/Xyla scheduling." },
    { lane: "dispatch_approved", status: "blocked_for_approval", reason: "Requires owner approval and connector-specific evidence." },
    { lane: "eden_closet_release", status: "blocked_for_approval", reason: "Membership/adult content release must stay locked until policy, payment, age gate, and operator approval are complete." }
  ];

  const automationLanes = [
    { lane: "five_minute_supervisor", state: "ready", route: "/api/cron/eden-skye-five-minute", next: "Runs workflow supervisor with receipts when invoked by Vercel Cron." },
    { lane: "model_registry", state: modelRows.length >= 160 ? "ready" : "needs_seed", route: "/api/eden-skye/os", next: "Feed website, media, content, and approval systems from model records." },
    { lane: "media_library", state: queuedImageAssets.length >= 160 ? "queued" : "needs_queue", route: "/api/eden-skye/workflows/image_inventory", next: "Generate or upload approved image batches, then link asset IDs." },
    { lane: "website_backend", state: "ready_to_build", route: "/admin/eden-skye", next: "Use this snapshot as the admin command-center data contract." },
    { lane: "edens_closet", state: "approval_gated_design", route: "/admin/eden-skye", next: "Build membership backend, age gate, payment gate, access tiers, and content release queue without public release." },
    { lane: "engagement_desk", state: "draft_only", route: "/api/eden-skye/workflows/create_drafts", next: "Draft comments, replies, and messages; never send without approval." },
    { lane: "ab_testing_lab", state: experimentRows.length > 0 ? "tracking" : "needs_seed", route: "/admin/eden-skye", next: "Seed website/model/content experiments and winner rules." },
    { lane: "memory_reflection", state: "ready", route: "/api/eden-skye/workflows/memory_reflection", next: "Persist operating reflections and next-best actions." }
  ];

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    productionActionAllowed: false,
    externalWritesAllowed: false,
    system: "eden-skye-studios-auto-social-os",
    connectors: getConnectorReadiness(),
    workflows: getEdenWorkflowReadiness(),
    cohorts: edenCohorts,
    modules: edenModules,
    protectedActions: edenProtectedActions,
    queueSeed: buildQueueSeed(),
    counts: {
      models: modelRows.length,
      assets: assetRows.length,
      queuedImageAssets: queuedImageAssets.length,
      missingImageAssets: missingImageAssets.length,
      draftApprovalAssets: draftApprovalAssets.length,
      contentItems: contentRows.length,
      engagementTickets: engagementRows.length,
      experiments: experimentRows.length,
      agentRuns: agentRunRows.length,
      receipts: receiptRows.length,
      memoryEntries: memoryRows.length
    },
    modelCoverage: {
      byCohort: countBy(modelRows, "cohort"),
      byStatus: countBy(modelRows, "status"),
      byRisk: countBy(modelRows, "risk_class")
    },
    mediaLibrary: {
      byType: countBy(assetRows, "asset_type"),
      byQaStatus: countBy(assetRows, "qa_status"),
      byApprovalState: countBy(assetRows, "approval_state"),
      readyForLinking: countWhere(assetRows, "qa_status", "approved"),
      needsGenerationOrUpload: missingImageAssets.length
    },
    publishingQueue: {
      byApprovalState: countBy(contentRows, "approval_state"),
      byConnectorState: countBy(contentRows, "connector_state"),
      platforms: countBy(contentRows, "platform")
    },
    engagementDesk: {
      byApprovalState: countBy(engagementRows, "approval_state"),
      byOutboundState: countBy(engagementRows, "outbound_state"),
      byRisk: countBy(engagementRows, "risk_class")
    },
    experiments: {
      byType: countBy(experimentRows, "experiment_type"),
      byStatus: countBy(experimentRows, "status")
    },
    operations: {
      agentRuns: agentRunRows,
      receipts: receiptRows,
      memory: {
        byScope: countBy(memoryRows, "scope"),
        byStatus: countBy(memoryRows, "status")
      }
    },
    approvalLocks,
    automationLanes,
    readStatus: {
      models: models.ok,
      assets: assets.ok,
      content: content.ok,
      engagement: engagement.ok,
      experiments: experiments.ok,
      agentRuns: agentRuns.ok,
      receipts: receipts.ok,
      memory: memory.ok
    },
    nextActions: [
      "Build the admin command center from this snapshot contract.",
      "Seed website, Eden's Closet, A/B testing, publishing, and engagement queue rows in preview only.",
      "Generate or upload image batches only after explicit approval.",
      "Keep live publishing, paid generation, Drive writes, and membership releases locked until approval receipts exist."
    ]
  };
}

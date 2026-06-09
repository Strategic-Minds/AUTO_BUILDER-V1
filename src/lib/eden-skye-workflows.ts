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

async function persistWorkflowAgentRun(spec: EdenWorkflowSpec, result: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { mode: "memory_only", ok: true, reason: "Supabase env not configured" };

  const { error } = await supabase.from("eden_agent_runs").insert({
    agent_name: `eden_workflow_${spec.name}`,
    trigger: String(result.trigger || "manual_or_cron"),
    status: result.status === "blocked_for_approval" ? "blocked" : "completed",
    gate: workflowGate(spec),
    production_action_allowed: false,
    logs: [result],
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

export async function runEdenChildWorkflow(name: EdenWorkflowName, input: EdenWorkflowInput = {}) {
  const spec = edenChildWorkflowSpecs.find((item) => item.name === name);
  if (!spec) {
    return {
      ok: false,
      workflow: name,
      error: "Unknown Eden Skye child workflow",
      productionActionAllowed: false
    };
  }

  const trigger = input.trigger || "manual_or_cron";
  const runId = buildWorkflowRunId(spec.name);
  const gate = workflowGate(spec);
  const status = spec.approvalRequired ? "blocked_for_approval" : "completed";
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
    payload: input.payload || {}
  });
  const persistence = await persistEdenReceipt(receipt);

  const result = {
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
    persistence,
    receipt
  };

  const agentRunPersistence = await persistWorkflowAgentRun(spec, result);
  return { ...result, agentRunPersistence };
}

export async function runEdenWorkflowSupervisor(input: EdenWorkflowInput = {}) {
  const trigger = input.trigger || "manual_or_cron";
  const runId = buildWorkflowRunId("supervisor");
  const childResults = [];

  for (const spec of edenChildWorkflowSpecs) {
    childResults.push(await runEdenChildWorkflow(spec.name, { ...input, trigger, simulateOnly: input.simulateOnly !== false }));
  }

  const completed = childResults.filter((item) => item.ok && item.status === "completed").length;
  const blockedForApproval = childResults.filter((item) => item.ok && item.status === "blocked_for_approval").length;
  const failed = childResults.filter((item) => !item.ok).length;
  const connectors = getConnectorReadiness();
  const registry = buildModelRegistrySeed();

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
    missingImageAssetPolicy: "generate_or_upload_batches_only_after_approval_and_available_packets"
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
    failed
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
    requiredApprovalBeforeExternalWrites: true,
    protectedExternalWrites: ["Metricool publish/schedule", "Shopify/Xyla write", "Google Drive archive write", "HeyGen paid generation", "n8n dispatch", "social replies/messages"]
  };
}

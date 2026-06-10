import { analyzeToolExposure } from "./analyzer";
import { makeCloudReceipt, writeCloudReceipt } from "./cloud-receipts";
import { classifyCloudAction, type RiskClass } from "./policy";

type AutoHealAction = {
  id: string;
  riskClass: RiskClass;
  mutation: boolean;
  system: string;
  action: string;
};

export async function recordToolExposure(input: { exposedTools?: unknown[]; expectedTools?: string[] } = {}) {
  const analysis = analyzeToolExposure(input);
  const receipt = makeCloudReceipt({
    kind: "mcp_tool_exposure_receipt",
    operation: "record_mcp_tool_exposure",
    target: { system: "auto_builder_2_mcp" },
    payload: analysis,
    result: {
      status: analysis.status,
      summary: `${analysis.exposed_count}/${analysis.expected_count} expected AUTO BUILDER 2 tools exposed; mode=${analysis.mode}`
    },
    nextAction: analysis.recommended_next_action
  });

  return {
    analysis,
    persistence: await writeCloudReceipt(receipt)
  };
}

export async function enqueueExposureFallbackJob(input: {
  exposedTools?: unknown[];
  expectedTools?: string[];
  title?: string;
} = {}) {
  const analysis = analyzeToolExposure(input);
  const task = {
    id: `mcp_exposure_fallback_${Date.now()}`,
    title: input.title ?? "AUTO BUILDER 2 MCP exposure fallback and auto-heal",
    system: "cloud_control_plane",
    riskClass: 1,
    mutation: false,
    status: "queued",
    blocker: analysis.fallback_required ? "blocked_tool_not_exposed" : undefined,
    spec: {
      exposure: analysis,
      auto_heal_steps: [
        "Record tool exposure receipt in cloud telemetry.",
        "Prefer run_universal_job if exposed.",
        "If run_universal_job is missing, continue cloud queue and receipt work.",
        "Prepare branch-safe stabilizer promotion packet.",
        "Do not perform production mutation or connector writes without approval."
      ],
      fallback_mode: analysis.mode
    }
  };

  const receipt = makeCloudReceipt({
    kind: "queue",
    operation: "enqueue_mcp_exposure_fallback",
    target: { system: "cloud_control_plane", task_id: task.id },
    payload: { task },
    result: { status: "queued", summary: task.title },
    nextAction: "Process via cloud universal-job or approved Vercel workflow."
  });

  return {
    task,
    persistence: await writeCloudReceipt(receipt)
  };
}

export function buildAutoHealPlan(input: { exposedTools?: unknown[]; expectedTools?: string[] } = {}) {
  const analysis = analyzeToolExposure(input);
  const actions: AutoHealAction[] = [
    {
      id: "record_exposure_receipt",
      riskClass: 1,
      mutation: false,
      system: "cloud_control_plane",
      action: "Emit mcp_tool_exposure_receipt to cloud telemetry at the beginning of each run."
    },
    {
      id: "route_universal_executor",
      riskClass: 1,
      mutation: false,
      system: "cloud_control_plane",
      action: "If run_universal_job is exposed, route all execution families through governed job types."
    },
    {
      id: "fallback_cloud_queue",
      riskClass: 1,
      mutation: false,
      system: "cloud_control_plane",
      action: "If run_universal_job is missing, continue cloud queue, docs, packets, and validation."
    },
    {
      id: "stabilize_server_surface",
      riskClass: 1,
      mutation: false,
      system: "cloud_control_plane",
      action: "Promote small stable MCP surface plus universal executor in a branch-safe PR after approval."
    },
    {
      id: "block_protected_mutation",
      riskClass: 3,
      mutation: true,
      system: "github_protected",
      action: "Do not merge, deploy, mutate secrets, or widen connector permissions without explicit approval."
    }
  ];

  return {
    status: analysis.fallback_required ? "auto_heal_required" : "healthy",
    analysis,
    actions: actions.map((action) => ({
      ...action,
      policy: classifyCloudAction(action)
    }))
  };
}

export async function dispatchUniversalJob(input: {
  jobType?: string;
  job_type?: string;
  riskClass?: number;
  mutation?: boolean;
  system?: string;
  approvalState?: "not_required" | "pending" | "approved" | "rejected" | "expired" | "blocked";
  exposedTools?: unknown[];
}) {
  const jobType = input.jobType ?? input.job_type;
  const riskClass = input.riskClass ?? 1;
  const mutation = Boolean(input.mutation);
  const system = input.system ?? "cloud_control_plane";
  const policy = classifyCloudAction({ riskClass: riskClass as RiskClass, mutation, system, approvalState: input.approvalState });

  if (!policy.allowed) {
    const receipt = makeCloudReceipt({
      kind: "policy_block",
      operation: "dispatch_universal_job",
      riskClass,
      mutation,
      target: { system, job_type: jobType },
      payload: input,
      result: { status: "blocked", summary: policy.reason },
      nextAction: "Request explicit approval or convert to cloud diagnostic dry-run."
    });

    return {
      status: "blocked",
      policy,
      persistence: await writeCloudReceipt(receipt)
    };
  }

  if (jobType === "record_tool_exposure") {
    return { status: "completed_cloud", policy, result: await recordToolExposure(input) };
  }

  if (jobType === "create_auto_heal_plan") {
    return { status: "completed_cloud", policy, result: buildAutoHealPlan(input) };
  }

  if (jobType === "queue_branch_safe_promotion" || jobType === "draft_universal_job_packet") {
    return { status: "completed_cloud", policy, result: await enqueueExposureFallbackJob(input) };
  }

  const receipt = makeCloudReceipt({
    kind: "queue",
    operation: "dispatch_universal_job",
    riskClass,
    mutation,
    target: { system, job_type: jobType },
    payload: input,
    result: { status: "queued_for_remote_executor", summary: "Job type requires live run_universal_job exposure." },
    nextAction: "Retry when AUTO BUILDER 2 exposes run_universal_job or promote the universal executor stabilizer."
  });

  return {
    status: "queued_for_remote_executor",
    policy,
    persistence: await writeCloudReceipt(receipt)
  };
}

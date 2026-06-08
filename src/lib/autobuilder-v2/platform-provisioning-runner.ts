export type PlatformProvisioningPayload = {
  job_id: string;
  mode?: "dry_run" | "approval_gated" | "execute";
  actions?: string[];
  name?: string;
  description?: string;
  github_owner?: string;
  github_repo?: string;
  vercel_team_id?: string;
  vercel_project_name?: string;
  framework?: string;
  git_repository_url?: string;
  workflow_name?: string;
  workflow_entrypoint?: string;
  workflow_topics?: string[];
  sandbox_name?: string;
  ai_gateway_key_name?: string;
  agent_name?: string;
  agent_model?: string;
  approval_required?: boolean;
  approved_actions?: string[];
  blocked_actions?: string[];
};

export const platformProvisioningTools = [
  "run_platform_provisioning_job",
  "create_github_repo",
  "create_vercel_project",
  "create_vercel_workflow",
  "create_vercel_sandbox",
  "create_ai_gateway",
  "create_vercel_agent"
];

const defaultBlockedActions = [...platformProvisioningTools, "token_creation", "billing_change", "production_deploy", "domain_purchase"];

function plannedTarget(input: PlatformProvisioningPayload, action: string) {
  if (action === "create_github_repo") return { provider: "github", owner: input.github_owner, repo: input.github_repo ?? input.name };
  if (action === "create_vercel_project") return { provider: "vercel", teamId: input.vercel_team_id, project: input.vercel_project_name ?? input.name, framework: input.framework ?? "nextjs", gitRepository: input.git_repository_url };
  if (action === "create_vercel_workflow") return { provider: "vercel", workflow: input.workflow_name ?? input.name, entrypoint: input.workflow_entrypoint ?? "app/workflows/auto_builder_workflow.ts", topics: input.workflow_topics ?? ["__wkf_*"] };
  if (action === "create_vercel_sandbox") return { provider: "vercel", sandbox: input.sandbox_name ?? input.name, project: input.vercel_project_name };
  if (action === "create_ai_gateway") return { provider: "vercel_ai_gateway", keyName: input.ai_gateway_key_name ?? input.name };
  if (action === "create_vercel_agent") return { provider: "vercel_ai_gateway", agent: input.agent_name ?? input.name, model: input.agent_model ?? "ai-gateway/default" };
  return { provider: "unknown", name: input.name };
}

function operation(input: PlatformProvisioningPayload, action: string) {
  const approved = input.approved_actions ?? [];
  const blockedActions = Array.from(new Set([...(input.blocked_actions ?? []), ...defaultBlockedActions]));
  const blocked = blockedActions.includes(action) && !approved.includes(action);
  return {
    action,
    target: plannedTarget(input, action),
    status: blocked ? "blocked_by_policy" : "planned",
    requires_approval: blocked || input.mode !== "dry_run",
    receipt_required: true
  };
}

export function runPlatformProvisioningJob(input: PlatformProvisioningPayload) {
  const actions = input.actions?.length ? input.actions : ["create_vercel_project"];
  const planned_operations = actions.map((action) => operation(input, action));
  const blocked_operations = planned_operations.filter((item) => item.status === "blocked_by_policy");
  return {
    ok: true,
    job_id: input.job_id,
    mode: input.mode ?? "dry_run",
    platformProvisioningTools,
    approval_required: input.approval_required ?? (blocked_operations.length > 0 || input.mode !== "dry_run"),
    planned_operations,
    blocked_operations,
    receipts: planned_operations.map((item) => ({ provider: "platform_provisioning", job_id: input.job_id, action: item.action, status: item.status === "blocked_by_policy" ? "blocked" : "planned", timestamp: new Date().toISOString() })),
    validation_status: blocked_operations.length ? "blocked" : "planned",
    execution_note: "Planner-only until provider execution adapters and explicit approvals are configured.",
    rollback_plan: "Delete or disable created repos, projects, keys, sandboxes, workflows, or agents through provider-specific rollback adapters."
  };
}

export const createGithubRepo = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_github_repo"] });
export const createVercelProject = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_vercel_project"] });
export const createVercelWorkflow = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_vercel_workflow"] });
export const createVercelSandbox = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_vercel_sandbox"] });
export const createAiGateway = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_ai_gateway"] });
export const createVercelAgent = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_vercel_agent"] });

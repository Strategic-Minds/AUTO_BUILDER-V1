export type PlatformProvisioningPayload = {
  job_id: string;
  mode?: "dry_run" | "approval_gated" | "execute";
  actions?: string[];
  name?: string;
  description?: string;
  github_owner?: string;
  github_repo?: string;
  github_private?: boolean;
  vercel_team_id?: string;
  vercel_project_name?: string;
  framework?: string;
  git_repository_url?: string;
  root_directory?: string;
  workflow_name?: string;
  workflow_entrypoint?: string;
  workflow_topics?: string[];
  workflow_schedule?: string;
  timezone?: string;
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

type OperationResult = {
  action: string;
  target: Record<string, unknown>;
  status: string;
  requires_approval: boolean;
  receipt_required: boolean;
  created_resource_url?: string;
  created_resource_id?: string;
  error?: string;
};

const defaultBlockedActions = [...platformProvisioningTools, "token_creation", "billing_change", "production_deploy", "domain_purchase"];

function plannedTarget(input: PlatformProvisioningPayload, action: string) {
  if (action === "create_github_repo") return { provider: "github", owner: input.github_owner, repo: input.github_repo ?? input.name, private: input.github_private ?? true };
  if (action === "create_vercel_project") return { provider: "vercel", teamId: input.vercel_team_id ?? process.env.VERCEL_TEAM_ID, project: input.vercel_project_name ?? input.name, framework: input.framework ?? "nextjs", gitRepository: input.git_repository_url, rootDirectory: input.root_directory };
  if (action === "create_vercel_workflow") return { provider: "vercel", workflow: input.workflow_name ?? input.name, entrypoint: input.workflow_entrypoint ?? "app/workflows/auto_builder_workflow.ts", schedule: input.workflow_schedule ?? "manual", topics: input.workflow_topics ?? ["__wkf_*"] };
  if (action === "create_vercel_sandbox") return { provider: "vercel", sandbox: input.sandbox_name ?? input.name, project: input.vercel_project_name };
  if (action === "create_ai_gateway") return { provider: "vercel_ai_gateway", keyName: input.ai_gateway_key_name ?? "AI_GATEWAY_API_KEY", project: input.vercel_project_name ?? input.name };
  if (action === "create_vercel_agent") return { provider: "vercel_ai_gateway", agent: input.agent_name ?? input.name, model: input.agent_model ?? "ai-gateway/default" };
  return { provider: "unknown", name: input.name };
}

function isApproved(input: PlatformProvisioningPayload, action: string) {
  return input.mode === "execute" && Boolean(input.approved_actions?.includes(action));
}

function planOperation(input: PlatformProvisioningPayload, action: string): OperationResult {
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

function parseGitHubRepo(input: PlatformProvisioningPayload) {
  const explicitOwner = input.github_owner;
  const explicitRepo = input.github_repo;
  if (explicitOwner && explicitRepo) return { owner: explicitOwner, repo: explicitRepo.replace(/^.*\//, "") };

  const value = input.git_repository_url ?? "";
  const match = value.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function encodeBase64(content: string) {
  return Buffer.from(content, "utf8").toString("base64");
}

function decodeBase64(content: string) {
  return Buffer.from(content, "base64").toString("utf8");
}

async function githubJson(url: string, init: RequestInit = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { ok: false, status: 0, data: { error: "GITHUB_TOKEN is not configured." } };

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {})
    }
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

async function createGithubRepoAdapter(input: PlatformProvisioningPayload): Promise<OperationResult> {
  const action = "create_github_repo";
  const base = planOperation(input, action);
  if (!isApproved(input, action)) return base;

  const token = process.env.GITHUB_TOKEN;
  if (!token) return { ...base, status: "blocked_missing_secret", error: "GITHUB_TOKEN is not configured." };

  const repoName = input.github_repo ?? input.name;
  if (!repoName) return { ...base, status: "blocked_invalid_payload", error: "github_repo or name is required." };

  const owner = input.github_owner;
  const endpoint = owner ? `https://api.github.com/orgs/${owner}/repos` : "https://api.github.com/user/repos";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      name: repoName,
      description: input.description,
      private: input.github_private ?? true,
      auto_init: true
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ...base, status: "failed", error: JSON.stringify(data) };

  return {
    ...base,
    status: "created",
    created_resource_url: data.html_url,
    created_resource_id: data.id ? String(data.id) : undefined,
    requires_approval: false
  };
}

async function createVercelProjectAdapter(input: PlatformProvisioningPayload): Promise<OperationResult> {
  const action = "create_vercel_project";
  const base = planOperation(input, action);
  if (!isApproved(input, action)) return base;

  const token = process.env.VERCEL_TOKEN;
  const teamId = input.vercel_team_id ?? process.env.VERCEL_TEAM_ID;
  if (!token) return { ...base, status: "blocked_missing_secret", error: "VERCEL_TOKEN is not configured." };

  const projectName = input.vercel_project_name ?? input.name;
  if (!projectName) return { ...base, status: "blocked_invalid_payload", error: "vercel_project_name or name is required." };

  const body: Record<string, unknown> = {
    name: projectName,
    framework: input.framework ?? "nextjs"
  };
  if (input.root_directory) body.rootDirectory = input.root_directory;
  if (input.git_repository_url) body.gitRepository = { type: "github", repo: input.git_repository_url };

  const url = new URL("https://api.vercel.com/v11/projects");
  if (teamId) url.searchParams.set("teamId", teamId);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ...base, status: "failed", error: JSON.stringify(data) };

  return {
    ...base,
    status: "created",
    created_resource_url: `https://vercel.com/${teamId ?? "dashboard"}/${projectName}`,
    created_resource_id: data.id,
    requires_approval: false
  };
}

async function createVercelWorkflowAdapter(input: PlatformProvisioningPayload): Promise<OperationResult> {
  const action = "create_vercel_workflow";
  const base = planOperation(input, action);
  if (!isApproved(input, action)) return base;

  const repo = parseGitHubRepo(input);
  if (!repo) return { ...base, status: "blocked_invalid_payload", error: "github_owner/github_repo or git_repository_url is required." };

  const route = input.workflow_entrypoint ?? "/api/cron/validation";
  const schedule = input.workflow_schedule ?? "*/5 * * * *";
  const contentsUrl = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/vercel.json`;
  const existing = await githubJson(contentsUrl);

  let config: Record<string, unknown> = {};
  let sha: string | undefined;
  if (existing.ok && typeof existing.data?.content === "string") {
    sha = typeof existing.data.sha === "string" ? existing.data.sha : undefined;
    try {
      config = JSON.parse(decodeBase64(existing.data.content));
    } catch {
      return { ...base, status: "failed", error: "Existing vercel.json is not valid JSON." };
    }
  } else if (existing.status !== 404) {
    return { ...base, status: "failed", error: JSON.stringify(existing.data) };
  }

  const crons = Array.isArray(config.crons) ? config.crons.filter((item) => typeof item === "object" && item !== null) as Record<string, unknown>[] : [];
  const nextCron = { path: route, schedule };
  const cronIndex = crons.findIndex((item) => item.path === route);
  const nextCrons = cronIndex >= 0 ? crons.map((item, index) => index === cronIndex ? nextCron : item) : [...crons, nextCron];
  const nextConfig = { ...config, crons: nextCrons };

  const update = await githubJson(contentsUrl, {
    method: "PUT",
    body: JSON.stringify({
      message: `Configure Vercel workflow cron: ${input.workflow_name ?? route}`,
      content: encodeBase64(`${JSON.stringify(nextConfig, null, 2)}\n`),
      sha
    })
  });

  if (!update.ok) return { ...base, status: "failed", error: JSON.stringify(update.data) };

  return {
    ...base,
    status: sha ? "updated" : "created",
    created_resource_url: `https://github.com/${repo.owner}/${repo.repo}/blob/main/vercel.json`,
    created_resource_id: `${repo.owner}/${repo.repo}:vercel.json:${route}`,
    requires_approval: false
  };
}

async function createAiGatewayAdapter(input: PlatformProvisioningPayload): Promise<OperationResult> {
  const action = "create_ai_gateway";
  const base = planOperation(input, action);
  if (!isApproved(input, action)) return base;

  const token = process.env.VERCEL_TOKEN;
  const teamId = input.vercel_team_id ?? process.env.VERCEL_TEAM_ID;
  const gatewayKey = process.env.AI_GATEWAY_API_KEY;
  const projectName = input.vercel_project_name ?? input.name;

  if (!token) return { ...base, status: "blocked_missing_secret", error: "VERCEL_TOKEN is not configured." };
  if (!gatewayKey) return { ...base, status: "blocked_missing_secret", error: "AI_GATEWAY_API_KEY is not configured." };
  if (!projectName) return { ...base, status: "blocked_invalid_payload", error: "vercel_project_name or name is required." };

  const url = new URL(`https://api.vercel.com/v10/projects/${encodeURIComponent(projectName)}/env`);
  if (teamId) url.searchParams.set("teamId", teamId);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      key: "AI_GATEWAY_API_KEY",
      value: gatewayKey,
      type: "encrypted",
      target: ["production", "preview", "development"]
    })
  });

  const data = await response.json().catch(() => ({}));
  const conflict = response.status === 409 || data?.error?.code === "env_already_exists";
  if (!response.ok && !conflict) return { ...base, status: "failed", error: JSON.stringify(data) };

  return {
    ...base,
    status: conflict ? "already_configured" : "created",
    created_resource_url: `https://vercel.com/${teamId ?? "dashboard"}/${projectName}/settings/environment-variables`,
    created_resource_id: data.id ? String(data.id) : "AI_GATEWAY_API_KEY",
    requires_approval: false
  };
}

async function runOperation(input: PlatformProvisioningPayload, action: string): Promise<OperationResult> {
  if (action === "create_github_repo") return createGithubRepoAdapter(input);
  if (action === "create_vercel_project") return createVercelProjectAdapter(input);
  if (action === "create_vercel_workflow") return createVercelWorkflowAdapter(input);
  if (action === "create_ai_gateway") return createAiGatewayAdapter(input);
  return planOperation(input, action);
}

export async function runPlatformProvisioningJob(input: PlatformProvisioningPayload) {
  const actions = input.actions?.length ? input.actions : ["create_vercel_project"];
  const planned_operations = await Promise.all(actions.map((action) => runOperation(input, action)));
  const blocked_operations = planned_operations.filter((item) => item.status === "blocked_by_policy" || item.status.startsWith("blocked_"));
  const failed_operations = planned_operations.filter((item) => item.status === "failed");
  return {
    ok: failed_operations.length === 0,
    job_id: input.job_id,
    mode: input.mode ?? "dry_run",
    platformProvisioningTools,
    approval_required: input.approval_required ?? (blocked_operations.length > 0 || input.mode !== "dry_run"),
    planned_operations,
    blocked_operations,
    failed_operations,
    receipts: planned_operations.map((item) => ({
      provider: "platform_provisioning",
      job_id: input.job_id,
      action: item.action,
      status: item.status,
      created_resource_url: item.created_resource_url,
      created_resource_id: item.created_resource_id,
      timestamp: new Date().toISOString()
    })),
    validation_status: failed_operations.length ? "failed" : blocked_operations.length ? "blocked" : planned_operations.some((item) => ["created", "updated", "already_configured"].includes(item.status)) ? "created" : "planned",
    execution_note: "Dry-run is default. Live repo/project/workflow configuration requires mode=execute plus approved_actions and provider tokens in the deployment environment.",
    rollback_plan: "If created, delete the GitHub repository, Vercel project, env var, or vercel.json cron entry from the provider dashboard/API. Store created_resource_url and created_resource_id from receipts for rollback."
  };
}

export const createGithubRepo = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_github_repo"] });
export const createVercelProject = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_vercel_project"] });
export const createVercelWorkflow = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_vercel_workflow"] });
export const createVercelSandbox = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_vercel_sandbox"] });
export const createAiGateway = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_ai_gateway"] });
export const createVercelAgent = (input: PlatformProvisioningPayload) => runPlatformProvisioningJob({ ...input, actions: ["create_vercel_agent"] });

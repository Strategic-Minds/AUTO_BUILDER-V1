export const AUTO_BUILDER_VERSION = "0.4.0";

export const PROTECTED_MUTATION_RULE =
  "No protected mutation without Jeremy explicit current-session command.";

type JsonRecord = Record<string, unknown>;

type WorkflowBridgeJob = {
  job_id: string;
  runs_on?: string;
  steps?: Array<string | JsonRecord>;
};

type WorkflowBridgeRequest = {
  repo: string;
  target_path: string;
  workflow_name: string;
  workflow_goal: string;
  trigger_type: string;
  schedule_cron?: string;
  jobs: WorkflowBridgeJob[];
  permissions?: Record<string, string>;
  secrets_required?: string[];
  writes_repo_contents?: boolean;
  writes_external_systems?: boolean;
  requires_human_approval?: boolean;
  validation_plan?: string[];
  rollback_plan?: string[];
};

function asRecord(value: unknown): JsonRecord {
  return typeof value === "object" && value !== null ? (value as JsonRecord) : {};
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function encodeRepoPath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function yamlScalar(value: string) {
  return JSON.stringify(value);
}

function workflowTriggers(triggerType: string, scheduleCron?: string) {
  const normalized = triggerType.toLowerCase();
  const lines: string[] = ["on:"];

  if (normalized.includes("schedule") && scheduleCron) {
    lines.push("  schedule:");
    lines.push(`    - cron: ${yamlScalar(scheduleCron)}`);
  }

  if (normalized.includes("manual") || normalized.includes("dispatch") || normalized.includes("schedule_and_manual")) {
    lines.push("  workflow_dispatch:");
  }

  if (lines.length === 1) {
    lines.push("  workflow_dispatch:");
  }

  return lines;
}

function serializeStep(step: string | JsonRecord, index: number) {
  if (typeof step === "string") {
    const trimmed = step.trim();
    if (trimmed.includes("@") && !trimmed.includes(" ")) {
      return [`      - uses: ${yamlScalar(trimmed)}`];
    }
    return [
      `      - name: ${yamlScalar(`step-${index + 1}`)}`,
      `        run: ${yamlScalar(trimmed)}`
    ];
  }

  const lines = ["      -"];
  const name = typeof step.name === "string" ? step.name : `step-${index + 1}`;
  lines.push(`        name: ${yamlScalar(name)}`);

  if (typeof step.uses === "string") {
    lines.push(`        uses: ${yamlScalar(step.uses)}`);
  }

  if (typeof step.run === "string") {
    lines.push(`        run: ${yamlScalar(step.run)}`);
  }

  const withBlock = asRecord(step.with);
  const withEntries = Object.entries(withBlock).filter(([, value]) => typeof value === "string");
  if (withEntries.length > 0) {
    lines.push("        with:");
    for (const [key, value] of withEntries) {
      lines.push(`          ${key}: ${yamlScalar(String(value))}`);
    }
  }

  return lines;
}

function buildWorkflowYaml(request: WorkflowBridgeRequest) {
  const lines: string[] = [`name: ${request.workflow_name}`];
  lines.push(...workflowTriggers(request.trigger_type, request.schedule_cron));

  const permissions = request.permissions || {};
  const permissionEntries = Object.entries(permissions);
  if (permissionEntries.length > 0) {
    lines.push("permissions:");
    for (const [key, value] of permissionEntries) {
      lines.push(`  ${key}: ${value}`);
    }
  }

  lines.push("jobs:");
  for (const job of request.jobs) {
    lines.push(`  ${job.job_id}:`);
    lines.push(`    runs-on: ${job.runs_on || "ubuntu-latest"}`);
    lines.push("    steps:");
    const steps = Array.isArray(job.steps) ? job.steps : [];
    for (let index = 0; index < steps.length; index += 1) {
      lines.push(...serializeStep(steps[index], index));
    }
  }

  return `${lines.join("\n")}\n`;
}

function parseWorkflowBridgeRequest(input: JsonRecord) {
  const jobsRaw = Array.isArray(input.jobs) ? input.jobs : [];
  const jobs: WorkflowBridgeJob[] = jobsRaw
    .map((job) => asRecord(job))
    .filter((job) => typeof job.job_id === "string")
    .map((job) => ({
      job_id: String(job.job_id),
      runs_on: typeof job.runs_on === "string" ? job.runs_on : undefined,
      steps: Array.isArray(job.steps) ? (job.steps as Array<string | JsonRecord>) : undefined
    }));

  const permissionEntries = Object.entries(asRecord(input.permissions)).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string"
  );

  return {
    repo: typeof input.repo === "string" ? input.repo : "",
    target_path: typeof input.target_path === "string" ? input.target_path : "",
    workflow_name: typeof input.workflow_name === "string" ? input.workflow_name : "",
    workflow_goal: typeof input.workflow_goal === "string" ? input.workflow_goal : "",
    trigger_type: typeof input.trigger_type === "string" ? input.trigger_type : "",
    schedule_cron: typeof input.schedule_cron === "string" ? input.schedule_cron : undefined,
    jobs,
    permissions: Object.fromEntries(permissionEntries),
    secrets_required: asStringArray(input.secrets_required),
    writes_repo_contents: input.writes_repo_contents === true,
    writes_external_systems: input.writes_external_systems === true,
    requires_human_approval: input.requires_human_approval === true,
    validation_plan: asStringArray(input.validation_plan),
    rollback_plan: asStringArray(input.rollback_plan)
  } satisfies WorkflowBridgeRequest;
}

function validateWorkflowBridgeRequest(request: WorkflowBridgeRequest) {
  const errors: string[] = [];

  if (!request.repo) errors.push("Missing repo.");
  if (!request.target_path) errors.push("Missing target_path.");
  if (!request.workflow_name) errors.push("Missing workflow_name.");
  if (!request.workflow_goal) errors.push("Missing workflow_goal.");
  if (!request.trigger_type) errors.push("Missing trigger_type.");
  if (request.jobs.length === 0) errors.push("At least one job is required.");
  if (!request.target_path.startsWith(".github/workflows/")) {
    errors.push("target_path must remain inside .github/workflows/.");
  }
  if (!request.target_path.endsWith(".yml") && !request.target_path.endsWith(".yaml")) {
    errors.push("target_path must end with .yml or .yaml.");
  }
  if (request.trigger_type.toLowerCase().includes("schedule") && !request.schedule_cron) {
    errors.push("schedule_cron is required for schedule triggers.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function isLowRiskWorkflowRequest(request: WorkflowBridgeRequest) {
  return (
    (request.secrets_required || []).length === 0 &&
    request.writes_external_systems !== true &&
    request.requires_human_approval !== true
  );
}

async function githubApiRequest(url: string, init: RequestInit) {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT || process.env.AUTO_BUILDER_GITHUB_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN, GITHUB_PAT, or AUTO_BUILDER_GITHUB_TOKEN.");
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {})
    }
  });

  if (response.status === 404) {
    return { response, body: null };
  }

  const body = (await response.json().catch(() => null)) as JsonRecord | null;
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${JSON.stringify(body)}`);
  }

  return { response, body };
}

async function upsertGitHubWorkflow(request: WorkflowBridgeRequest, workflowYaml: string) {
  const path = encodeRepoPath(request.target_path);
  const baseUrl = `https://api.github.com/repos/${request.repo}/contents/${path}`;
  const existing = await githubApiRequest(baseUrl, { method: "GET" });
  const existingSha = typeof existing.body?.sha === "string" ? existing.body.sha : undefined;

  const payload: JsonRecord = {
    message: existingSha
      ? `Update workflow via GPT bridge: ${request.workflow_name}`
      : `Create workflow via GPT bridge: ${request.workflow_name}`,
    content: Buffer.from(workflowYaml, "utf-8").toString("base64"),
    branch: "main"
  };

  if (existingSha) {
    payload.sha = existingSha;
  }

  const result = await githubApiRequest(baseUrl, {
    method: "PUT",
    body: JSON.stringify(payload)
  });

  const contentSha = typeof result.body?.content === "object" && result.body?.content && typeof (result.body.content as JsonRecord).sha === "string"
    ? String((result.body.content as JsonRecord).sha)
    : null;
  const commitSha = typeof result.body?.commit === "object" && result.body?.commit && typeof (result.body.commit as JsonRecord).sha === "string"
    ? String((result.body.commit as JsonRecord).sha)
    : null;

  return {
    status: existingSha ? "updated" : "created",
    workflow_sha: contentSha || commitSha,
    commit_sha: commitSha,
    existing_sha: existingSha || null
  };
}

function isGitHubWorkflowBridgeRequest(input: JsonRecord) {
  return (
    input.action === "create_github_workflow" ||
    input.action === "update_github_workflow" ||
    input.bridgeTarget === "github_workflow" ||
    (typeof input.target_path === "string" && input.target_path.startsWith(".github/workflows/"))
  );
}

async function handleGitHubWorkflowBridge(input: JsonRecord) {
  const request = parseWorkflowBridgeRequest(input);
  const validation = validateWorkflowBridgeRequest(request);
  const explicit = input.currentSessionExplicitCommand === true;
  const lowRisk = isLowRiskWorkflowRequest(request);

  if (!validation.valid) {
    return {
      status: "blocked",
      repo: request.repo,
      target_path: request.target_path,
      approval_state: "not_requested",
      validation_state: "failed",
      result_summary: "Workflow bridge request failed validation.",
      blockers: validation.errors,
      next_action: "Correct the request shape and retry."
    };
  }

  if (!explicit) {
    return {
      status: "awaiting_approval",
      repo: request.repo,
      target_path: request.target_path,
      approval_state: "required",
      validation_state: "passed",
      result_summary: "Protected mutation requires explicit current-session authorization.",
      blockers: [PROTECTED_MUTATION_RULE],
      next_action: "Resend with currentSessionExplicitCommand = true when exact mutation is authorized."
    };
  }

  if (!lowRisk) {
    return {
      status: "awaiting_approval",
      repo: request.repo,
      target_path: request.target_path,
      approval_state: "required",
      validation_state: "passed",
      result_summary: "Workflow bridge request is classified as higher-risk.",
      blockers: [
        "Request includes secrets, external writes, or explicit human-approval requirement."
      ],
      next_action: "Hold for human approval before writing the workflow file."
    };
  }

  const workflowYaml = buildWorkflowYaml(request);

  try {
    const result = await upsertGitHubWorkflow(request, workflowYaml);
    return {
      status: result.status,
      repo: request.repo,
      target_path: request.target_path,
      workflow_sha: result.workflow_sha,
      approval_state: "authorized",
      validation_state: "passed",
      result_summary: `${result.status.toUpperCase()}: GitHub workflow bridge wrote the target workflow file.`,
      blockers: [],
      next_action: "Inspect GitHub Actions runs and artifacts for the first execution.",
      workflow_preview: workflowYaml,
      commit_sha: result.commit_sha
    };
  } catch (error) {
    return {
      status: "failed",
      repo: request.repo,
      target_path: request.target_path,
      approval_state: "authorized",
      validation_state: "passed",
      result_summary: "GitHub workflow bridge failed during write execution.",
      blockers: [error instanceof Error ? error.message : "Unknown GitHub bridge error."],
      next_action: "Verify runtime GitHub token configuration and retry."
    };
  }
}

export function autobuilderStackStatus() {
  return {
    status: "ok",
    version: AUTO_BUILDER_VERSION,
    stack: [
      "Google Workspace",
      "Drive",
      "Sheets",
      "Shopify",
      "Stripe",
      "Repurpose.io",
      "Xyla",
      "Facebook",
      "Instagram",
      "TikTok",
      "YouTube",
      "LinkedIn",
      "Reddit",
      "GitHub",
      "Vercel",
      "Supabase",
      "OpenAI",
      "MCP",
      "REST Actions",
      "Webhooks"
    ],
    governance: PROTECTED_MUTATION_RULE,
    closedLoop:
      "GPT -> bridge -> apps -> telemetry -> recursive optimization"
  };
}

export function governancePreflight(input: Record<string, unknown>) {
  const mutation = input.mutationRequested === true;
  const explicit = input.currentSessionExplicitCommand === true;
  const blocked = mutation && !explicit;

  return {
    action: input.action || "unspecified",
    targetSystem: input.targetSystem || "unknown",
    classification: blocked
      ? "BLOCKED_OR_REQUIRES_HUMAN"
      : "SAFE_OR_AUTHORIZED",
    humanNeeded: blocked,
    nextStep: blocked
      ? "Stop and request exact approval."
      : "Continue governed execution."
  };
}

export function createRepurposeTaskPacket(input: Record<string, unknown>) {
  return {
    status: "TASK_PACKET_CREATED_NOT_EXECUTED",
    sourceVideoUrl: input.sourceVideoUrl || null,
    campaignName: input.campaignName || "Untitled Campaign",
    targetPlatforms: input.targetPlatforms || ["Facebook"],
    postsPerDay: input.postsPerDay || 3,
    handoff: [
      "Drive intake",
      "Repurpose.io",
      "Drive output",
      "Xyla/Facebook",
      "Shopify/Stripe attribution"
    ],
    governance: "No publish or money movement performed."
  };
}

export function recursivePromptChainNext(input: Record<string, unknown>) {
  const text = String(input.lastResponse || "");
  const match = text.match(
    /NEXT GPT INSTRUCTION:\s*```(?:text)?\s*([\s\S]*?)```/i
  );

  return {
    status: match
      ? "EXTRACTED_NEXT_INSTRUCTION"
      : "GENERATED_FALLBACK_NEXT_INSTRUCTION",
    nextInstruction:
      match?.[1]?.trim() ||
      "PHASE-NEXT / STEP-1 : Rehydrate AUTO BUILDER continuity, verify state, preserve governance, and continue.",
    governance: "This tool cannot authorize protected mutation."
  };
}

export function bridgeRegistry() {
  return {
    apiTargets: ["Shopify", "Stripe", "Supabase", "GitHub", "Vercel"],
    workspaceTargets: ["Google Drive", "Google Sheets", "Gmail"],
    contentTargets: [
      "Repurpose.io",
      "Xyla",
      "Facebook",
      "Instagram",
      "TikTok",
      "YouTube",
      "LinkedIn",
      "Reddit"
    ],
    automationFallbacks: ["Zapier", "Make", "n8n"],
    browserFallbacks: ["Browser automation when no API exists"],
    githubWorkflowBridge: {
      route: "/api/bridge/http",
      target: "github_workflow",
      supportedActions: ["create_github_workflow", "update_github_workflow"],
      governedTargetPrefix: ".github/workflows/",
      rule: PROTECTED_MUTATION_RULE
    },
    rule: "Use strongest safe bridge available."
  };
}

export async function genericHttpBridgePlan(input: Record<string, unknown>) {
  const normalized = asRecord(input);

  if (isGitHubWorkflowBridgeRequest(normalized)) {
    return handleGitHubWorkflowBridge(normalized);
  }

  return {
    status: "PLAN_ONLY_NOT_EXECUTED",
    targetUrl: normalized.targetUrl || null,
    method: normalized.method || "GET",
    safety: "Does not call external URLs yet."
  };
}

export function webhookIntake(input: Record<string, unknown>) {
  return {
    status: "WEBHOOK_RECEIVED",
    receivedAt: new Date().toISOString(),
    source: input.source || "unknown",
    eventType: input.eventType || "unknown",
    payloadKeys: Object.keys(input),
    governance: "Data intake only."
  };
}

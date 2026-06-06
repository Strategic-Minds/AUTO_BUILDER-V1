import { insertTelemetry } from '@/lib/telemetry-store';

export type GitHubWorkflowTarget = 'auto_builder' | 'eden_skye_studios';
export type GitHubWorkflowOperation = 'dispatch' | 'list_workflows' | 'list_runs' | 'list_jobs' | 'read_job_logs';

export type GitHubWorkflowBridgeRequest = {
  operation?: GitHubWorkflowOperation;
  targetSystem?: GitHubWorkflowTarget;
  owner?: string;
  repo?: string;
  workflowId?: string | number;
  runId?: string | number;
  jobId?: string | number;
  ref?: string;
  inputs?: Record<string, string | number | boolean>;
  perPage?: number;
  requestedBy?: string;
  approvedWorkflowRun?: boolean;
  approvalPhrase?: string;
};

export type GitHubWorkflowTargetConfig = {
  targetSystem: GitHubWorkflowTarget;
  owner: string;
  repo: string;
  defaultRef: string;
};

const TARGETS: Record<GitHubWorkflowTarget, GitHubWorkflowTargetConfig> = {
  auto_builder: {
    targetSystem: 'auto_builder',
    owner: 'Strategic-Minds',
    repo: 'AUTO_BUILDER',
    defaultRef: 'main'
  },
  eden_skye_studios: {
    targetSystem: 'eden_skye_studios',
    owner: 'Strategic-Minds',
    repo: 'EDENSKYESTUDIOS',
    defaultRef: 'main'
  }
};

const RISK_WORDS = ['prod', 'production', 'release', 'publish', 'shopify', 'stripe', 'payment', 'migration', 'delete', 'destroy'];
const SAFE_PREVIEW_WORKFLOW_INPUTS = new Set(['preview', 'auto_builder', 'eden_skye_studios', 'main']);

function getGitHubToken() {
  return process.env.GITHUB_WORKFLOW_TOKEN || process.env.GITHUB_TOKEN || null;
}

function envPresent(name: string) {
  return Boolean(process.env[name]);
}

function resolveTarget(input: GitHubWorkflowBridgeRequest): GitHubWorkflowTargetConfig {
  if (input.owner && input.repo) {
    return {
      targetSystem: input.targetSystem ?? 'auto_builder',
      owner: input.owner,
      repo: input.repo,
      defaultRef: input.ref ?? 'main'
    };
  }

  return TARGETS[input.targetSystem ?? 'auto_builder'];
}

function githubHeaders() {
  const token = getGitHubToken();
  return {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${token}`,
    'x-github-api-version': '2022-11-28'
  };
}

function parseJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

function isSafePreviewDispatch(input: GitHubWorkflowBridgeRequest) {
  const inputs = input.inputs ?? {};
  const mode = String(inputs.mode ?? '').toLowerCase();
  const targetSystem = String(inputs.target_system ?? inputs.targetSystem ?? input.targetSystem ?? '').toLowerCase();
  const ref = String(inputs.ref ?? input.ref ?? 'main').toLowerCase();

  return mode === 'preview' && SAFE_PREVIEW_WORKFLOW_INPUTS.has(targetSystem) && SAFE_PREVIEW_WORKFLOW_INPUTS.has(ref);
}

function isRiskyDispatch(input: GitHubWorkflowBridgeRequest) {
  if (isSafePreviewDispatch(input)) return false;

  const haystack = [
    input.ref ?? '',
    ...Object.entries(input.inputs ?? {}).flatMap(([key, value]) => [key, String(value)])
  ]
    .join(' ')
    .toLowerCase();

  return RISK_WORDS.some((word) => haystack.includes(word));
}

function workflowApproved(input: GitHubWorkflowBridgeRequest) {
  return input.approvedWorkflowRun === true && input.approvalPhrase === 'APPROVE GITHUB WORKFLOW RUN';
}

async function githubRequest(path: string, init?: RequestInit) {
  const token = getGitHubToken();
  if (!token) {
    return {
      ok: false,
      status: 503,
      data: { error: 'GITHUB_WORKFLOW_TOKEN or GITHUB_TOKEN is missing.' }
    };
  }

  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      ...githubHeaders(),
      ...(init?.headers ?? {})
    },
    cache: 'no-store'
  });

  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    data: parseJson(text)
  };
}

export function getGitHubWorkflowBridgeReadiness() {
  return {
    ok: true,
    secretsExposed: false,
    ready: Boolean(getGitHubToken()),
    configuredEnv: {
      GITHUB_WORKFLOW_TOKEN: envPresent('GITHUB_WORKFLOW_TOKEN'),
      GITHUB_TOKEN: envPresent('GITHUB_TOKEN')
    },
    targets: Object.values(TARGETS),
    approvalPolicy: {
      autonomousRead: true,
      autonomousDispatch: 'safe workflow_dispatch only, including preview redeploy workflow inputs',
      gatedDispatch: RISK_WORDS,
      requiredApprovalPhrase: 'APPROVE GITHUB WORKFLOW RUN'
    }
  };
}

export async function listWorkflows(input: GitHubWorkflowBridgeRequest) {
  const target = resolveTarget(input);
  const result = await githubRequest(`/repos/${target.owner}/${target.repo}/actions/workflows?per_page=${input.perPage ?? 30}`);
  await insertTelemetry('bridge_evidence', {
    worker: 'github-workflow-bridge',
    status: result.ok ? 'success' : 'failed',
    evidence: JSON.stringify({ operation: 'list_workflows', target, status: result.status }),
    blocker: result.ok ? null : JSON.stringify(result.data),
    created_at: new Date().toISOString()
  });
  return { ...result, target };
}

export async function listRuns(input: GitHubWorkflowBridgeRequest) {
  const target = resolveTarget(input);
  const perPage = input.perPage ?? 20;
  const path = input.workflowId
    ? `/repos/${target.owner}/${target.repo}/actions/workflows/${input.workflowId}/runs?per_page=${perPage}`
    : `/repos/${target.owner}/${target.repo}/actions/runs?per_page=${perPage}`;
  const result = await githubRequest(path);
  await insertTelemetry('bridge_evidence', {
    worker: 'github-workflow-bridge',
    status: result.ok ? 'success' : 'failed',
    evidence: JSON.stringify({ operation: 'list_runs', target, workflowId: input.workflowId ?? null, status: result.status }),
    blocker: result.ok ? null : JSON.stringify(result.data),
    created_at: new Date().toISOString()
  });
  return { ...result, target };
}

export async function listJobs(input: GitHubWorkflowBridgeRequest) {
  const target = resolveTarget(input);
  if (!input.runId) {
    return { ok: false, status: 400, target, data: { error: 'runId is required for list_jobs.' } };
  }
  const result = await githubRequest(`/repos/${target.owner}/${target.repo}/actions/runs/${input.runId}/jobs?per_page=${input.perPage ?? 50}`);
  await insertTelemetry('bridge_evidence', {
    worker: 'github-workflow-bridge',
    status: result.ok ? 'success' : 'failed',
    evidence: JSON.stringify({ operation: 'list_jobs', target, runId: input.runId, status: result.status }),
    blocker: result.ok ? null : JSON.stringify(result.data),
    created_at: new Date().toISOString()
  });
  return { ...result, target };
}

export async function readJobLogs(input: GitHubWorkflowBridgeRequest) {
  const target = resolveTarget(input);
  if (!input.jobId) {
    return { ok: false, status: 400, target, data: { error: 'jobId is required for read_job_logs.' } };
  }
  const result = await githubRequest(`/repos/${target.owner}/${target.repo}/actions/jobs/${input.jobId}/logs`);
  await insertTelemetry('bridge_evidence', {
    worker: 'github-workflow-bridge',
    status: result.ok ? 'success' : 'failed',
    evidence: JSON.stringify({ operation: 'read_job_logs', target, jobId: input.jobId, status: result.status }),
    blocker: result.ok ? null : JSON.stringify(result.data),
    created_at: new Date().toISOString()
  });
  return { ...result, target };
}

export async function dispatchWorkflow(input: GitHubWorkflowBridgeRequest) {
  const target = resolveTarget(input);
  if (!input.workflowId) {
    return { ok: false, status: 400, target, data: { error: 'workflowId is required for dispatch.' } };
  }

  if (isRiskyDispatch(input) && !workflowApproved(input)) {
    const blocker = 'Workflow dispatch blocked by approval gate.';
    await insertTelemetry('bridge_blockers', {
      worker: 'github-workflow-bridge',
      blocker,
      severity: 'red',
      created_at: new Date().toISOString()
    });
    return {
      ok: false,
      blocked: true,
      status: 423,
      target,
      data: {
        error: blocker,
        requiredApprovalPhrase: 'APPROVE GITHUB WORKFLOW RUN'
      }
    };
  }

  const ref = input.ref ?? target.defaultRef;
  const result = await githubRequest(`/repos/${target.owner}/${target.repo}/actions/workflows/${input.workflowId}/dispatches`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ref, inputs: input.inputs ?? {} })
  });

  await insertTelemetry('bridge_evidence', {
    worker: 'github-workflow-bridge',
    status: result.ok ? 'success' : 'failed',
    evidence: JSON.stringify({ operation: 'dispatch', target, workflowId: input.workflowId, ref, status: result.status }),
    blocker: result.ok ? null : JSON.stringify(result.data),
    created_at: new Date().toISOString()
  });

  return {
    ...result,
    target,
    data: result.data ?? {
      dispatched: result.ok,
      status: result.status,
      note: 'GitHub returns 204 for successful workflow_dispatch requests.'
    }
  };
}

export async function handleGitHubWorkflowBridge(input: GitHubWorkflowBridgeRequest) {
  switch (input.operation ?? 'list_workflows') {
    case 'dispatch':
      return dispatchWorkflow(input);
    case 'list_runs':
      return listRuns(input);
    case 'list_jobs':
      return listJobs(input);
    case 'read_job_logs':
      return readJobLogs(input);
    case 'list_workflows':
    default:
      return listWorkflows(input);
  }
}

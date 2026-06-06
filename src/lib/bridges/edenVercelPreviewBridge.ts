import { insertTelemetry } from '@/lib/telemetry-store';

export type EdenPreviewBridgeRequest = {
  ref?: string;
  sha?: string;
  projectId?: string;
  repoId?: string | number;
  target?: 'preview' | 'production' | 'staging';
  requestedBy?: string;
  routesToCheck?: string[];
  metadata?: Record<string, string>;
};

export type EdenPreviewBridgeReadiness = {
  ready: boolean;
  secretsExposed: false;
  configuredEnv: Record<string, boolean>;
  defaults: {
    projectId: string | null;
    repoId: string;
    ref: string;
    sourceRepo: string;
  };
  blockers: string[];
};

const DEFAULT_EDEN_GITHUB_REPO_ID = '1256557688';
const DEFAULT_EDEN_REPO = 'Strategic-Minds/EDENSKYESTUDIOS';
const DEFAULT_REF = 'main';

function envPresent(name: string) {
  return Boolean(process.env[name]);
}

function getConfiguredProjectId() {
  return (
    process.env.EDEN_SKYE_VERCEL_PROJECT_ID ||
    process.env.TARGET_VERCEL_PROJECT_ID ||
    process.env.VERCEL_PROJECT_ID ||
    null
  );
}

function getTeamQuery() {
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!teamId) return '';
  return `?teamId=${encodeURIComponent(teamId)}`;
}

function parseJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

export function getEdenPreviewBridgeReadiness(): EdenPreviewBridgeReadiness {
  const projectId = getConfiguredProjectId();
  const configuredEnv = {
    VERCEL_TOKEN: envPresent('VERCEL_TOKEN'),
    EDEN_SKYE_VERCEL_PROJECT_ID: envPresent('EDEN_SKYE_VERCEL_PROJECT_ID'),
    TARGET_VERCEL_PROJECT_ID: envPresent('TARGET_VERCEL_PROJECT_ID'),
    VERCEL_PROJECT_ID: envPresent('VERCEL_PROJECT_ID'),
    VERCEL_TEAM_ID: envPresent('VERCEL_TEAM_ID')
  };

  const blockers = [
    !configuredEnv.VERCEL_TOKEN ? 'VERCEL_TOKEN is missing in Auto Builder runtime.' : null,
    !projectId ? 'No Eden target Vercel project id is configured.' : null
  ].filter(Boolean) as string[];

  return {
    ready: blockers.length === 0,
    secretsExposed: false,
    configuredEnv,
    defaults: {
      projectId,
      repoId: process.env.EDEN_SKYE_GITHUB_REPO_ID || DEFAULT_EDEN_GITHUB_REPO_ID,
      ref: process.env.EDEN_SKYE_GIT_REF || DEFAULT_REF,
      sourceRepo: DEFAULT_EDEN_REPO
    },
    blockers
  };
}

export async function createEdenPreviewDeployment(input: EdenPreviewBridgeRequest) {
  const readiness = getEdenPreviewBridgeReadiness();
  const target = input.target ?? 'preview';

  if (target === 'production') {
    const blocker = 'Production deployment requested. Eden preview bridge is preview-only.';
    await insertTelemetry('bridge_blockers', {
      worker: 'eden-vercel-preview-bridge',
      blocker,
      severity: 'red',
      created_at: new Date().toISOString()
    });
    return {
      ok: false,
      blocked: true,
      status: 423,
      error: blocker,
      readiness
    };
  }

  if (!readiness.ready) {
    await insertTelemetry('bridge_blockers', {
      worker: 'eden-vercel-preview-bridge',
      blocker: readiness.blockers.join(' '),
      severity: 'yellow',
      created_at: new Date().toISOString()
    });
    return {
      ok: false,
      blocked: false,
      status: 503,
      error: 'Eden Vercel preview bridge is not fully configured.',
      readiness
    };
  }

  const projectId = input.projectId || readiness.defaults.projectId;
  const repoId = String(input.repoId || readiness.defaults.repoId);
  const ref = input.ref || readiness.defaults.ref;
  const token = process.env.VERCEL_TOKEN;

  const deploymentBody: Record<string, unknown> = {
    name: 'eden-skye-studios-preview',
    project: projectId,
    gitSource: {
      type: 'github',
      repoId,
      ref,
      ...(input.sha ? { sha: input.sha } : {})
    },
    meta: {
      source: 'auto-builder-eden-preview-bridge',
      repo: DEFAULT_EDEN_REPO,
      requestedBy: input.requestedBy ?? 'Eden Skye Runtime',
      routesToCheck: JSON.stringify(input.routesToCheck ?? ['/', '/login', '/payment', '/closet', '/api/readiness']),
      ...(input.metadata ?? {})
    }
  };

  const response = await fetch(`https://api.vercel.com/v13/deployments${getTeamQuery()}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(deploymentBody)
  });

  const text = await response.text();
  const data = parseJson(text);
  const deploymentUrl =
    data && typeof data === 'object' && 'url' in data && typeof (data as { url?: unknown }).url === 'string'
      ? `https://${(data as { url: string }).url}`
      : null;

  await insertTelemetry('bridge_evidence', {
    worker: 'eden-vercel-preview-bridge',
    status: response.ok ? 'success' : 'failed',
    evidence: JSON.stringify({ status: response.status, deploymentUrl, data }),
    blocker: response.ok ? null : text,
    created_at: new Date().toISOString()
  });

  return {
    ok: response.ok,
    blocked: false,
    status: response.status,
    deploymentUrl,
    data,
    readiness: {
      ...readiness,
      defaults: {
        ...readiness.defaults,
        projectId
      }
    }
  };
}

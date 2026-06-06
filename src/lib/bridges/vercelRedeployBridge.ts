import { insertTelemetry } from '@/lib/telemetry-store';

export type RedeployTarget = 'auto_builder' | 'eden_skye_studios';
export type RedeployMode = 'preview' | 'production';

export type VercelRedeployRequest = {
  targetSystem?: RedeployTarget;
  mode?: RedeployMode;
  ref?: string;
  sha?: string;
  requestedBy?: string;
  projectId?: string;
  repoId?: string | number;
  approvedProductionDeploy?: boolean;
  approvalPhrase?: string;
  metadata?: Record<string, string>;
};

export type RedeployTargetConfig = {
  targetSystem: RedeployTarget;
  label: string;
  projectId: string | null;
  repoId: string;
  repo: string;
  ref: string;
  projectEnvCandidates: string[];
};

const TARGETS: Record<RedeployTarget, Omit<RedeployTargetConfig, 'projectId'>> = {
  auto_builder: {
    targetSystem: 'auto_builder',
    label: 'AUTO BUILDER',
    repoId: '1249596503',
    repo: 'Strategic-Minds/AUTO_BUILDER',
    ref: 'main',
    projectEnvCandidates: ['AUTO_BUILDER_VERCEL_PROJECT_ID', 'VERCEL_PROJECT_ID']
  },
  eden_skye_studios: {
    targetSystem: 'eden_skye_studios',
    label: 'Eden Skye Studios',
    repoId: '1256557688',
    repo: 'Strategic-Minds/EDENSKYESTUDIOS',
    ref: 'main',
    projectEnvCandidates: ['EDEN_SKYE_VERCEL_PROJECT_ID', 'TARGET_VERCEL_PROJECT_ID']
  }
};

function envPresent(name: string) {
  return Boolean(process.env[name]);
}

function firstEnvValue(names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return null;
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

export function resolveRedeployTarget(targetSystem: RedeployTarget = 'auto_builder'): RedeployTargetConfig {
  const target = TARGETS[targetSystem];
  return {
    ...target,
    projectId: firstEnvValue(target.projectEnvCandidates)
  };
}

export function getVercelRedeployReadiness() {
  const targets = (Object.keys(TARGETS) as RedeployTarget[]).map((targetSystem) => {
    const target = resolveRedeployTarget(targetSystem);
    return {
      ...target,
      ready: Boolean(process.env.VERCEL_TOKEN && target.projectId),
      configuredEnv: {
        VERCEL_TOKEN: envPresent('VERCEL_TOKEN'),
        VERCEL_TEAM_ID: envPresent('VERCEL_TEAM_ID'),
        ...Object.fromEntries(target.projectEnvCandidates.map((name) => [name, envPresent(name)]))
      },
      blockers: [
        !process.env.VERCEL_TOKEN ? 'VERCEL_TOKEN is missing.' : null,
        !target.projectId ? `${target.label} project id is missing.` : null
      ].filter(Boolean)
    };
  });

  return {
    ok: true,
    secretsExposed: false,
    productionDeploysDefaultBlocked: true,
    targets
  };
}

function productionApproved(input: VercelRedeployRequest) {
  return input.approvedProductionDeploy === true && input.approvalPhrase === 'APPROVE PRODUCTION DEPLOY';
}

export async function triggerVercelRedeploy(input: VercelRedeployRequest) {
  const mode = input.mode ?? 'preview';
  const target = resolveRedeployTarget(input.targetSystem ?? 'auto_builder');
  const projectId = input.projectId || target.projectId;
  const repoId = String(input.repoId || target.repoId);
  const ref = input.ref || target.ref;

  if (mode === 'production' && !productionApproved(input)) {
    const blocker = 'Production redeploy requested without explicit approval phrase.';
    await insertTelemetry('bridge_blockers', {
      worker: 'vercel-redeploy-bridge',
      blocker,
      severity: 'red',
      created_at: new Date().toISOString()
    });
    return {
      ok: false,
      blocked: true,
      status: 423,
      error: blocker,
      requiredApprovalPhrase: 'APPROVE PRODUCTION DEPLOY'
    };
  }

  if (!process.env.VERCEL_TOKEN || !projectId) {
    const blocker = !process.env.VERCEL_TOKEN ? 'VERCEL_TOKEN is missing.' : `${target.label} project id is missing.`;
    await insertTelemetry('bridge_blockers', {
      worker: 'vercel-redeploy-bridge',
      blocker,
      severity: 'yellow',
      created_at: new Date().toISOString()
    });
    return {
      ok: false,
      blocked: false,
      status: 503,
      error: blocker,
      readiness: getVercelRedeployReadiness()
    };
  }

  const deploymentBody: Record<string, unknown> = {
    name: `${target.targetSystem}-${mode}-redeploy`,
    project: projectId,
    target: mode === 'production' ? 'production' : undefined,
    gitSource: {
      type: 'github',
      repoId,
      ref,
      ...(input.sha ? { sha: input.sha } : {})
    },
    meta: {
      source: 'auto-builder-vercel-redeploy-bridge',
      targetSystem: target.targetSystem,
      repo: target.repo,
      mode,
      requestedBy: input.requestedBy ?? 'Eden Skye Runtime',
      ...(input.metadata ?? {})
    }
  };

  const response = await fetch(`https://api.vercel.com/v13/deployments${getTeamQuery()}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
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
    worker: 'vercel-redeploy-bridge',
    status: response.ok ? 'success' : 'failed',
    evidence: JSON.stringify({ status: response.status, deploymentUrl, targetSystem: target.targetSystem, mode, data }),
    blocker: response.ok ? null : text,
    created_at: new Date().toISOString()
  });

  return {
    ok: response.ok,
    blocked: false,
    status: response.status,
    targetSystem: target.targetSystem,
    mode,
    deploymentUrl,
    data
  };
}

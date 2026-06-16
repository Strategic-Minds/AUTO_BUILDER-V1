import { insertTelemetry } from '@/lib/telemetry-store';

export type RedeployTarget = 'auto_builder' | 'eden_skye_studios';
export type RedeployMode = 'preview' | 'production';
export type RollbackOperationMode = 'dry_run' | 'rollback';

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

export type VercelRollbackRequest = {
  targetSystem?: RedeployTarget;
  mode?: RedeployMode;
  operationMode?: RollbackOperationMode;
  execute?: boolean;
  ref?: string;
  sha?: string;
  rollbackRef?: string;
  rollbackSha?: string;
  sourceDeploymentId?: string;
  sourceDeploymentUrl?: string;
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

function recordFrom(data: unknown) {
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
}

function stringField(data: unknown, field: string) {
  const value = recordFrom(data)?.[field];
  return typeof value === 'string' ? value : null;
}

function numberField(data: unknown, field: string) {
  const value = recordFrom(data)?.[field];
  return typeof value === 'number' ? value : null;
}

function recordField(data: unknown, field: string) {
  const value = recordFrom(data)?.[field];
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function deploymentUrlFrom(data: unknown) {
  return data && typeof data === 'object' && 'url' in data && typeof (data as { url?: unknown }).url === 'string'
    ? `https://${(data as { url: string }).url}`
    : null;
}

function deploymentIdFrom(data: unknown) {
  return data && typeof data === 'object' && 'id' in data && typeof (data as { id?: unknown }).id === 'string'
    ? (data as { id: string }).id
    : null;
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

export function getVercelRollbackReadiness() {
  return {
    ...getVercelRedeployReadiness(),
    rollback: {
      provider: 'vercel',
      previewRollbackSupported: true,
      productionRollbackRequiresApproval: true,
      strategy: 'Create a new Vercel deployment from a prior known-good ref or sha. Preview rollback never promotes production aliases.'
    }
  };
}

export async function getVercelDeploymentStatus(idOrUrl: string) {
  if (!idOrUrl) {
    return {
      ok: false,
      status: 400,
      error: 'deploymentId or deploymentUrl is required.'
    };
  }

  if (!process.env.VERCEL_TOKEN) {
    return {
      ok: false,
      status: 503,
      error: 'VERCEL_TOKEN is missing.',
      readiness: getVercelRollbackReadiness()
    };
  }

  const response = await fetch(`https://api.vercel.com/v13/deployments/${encodeURIComponent(idOrUrl)}${getTeamQuery()}`, {
    headers: {
      authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      accept: 'application/json'
    }
  });
  const text = await response.text();
  const data = parseJson(text);
  const readyState = stringField(data, 'readyState') ?? stringField(data, 'state') ?? stringField(data, 'status');

  return {
    ok: response.ok,
    status: response.status,
    deployment: {
      id: deploymentIdFrom(data) ?? idOrUrl,
      url: deploymentUrlFrom(data),
      readyState,
      state: stringField(data, 'state') ?? readyState,
      target: stringField(data, 'target'),
      name: stringField(data, 'name'),
      type: stringField(data, 'type'),
      createdAt: numberField(data, 'createdAt'),
      buildingAt: numberField(data, 'buildingAt'),
      ready: numberField(data, 'ready'),
      meta: recordField(data, 'meta')
    },
    ...(response.ok ? {} : { error: stringField(data, 'error') ?? text.slice(0, 1000) })
  };
}

function productionApproved(input: Pick<VercelRedeployRequest, 'approvedProductionDeploy' | 'approvalPhrase'>) {
  return input.approvedProductionDeploy === true && input.approvalPhrase === 'APPROVE PRODUCTION DEPLOY';
}

function missingVercelConfig(target: RedeployTargetConfig, projectId: string | null | undefined) {
  if (!process.env.VERCEL_TOKEN) return 'VERCEL_TOKEN is missing.';
  if (!projectId) return `${target.label} project id is missing.`;
  return null;
}

function deploymentMetadata(input: VercelRedeployRequest, target: RedeployTargetConfig, mode: RedeployMode) {
  return {
    source: 'auto-builder-vercel-redeploy-bridge',
    targetSystem: target.targetSystem,
    repo: target.repo,
    mode,
    requestedBy: input.requestedBy ?? 'Eden Skye Runtime',
    ...(input.metadata ?? {})
  };
}

function rollbackMetadata(
  input: VercelRollbackRequest,
  target: RedeployTargetConfig,
  mode: RedeployMode,
  rollbackRef: string,
  rollbackSha: string | undefined
) {
  return {
    source: 'auto-builder-vercel-rollback-bridge',
    action: 'rollback',
    targetSystem: target.targetSystem,
    repo: target.repo,
    mode,
    rollbackRef,
    requestedBy: input.requestedBy ?? 'AUTO BUILDER rollback validation',
    ...(rollbackSha ? { rollbackSha } : {}),
    ...(input.sourceDeploymentId ? { sourceDeploymentId: input.sourceDeploymentId } : {}),
    ...(input.sourceDeploymentUrl ? { sourceDeploymentUrl: input.sourceDeploymentUrl } : {}),
    ...(input.metadata ?? {})
  };
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

  const blocker = missingVercelConfig(target, projectId);
  if (blocker) {
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
    meta: deploymentMetadata(input, target, mode)
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
  const deploymentUrl = deploymentUrlFrom(data);

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

export async function triggerVercelRollback(input: VercelRollbackRequest) {
  const mode = input.mode ?? 'preview';
  const operationMode = input.operationMode ?? (input.execute === true ? 'rollback' : 'dry_run');
  const target = resolveRedeployTarget(input.targetSystem ?? 'auto_builder');
  const projectId = input.projectId || target.projectId;
  const repoId = String(input.repoId || target.repoId);
  const rollbackRef = input.rollbackRef || input.ref || target.ref;
  const rollbackSha = input.rollbackSha || input.sha;

  if (mode === 'production' && !productionApproved(input)) {
    const blocker = 'Production rollback requested without explicit approval phrase.';
    await insertTelemetry('bridge_blockers', {
      worker: 'vercel-rollback-bridge',
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

  const blocker = missingVercelConfig(target, projectId);
  if (blocker) {
    await insertTelemetry('bridge_blockers', {
      worker: 'vercel-rollback-bridge',
      blocker,
      severity: 'yellow',
      created_at: new Date().toISOString()
    });
    return {
      ok: false,
      blocked: false,
      status: 503,
      error: blocker,
      readiness: getVercelRollbackReadiness()
    };
  }

  const deploymentBody: Record<string, unknown> = {
    name: `${target.targetSystem}-${mode}-rollback`,
    project: projectId,
    target: mode === 'production' ? 'production' : undefined,
    gitSource: {
      type: 'github',
      repoId,
      ref: rollbackRef,
      ...(rollbackSha ? { sha: rollbackSha } : {})
    },
    meta: rollbackMetadata(input, target, mode, rollbackRef, rollbackSha)
  };

  const rollback = {
    available: true,
    provider: 'vercel',
    status: operationMode === 'rollback' ? 'rollback_deployment_requested' : 'rollback_plan_ready',
    strategy: 'create_deployment_from_known_good_git_source',
    targetSystem: target.targetSystem,
    deploymentMode: mode,
    rollbackRef,
    rollbackSha: rollbackSha ?? null,
    sourceDeploymentId: input.sourceDeploymentId ?? null,
    sourceDeploymentUrl: input.sourceDeploymentUrl ?? null,
    productionBlocked: mode === 'production' && !productionApproved(input)
  };

  if (operationMode !== 'rollback') {
    await insertTelemetry('bridge_evidence', {
      worker: 'vercel-rollback-bridge',
      status: 'planned',
      evidence: JSON.stringify({ rollback, deploymentBody }),
      blocker: null,
      created_at: new Date().toISOString()
    });

    return {
      ok: true,
      blocked: false,
      status: 200,
      targetSystem: target.targetSystem,
      mode,
      operationMode,
      dryRun: true,
      rollback,
      deploymentBody
    };
  }

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
  const deploymentUrl = deploymentUrlFrom(data);
  const deploymentId = deploymentIdFrom(data);
  const ok = response.ok;
  const nextRollback = {
    ...rollback,
    available: ok,
    status: ok ? 'rollback_deployment_submitted' : 'rollback_deployment_failed',
    deploymentId,
    deploymentUrl
  };

  await insertTelemetry('bridge_evidence', {
    worker: 'vercel-rollback-bridge',
    status: ok ? 'success' : 'failed',
    evidence: JSON.stringify({ status: response.status, deploymentUrl, deploymentId, rollback: nextRollback, data }),
    blocker: ok ? null : text,
    created_at: new Date().toISOString()
  });

  return {
    ok,
    blocked: false,
    status: response.status,
    targetSystem: target.targetSystem,
    mode,
    operationMode,
    dryRun: false,
    deploymentUrl,
    deploymentId,
    rollback: nextRollback,
    data
  };
}

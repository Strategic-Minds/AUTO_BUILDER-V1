import fs from 'node:fs/promises';

const base = (process.env.AUTO_BUILDER_URL || 'https://auto-builder-git-auto-builder-v-4c969e-strategic-minds-advisory.vercel.app').replace(/\/$/, '');
const routePath = '/api/bridge/vercel/rollback';
const routeUrl = `${base}${routePath}`;
const outDir = process.env.BRIDGE_SMOKE_ARTIFACT_DIR || 'bridge-smoke-artifacts';
const operatorToken = process.env.AUTO_BUILDER_OPERATOR_TOKEN || process.env.AUTO_BUILDER_BRIDGE_TOKEN || '';
const rollbackRef = process.env.ROLLBACK_REF || process.env.GITHUB_BASE_REF || 'main';
const rollbackSha = process.env.ROLLBACK_SHA || '';
const githubRunId = process.env.GITHUB_RUN_ID || '';
const githubSha = process.env.GITHUB_SHA || '';

await fs.mkdir(outDir, { recursive: true });

const summary = {
  ok: false,
  checkedAt: new Date().toISOString(),
  base,
  routeUrl,
  operatorTokenConfigured: Boolean(operatorToken),
  targetSystem: 'auto_builder',
  rollbackRef,
  rollbackSha: rollbackSha || null,
  sourceDeploymentUrl: base,
  readiness: null,
  dryRun: null,
  previewRollback: null,
  productionBlock: null,
  production: {
    attempted: false,
    status: 'blocked_by_policy',
    requiredApprovalPhrase: 'APPROVE PRODUCTION DEPLOY',
  },
};

async function writeJson(name, value) {
  await fs.writeFile(`${outDir}/${name}.json`, JSON.stringify(value, null, 2));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(label, url, init = {}) {
  const startedAt = new Date().toISOString();
  const response = await fetch(url, init);
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}

  const receipt = {
    label,
    url,
    method: init.method || 'GET',
    status: response.status,
    ok: response.ok,
    startedAt,
    completedAt: new Date().toISOString(),
    json,
    bodyPreview: text.slice(0, 3000),
  };
  await writeJson(label, receipt);
  return receipt;
}

async function waitForRollbackContract() {
  let latest = null;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      latest = await fetchJson(`rollback-contract-attempt-${attempt}`, routeUrl);
      const readiness = latest.json?.readiness;
      if (
        latest.ok &&
        readiness?.rollback?.provider === 'vercel' &&
        readiness?.rollback?.previewRollbackSupported === true &&
        readiness?.rollback?.productionRollbackRequiresApproval === true &&
        latest.json?.statusShape?.readyState === 'READY is required before rollback evidence can pass'
      ) {
        return latest;
      }
    } catch (error) {
      latest = {
        label: `rollback-contract-attempt-${attempt}`,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
      await writeJson(`rollback-contract-attempt-${attempt}`, latest);
    }
    await sleep(5000);
  }
  return latest;
}

function rollbackRequest(operationMode, mode = 'preview') {
  return {
    targetSystem: 'auto_builder',
    mode,
    operationMode,
    rollbackRef,
    ...(rollbackSha ? { rollbackSha } : {}),
    sourceDeploymentUrl: base,
    requestedBy: `GitHub Actions PR #49 Vercel rollback ${operationMode} receipt`,
    metadata: {
      githubRunId,
      githubSha,
      validation: mode === 'production' ? 'production-rollback-block-check' : 'non-production-rollback-validation',
    },
  };
}

async function postRollback(label, body, token = '') {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  return fetchJson(label, routeUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

async function pollDeploymentStatus(label, deploymentId, token) {
  const polls = [];
  const statusUrl = `${routeUrl}?deploymentId=${encodeURIComponent(deploymentId)}`;

  for (let attempt = 1; attempt <= 72; attempt += 1) {
    const poll = await fetchJson(`${label}-deployment-status-${String(attempt).padStart(2, '0')}`, statusUrl, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
      },
    });
    const readyState = String(poll.json?.deployment?.readyState || '').toUpperCase();
    const state = String(poll.json?.deployment?.state || '').toUpperCase();
    const target = poll.json?.deployment?.target ?? null;
    const compactPoll = {
      attempt,
      status: poll.status,
      ok: poll.ok,
      readyState,
      state,
      target,
      deployment: poll.json?.deployment ?? null,
      completedAt: poll.completedAt,
    };
    polls.push(compactPoll);
    await writeJson(`${label}-deployment-status-polls`, polls);

    if (poll.ok && readyState === 'READY' && target !== 'production') {
      return { ok: true, polls, finalStatus: poll };
    }

    if (['ERROR', 'FAILED', 'CANCELED', 'CANCELLED'].includes(readyState) || ['ERROR', 'FAILED', 'CANCELED', 'CANCELLED'].includes(state)) {
      return { ok: false, polls, finalStatus: poll, error: `Deployment reached terminal failure state ${readyState || state}.` };
    }

    await sleep(5000);
  }

  return { ok: false, polls, finalStatus: polls.at(-1) ?? null, error: 'Deployment did not reach Vercel READY state before timeout.' };
}

summary.readiness = await waitForRollbackContract();
if (!summary.readiness?.ok) {
  summary.error = 'Rollback contract route did not become ready.';
  await writeJson('vercel-rollback-receipt-summary', summary);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(1);
}

summary.dryRun = await postRollback('rollback-dry-run', rollbackRequest('dry_run'));
if (!summary.dryRun.ok || summary.dryRun.json?.rollback?.status !== 'rollback_plan_ready') {
  summary.error = 'Rollback dry-run did not produce a ready Vercel rollback plan.';
  await writeJson('vercel-rollback-receipt-summary', summary);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(1);
}

if (!operatorToken) {
  summary.error = 'Preview rollback blocked because no operator token secret is configured.';
  summary.previewRollback = {
    attempted: false,
    ok: false,
    status: 'blocked_missing_operator_token',
    requiredSecret: 'AUTO_BUILDER_OPERATOR_TOKEN or AUTO_BUILDER_BRIDGE_TOKEN',
  };
  await writeJson('vercel-rollback-receipt-summary', summary);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(1);
}

const previewRollback = await postRollback('rollback-preview-execute', rollbackRequest('rollback'), operatorToken);
const deploymentUrl = previewRollback.json?.deploymentUrl;
const deploymentId = previewRollback.json?.deploymentId;
summary.previewRollback = {
  ...previewRollback,
  deploymentId,
  deploymentUrl,
  deploymentStatus: null,
};

if (!previewRollback.ok || !deploymentUrl || !deploymentId) {
  summary.error = 'Preview rollback did not submit a Vercel deployment.';
  await writeJson('vercel-rollback-receipt-summary', summary);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(1);
}

summary.previewRollback.deploymentStatus = await pollDeploymentStatus('rollback-preview-execute', deploymentId, operatorToken);

summary.productionBlock = await postRollback('rollback-production-block-check', rollbackRequest('dry_run', 'production'), operatorToken);
const productionBlocked = summary.productionBlock.status === 423 && summary.productionBlock.json?.blocked === true;
summary.production = {
  attempted: false,
  status: productionBlocked ? 'blocked_by_approval_gate' : 'block_check_failed',
  requiredApprovalPhrase: 'APPROVE PRODUCTION DEPLOY',
};

summary.ok = Boolean(summary.previewRollback.deploymentStatus?.ok && productionBlocked);
if (!summary.ok) summary.error = 'Rollback deployment status or production block check failed.';
await writeJson('vercel-rollback-receipt-summary', summary);
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.ok ? 0 : 1);

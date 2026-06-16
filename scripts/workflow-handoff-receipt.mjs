import fs from 'node:fs/promises';

const base = (process.env.AUTO_BUILDER_URL || 'https://auto-builder-git-auto-builder-v-4c969e-strategic-minds-advisory.vercel.app').replace(/\/$/, '');
const outDir = process.env.BRIDGE_SMOKE_ARTIFACT_DIR || 'bridge-smoke-artifacts';
const workflowPath = '/api/workflows/auto-builder-handoff';
const workflowUrl = `${base}${workflowPath}`;
const operatorToken = process.env.AUTO_BUILDER_OPERATOR_TOKEN || process.env.AUTO_BUILDER_BRIDGE_TOKEN || '';
const requirePreviewExecute = process.env.REQUIRE_PREVIEW_EXECUTE !== 'false';
const runStamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

await fs.mkdir(outDir, { recursive: true });

const summary = {
  ok: false,
  checkedAt: new Date().toISOString(),
  base,
  workflowUrl,
  operatorTokenConfigured: Boolean(operatorToken),
  dryRun: null,
  previewExecute: null,
  production: {
    attempted: false,
    status: 'blocked_by_workflow_approval_gate',
    requiredApprovalPhrase: 'APPROVE PRODUCTION DEPLOY',
  },
  blockedActions: [
    'production deploy',
    'environment mutation',
    'Supabase production migration',
    'Drive write',
    'social publish',
    'outbound message',
    'billing or spend',
    'destructive action',
  ],
};

async function writeJson(name, value) {
  await fs.writeFile(`${outDir}/${name}.json`, JSON.stringify(value, null, 2));
}

async function writeText(name, value) {
  await fs.writeFile(`${outDir}/${name}.txt`, value);
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
    bodyPreview: text.slice(0, 2000),
  };
  await writeJson(label, receipt);
  return receipt;
}

async function waitForWorkflowContract() {
  let latest = null;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      latest = await fetchJson(`workflow-contract-attempt-${attempt}`, workflowUrl);
      if (latest.ok && latest.json?.routes?.runStatus && latest.json?.routes?.events) return latest;
    } catch (error) {
      latest = { attempt, ok: false, error: error instanceof Error ? error.message : String(error) };
    }
    await sleep(5000);
  }
  return latest;
}

function absoluteUrl(pathOrUrl) {
  return new URL(pathOrUrl, base).toString();
}

function isTerminalStatus(statusJson) {
  const status = String(statusJson?.status || '').toLowerCase();
  return Boolean(statusJson?.completedAt) || ['completed', 'complete', 'success', 'failed', 'error', 'cancelled', 'canceled'].includes(status);
}

async function pollRun(label, statusUrl, maxAttempts, intervalMs) {
  const polls = [];
  let finalStatus = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const poll = await fetchJson(`${label}-run-status-${String(attempt).padStart(2, '0')}`, statusUrl);
    polls.push({ attempt, status: poll.status, ok: poll.ok, json: poll.json });
    finalStatus = poll;
    if (poll.ok && isTerminalStatus(poll.json)) break;
    await sleep(intervalMs);
  }
  await writeJson(`${label}-run-status-polls`, polls);
  return { polls, finalStatus };
}

async function readEventStream(label, eventsUrl, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let status = 0;
  let ok = false;
  let text = '';
  let error = null;

  try {
    const response = await fetch(eventsUrl, {
      headers: { accept: 'text/event-stream' },
      signal: controller.signal,
    });
    status = response.status;
    ok = response.ok;

    if (!response.body) {
      text = await response.text();
    } else {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        if (text.length > 80000) break;
      }
      text += decoder.decode();
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  } finally {
    clearTimeout(timeout);
  }

  const receipt = {
    label,
    eventsUrl,
    status,
    ok,
    timedReadMs: timeoutMs,
    bytes: text.length,
    hasDataFrames: text.includes('data:'),
    hasDoneEvent: text.includes('"type":"done"') || text.includes('type: "done"'),
    hasBlockedEvent: text.includes('"type":"blocked"') || text.includes('type: "blocked"'),
    error,
  };
  await writeJson(`${label}-event-stream`, receipt);
  await writeText(`${label}-event-stream`, text);
  return { ...receipt, text };
}

async function startWorkflow(label, body, token = '') {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;

  const start = await fetchJson(`${label}-start`, workflowUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const runId = start.json?.runId;
  const statusUrl = runId ? absoluteUrl(start.json.statusUrl) : null;
  const eventsUrl = runId ? absoluteUrl(start.json.eventsUrl) : null;
  if (!start.ok || !runId || !statusUrl || !eventsUrl) {
    return { label, ok: false, start, runId, statusUrl, eventsUrl, error: 'Workflow start did not return a usable run id.' };
  }

  const pollConfig = label === 'preview-execute' ? { maxAttempts: 90, intervalMs: 5000 } : { maxAttempts: 20, intervalMs: 2000 };
  const runStatus = await pollRun(label, statusUrl, pollConfig.maxAttempts, pollConfig.intervalMs);
  const eventStream = await readEventStream(label, eventsUrl, label === 'preview-execute' ? 30000 : 15000);
  const finalJson = runStatus.finalStatus?.json;
  const passed = Boolean(start.ok && runStatus.finalStatus?.ok && isTerminalStatus(finalJson) && eventStream.ok && eventStream.hasDataFrames);

  return {
    label,
    ok: passed,
    runId,
    statusUrl,
    eventsUrl,
    start,
    finalStatus: runStatus.finalStatus,
    eventStream: {
      status: eventStream.status,
      ok: eventStream.ok,
      bytes: eventStream.bytes,
      hasDataFrames: eventStream.hasDataFrames,
      hasDoneEvent: eventStream.hasDoneEvent,
      hasBlockedEvent: eventStream.hasBlockedEvent,
      error: eventStream.error,
    },
  };
}

const contract = await waitForWorkflowContract();
summary.workflowContract = {
  status: contract?.status ?? 0,
  ok: Boolean(contract?.ok),
  routes: contract?.json?.routes ?? null,
};

if (!summary.workflowContract.ok) {
  summary.ok = false;
  summary.error = 'Workflow contract route did not become ready.';
  await writeJson('vercel-workflow-handoff-receipt-summary', summary);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(1);
}

summary.dryRun = await startWorkflow('dry-run', {
  workflowId: `pr49-dry-run-${runStamp}`,
  mode: 'dry_run',
  deploymentMode: 'preview',
  targetSystem: 'auto_builder',
  ref: 'main',
  requestedBy: 'GitHub Actions PR #49 workflow handoff dry-run receipt',
});

if (!summary.dryRun.ok) {
  summary.ok = false;
  summary.error = 'Dry-run workflow evidence did not pass.';
  await writeJson('vercel-workflow-handoff-receipt-summary', summary);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(1);
}

if (!operatorToken) {
  summary.previewExecute = {
    attempted: false,
    ok: false,
    status: 'blocked_missing_operator_token',
    requiredSecret: 'AUTO_BUILDER_OPERATOR_TOKEN or AUTO_BUILDER_BRIDGE_TOKEN',
  };
  summary.ok = !requirePreviewExecute;
  summary.error = requirePreviewExecute ? 'Preview execute blocked because no operator token secret is configured.' : undefined;
  await writeJson('vercel-workflow-handoff-receipt-summary', summary);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(requirePreviewExecute ? 1 : 0);
}

summary.previewExecute = await startWorkflow('preview-execute', {
  workflowId: `pr49-preview-execute-${runStamp}`,
  mode: 'execute',
  deploymentMode: 'preview',
  targetSystem: 'auto_builder',
  ref: 'main',
  requestedBy: 'GitHub Actions PR #49 operator-authenticated preview execute receipt',
  verifyRoutes: [
    '/api/runtime/readiness',
    '/api/runtime/jobs',
    '/api/browser/process',
    '/api/bridge/vercel/redeploy',
    '/api/mcp/manifest',
  ],
}, operatorToken);

summary.ok = Boolean(summary.dryRun.ok && summary.previewExecute.ok);
if (!summary.ok) summary.error = 'Preview execute workflow evidence did not pass.';
await writeJson('vercel-workflow-handoff-receipt-summary', summary);
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.ok ? 0 : 1);

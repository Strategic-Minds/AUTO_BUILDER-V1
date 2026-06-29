import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';

const REQUIRED_PHRASE = 'APPROVE PRODUCTION DEPLOY';
const base = (process.env.AUTO_BUILDER_URL || 'https://auto-builder-git-auto-builder-v-4c969e-strategic-minds-advisory.vercel.app').replace(/\/$/, '');
const outDir = process.env.BRIDGE_SMOKE_ARTIFACT_DIR || 'bridge-smoke-artifacts';
const workflowPath = '/api/workflows/auto-builder-handoff';
const workflowUrl = `${base}${workflowPath}`;
const approvalUrl = `${base}${workflowPath}/approval`;
const operatorToken = process.env.AUTO_BUILDER_OPERATOR_TOKEN || process.env.AUTO_BUILDER_BRIDGE_TOKEN || '';
const approvalPhrase = process.env.PRODUCTION_APPROVAL_PHRASE || '';
const approvalMarker = process.env.PRODUCTION_APPROVAL_COMMIT_MARKER || '[awos-production-approval]';
const approvedBy = process.env.PRODUCTION_APPROVED_BY || 'AUTO BUILDER';
const runStamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const productionRef = process.env.PRODUCTION_DEPLOY_REF || process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || 'auto-builder/vercel-workflow-handoff-20260616';
const productionSha = process.env.PRODUCTION_DEPLOY_SHA || git('rev-parse HEAD');
const skip = process.argv.includes('--skip');

await fs.mkdir(outDir, { recursive: true });

const summary = {
  ok: false,
  checkedAt: new Date().toISOString(),
  base,
  workflowUrl,
  approvalUrl,
  operatorTokenConfigured: Boolean(operatorToken),
  targetSystem: 'auto_builder',
  deploymentMode: 'production',
  productionRef,
  productionSha,
  approvalMarker,
  approvalPhraseAccepted: approvalPhrase === REQUIRED_PHRASE,
  production: {
    attempted: false,
    status: 'not_started',
    requiredApprovalPhrase: REQUIRED_PHRASE,
  },
  blockedActions: [
    'environment mutation',
    'Supabase production migration',
    'Drive write',
    'social publish',
    'outbound message',
    'billing or spend',
    'destructive action',
  ],
};

function git(args) {
  return execSync(`git ${args}`, { encoding: 'utf8' }).trim();
}

async function writeJson(name, value) {
  await fs.writeFile(`${outDir}/${name}.json`, JSON.stringify(value, null, 2));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tokenFingerprint(token) {
  return crypto.createHash('sha256').update(token).digest('hex').slice(0, 16);
}

function sanitize(value) {
  if (Array.isArray(value)) return value.map((item) => sanitize(item));
  if (!value || typeof value !== 'object') return value;

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === 'token' && typeof item === 'string') {
      output.tokenPresent = true;
      output.tokenFingerprint = tokenFingerprint(item);
      continue;
    }
    if (/authorization|bearer|secret|token|api[_-]?key|password|private[_-]?key/i.test(key)) {
      output[key] = typeof item === 'string' ? '[redacted]' : sanitize(item);
      continue;
    }
    output[key] = sanitize(item);
  }
  return output;
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
    json: sanitize(json),
    bodyPreview: sanitizeText(text).slice(0, 2000),
  };
  await writeJson(label, receipt);
  return { ...receipt, rawJson: json, rawText: text };
}

function sanitizeText(text) {
  if (!text) return text;
  return text.replace(/auto-builder-handoff:[^"\s]+/g, '[approval-hook-token-redacted]');
}

function absoluteUrl(pathOrUrl) {
  return new URL(pathOrUrl, base).toString();
}

function isTerminalStatus(statusJson) {
  const status = String(statusJson?.status || '').toLowerCase();
  return Boolean(statusJson?.completedAt) || ['completed', 'complete', 'success', 'failed', 'error', 'cancelled', 'canceled'].includes(status);
}

function eventFromSseFrame(frame) {
  const data = frame
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return { type: 'unparsed', data: sanitizeText(data) };
  }
}

async function readEventsUntil(label, eventsUrl, { timeoutMs, stopWhen }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const events = [];
  let text = '';
  let status = 0;
  let ok = false;
  let error = null;
  let matched = null;

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

        const frames = text.split('\n\n');
        text = frames.pop() || '';
        for (const frame of frames) {
          const event = eventFromSseFrame(frame);
          if (!event) continue;
          events.push(event);
          if (stopWhen?.(event)) {
            matched = event;
            controller.abort();
            break;
          }
        }
        if (matched || events.length > 500) break;
      }
      text += decoder.decode();
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  } finally {
    clearTimeout(timeout);
  }

  if (text.trim()) {
    for (const frame of text.split('\n\n')) {
      const event = eventFromSseFrame(frame);
      if (event) events.push(event);
    }
  }

  const receipt = {
    label,
    eventsUrl,
    status,
    ok,
    timedReadMs: timeoutMs,
    eventCount: events.length,
    hasAwaitingApproval: events.some((event) => event?.type === 'awaiting_approval'),
    hasApprovalResult: events.some((event) => event?.type === 'approval_result'),
    hasDoneEvent: events.some((event) => event?.type === 'done'),
    hasBlockedEvent: events.some((event) => event?.type === 'blocked'),
    matched: sanitize(matched),
    events: sanitize(events),
    error,
  };
  await writeJson(label, receipt);
  return { ...receipt, rawEvents: events, matched };
}

async function pollRun(label, statusUrl, maxAttempts, intervalMs) {
  const polls = [];
  let finalStatus = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const poll = await fetchJson(`${label}-run-status-${String(attempt).padStart(2, '0')}`, statusUrl);
    polls.push({ attempt, status: poll.status, ok: poll.ok, json: poll.json });
    finalStatus = poll;
    if (poll.ok && isTerminalStatus(poll.rawJson)) break;
    await sleep(intervalMs);
  }
  await writeJson(`${label}-run-status-polls`, polls);
  return { polls, finalStatus };
}

function latestEvent(events, type) {
  return [...events].reverse().find((event) => event?.type === type) || null;
}

function latestDeployment(events) {
  for (const event of [...events].reverse()) {
    const deployment = event?.data?.deployment;
    if (deployment && typeof deployment === 'object') return deployment;
  }
  return null;
}

function fail(message, extra = {}) {
  summary.ok = false;
  summary.error = message;
  Object.assign(summary, extra);
  return writeJson('vercel-workflow-production-approval-receipt-summary', summary).then(() => {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(1);
  });
}

if (skip) {
  summary.ok = true;
  summary.production = {
    attempted: false,
    status: 'skipped_no_current_approval_marker',
    requiredMarker: approvalMarker,
  };
  await writeJson('vercel-workflow-production-approval-receipt-summary', summary);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

let commitMessage = '';
try {
  commitMessage = git(`log -1 --pretty=%B ${productionSha}`);
} catch {
  commitMessage = git('log -1 --pretty=%B');
}
summary.production.commitMessageHasApprovalMarker = commitMessage.includes(approvalMarker);

if (!commitMessage.includes(approvalMarker)) {
  summary.ok = true;
  summary.production = {
    attempted: false,
    status: 'skipped_missing_approval_marker',
    requiredMarker: approvalMarker,
  };
  await writeJson('vercel-workflow-production-approval-receipt-summary', summary);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

if (!operatorToken) await fail('Missing AUTO_BUILDER_OPERATOR_TOKEN or AUTO_BUILDER_BRIDGE_TOKEN.');
if (approvalPhrase !== REQUIRED_PHRASE) await fail('Production approval phrase was not exact.');

const contract = await fetchJson('production-workflow-contract', workflowUrl);
if (!contract.ok || !contract.rawJson?.routes?.productionApproval) {
  await fail('Production workflow contract route was not ready.', { contract });
}

const workflowId = `pr49-production-${runStamp}`;
const startBody = {
  workflowId,
  mode: 'execute',
  deploymentMode: 'production',
  targetSystem: 'auto_builder',
  ref: productionRef,
  sha: productionSha,
  requestedBy: 'AUTO BUILDER governed production approval after PR #49 refreshed smoke gate',
  verifyRoutes: [
    '/api/runtime/readiness',
    '/api/runtime/jobs',
    '/api/browser/process',
    '/api/bridge/vercel/redeploy',
    '/api/bridge/vercel/rollback',
    '/api/mcp/manifest',
  ],
  maxPolls: 90,
  pollIntervalMs: 10000,
  metadata: {
    source: 'github-actions-awos-production-approval-receipt',
    githubRunId: process.env.GITHUB_RUN_ID || '',
    githubSha: productionSha,
    approvalMarker,
  },
};

summary.production = {
  attempted: true,
  status: 'starting',
  workflowId,
  startBody: sanitize(startBody),
};
await writeJson('vercel-workflow-production-start-body', sanitize(startBody));

const start = await fetchJson('production-start', workflowUrl, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${operatorToken}`,
  },
  body: JSON.stringify(startBody),
});

const runId = start.rawJson?.runId;
const statusUrl = runId ? absoluteUrl(start.rawJson.statusUrl) : null;
const eventsUrl = runId ? absoluteUrl(start.rawJson.eventsUrl) : null;
if (!start.ok || !runId || !statusUrl || !eventsUrl) {
  await fail('Production workflow start did not return a usable run id.', { start });
}

summary.production.runId = runId;
summary.production.statusUrl = statusUrl;
summary.production.eventsUrl = eventsUrl;
summary.production.status = 'awaiting_approval_event';

const approvalWait = await readEventsUntil('production-awaiting-approval-events', eventsUrl, {
  timeoutMs: 120000,
  stopWhen: (event) => event?.type === 'awaiting_approval' && typeof event.token === 'string',
});

const approvalToken = approvalWait.matched?.token;
if (!approvalToken) {
  await fail('Production workflow did not emit an approval hook token before timeout.', { approvalWait: sanitize(approvalWait) });
}

summary.production.approvalTokenFingerprint = tokenFingerprint(approvalToken);
summary.production.status = 'resuming_approval_hook';

const approval = await fetchJson('production-approval-resume', approvalUrl, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${operatorToken}`,
  },
  body: JSON.stringify({
    token: approvalToken,
    approved: true,
    approvalPhrase,
    approvedBy,
    comment: 'Approved by AUTO BUILDER after PR #49 refresh, AWOS Autonomous Bridge Smoke, audit, preview workflow, and rollback evidence passed.',
  }),
});

if (!approval.ok || approval.rawJson?.ok !== true) {
  await fail('Production approval hook resume failed.', { approval });
}

summary.production.status = 'approval_resumed_polling';
summary.production.approval = approval;

const runStatus = await pollRun('production', statusUrl, 150, 10000);
const finalEvents = await readEventsUntil('production-final-events', eventsUrl, {
  timeoutMs: 30000,
  stopWhen: (event) => event?.type === 'done' || event?.type === 'blocked',
});

const allEvents = [...approvalWait.rawEvents, ...finalEvents.rawEvents];
const doneEvent = latestEvent(allEvents, 'done');
const blockedEvent = latestEvent(allEvents, 'blocked');
const approvalResultEvent = latestEvent(allEvents, 'approval_result');
const routeVerificationEvent = latestEvent(allEvents, 'route_verification');
const receiptEvent = latestEvent(allEvents, 'receipt_written');
const deployment = latestDeployment(allEvents);
const finalStatus = runStatus.finalStatus?.rawJson;

summary.production.status = finalStatus?.status || 'unknown';
summary.production.completedAt = finalStatus?.completedAt || null;
summary.production.finalRunStatus = sanitize(finalStatus);
summary.production.doneEvent = sanitize(doneEvent);
summary.production.blockedEvent = sanitize(blockedEvent);
summary.production.approvalResultEvent = sanitize(approvalResultEvent);
summary.production.routeVerificationEvent = sanitize(routeVerificationEvent);
summary.production.receiptEvent = sanitize(receiptEvent);
summary.production.deployment = sanitize(deployment);
summary.production.eventCounts = {
  approvalWait: approvalWait.rawEvents.length,
  final: finalEvents.rawEvents.length,
  total: allEvents.length,
};

const routePassed = routeVerificationEvent?.status === 'passed';
const doneSucceeded = doneEvent?.status === 'success';
const terminalCompleted = finalStatus?.status === 'completed' || Boolean(finalStatus?.completedAt);
summary.ok = Boolean(approval.ok && terminalCompleted && doneSucceeded && routePassed && !blockedEvent);
if (!summary.ok) {
  summary.error = 'Production workflow did not complete with success route verification.';
}

await writeJson('vercel-workflow-production-approval-receipt-summary', summary);
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.ok ? 0 : 1);

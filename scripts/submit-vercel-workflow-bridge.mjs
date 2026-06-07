#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const packetPath = process.env.SUBMISSION_PACKET || 'factory/workflow-submissions/master-system-completion-vercel-workflow-20260607.json';
const defaultTarget = 'https://auto-builder-git-auto-builder-u-bdac7f-strategic-minds-advisory.vercel.app/api/factory/build-packet';
const targetUrl = process.env.VERCEL_WORKFLOW_INTAKE_URL || defaultTarget;
const dryRun = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';
const outDir = process.env.RECEIPT_DIR || 'workflow-receipts';
const outPath = path.join(outDir, 'vercel-workflow-submit-bridge.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function safeText(value, limit = 12000) {
  if (!value) return '';
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > limit ? `${text.slice(0, limit)}...[truncated]` : text;
}

async function main() {
  const packet = readJson(packetPath);
  const payload = packet.workflow_intake?.payload;

  if (!payload || typeof payload.idea !== 'string' || !payload.idea.trim()) {
    throw new Error(`Submission packet missing workflow_intake.payload.idea: ${packetPath}`);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const receipt = {
    receipt_id: 'vercel-workflow-submit-bridge',
    created_at: new Date().toISOString(),
    source_packet: packetPath,
    target_url: targetUrl,
    dry_run: dryRun,
    mutation_executed: false,
    protected_actions_executed: false,
    purpose: 'Submit the master completion packet to the Vercel factory intake from a GitHub Actions runner.',
    gate_policy: 'No production deploy, DB migration, secret change, payment action, social publish, customer message, destructive action, spend, or credentialed browser action is executed by this bridge.',
    request: {
      method: 'POST',
      content_type: 'application/json',
      payload_keys: Object.keys(payload),
      idea_length: payload.idea.length,
    },
    response: null,
    status: 'pending',
  };

  if (dryRun) {
    receipt.status = 'dry_run_ready';
    fs.writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);
    console.log(`Dry run receipt written to ${outPath}`);
    return;
  }

  const startedAt = Date.now();
  let responseText = '';
  let status = 0;
  let statusText = '';
  let headers = {};

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    status = response.status;
    statusText = response.statusText;
    headers = Object.fromEntries(response.headers.entries());
    responseText = await response.text();

    let parsed = null;
    try {
      parsed = responseText ? JSON.parse(responseText) : null;
    } catch {
      parsed = null;
    }

    receipt.response = {
      ok: response.ok,
      status,
      status_text: statusText,
      elapsed_ms: Date.now() - startedAt,
      content_type: headers['content-type'] || null,
      parsed,
      text: parsed ? undefined : safeText(responseText),
    };
    receipt.status = response.ok ? 'submitted' : 'failed';

    fs.writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);
    console.log(`Receipt written to ${outPath}`);

    if (!response.ok) {
      throw new Error(`Vercel Workflow intake returned ${status} ${statusText}`);
    }
  } catch (error) {
    receipt.status = 'failed';
    receipt.error = error instanceof Error ? error.message : String(error);
    receipt.response ||= {
      ok: false,
      status,
      status_text: statusText,
      elapsed_ms: Date.now() - startedAt,
      text: safeText(responseText),
    };
    fs.writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);
    console.error(receipt.error);
    process.exit(1);
  }
}

main().catch((error) => {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify({
    receipt_id: 'vercel-workflow-submit-bridge',
    created_at: new Date().toISOString(),
    status: 'failed',
    error: error instanceof Error ? error.message : String(error),
    mutation_executed: false,
    protected_actions_executed: false,
  }, null, 2)}\n`);
  console.error(error);
  process.exit(1);
});

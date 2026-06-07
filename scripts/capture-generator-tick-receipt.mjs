#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const targetUrl = process.env.GENERATOR_TICK_URL || 'https://auto-builder-git-auto-builder-u-bdac7f-strategic-minds-advisory.vercel.app/api/cron/autobuilder-generator';
const token = process.env.CRON_API_TOKEN || process.env.GENERATOR_CRON_TOKEN || '';
const outDir = process.env.RECEIPT_DIR || 'workflow-receipts';
const outPath = path.join(outDir, 'generator-tick-receipt.json');

function safeText(value, limit = 12000) {
  if (!value) return '';
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > limit ? `${text.slice(0, limit)}...[truncated]` : text;
}

function writeReceipt(receipt) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);
}

async function main() {
  const startedAt = Date.now();
  const baseReceipt = {
    receipt_id: 'generator-tick-receipt',
    created_at: new Date().toISOString(),
    target_url: targetUrl,
    mutation_executed: false,
    protected_actions_executed: false,
    production_action_allowed: false,
    purpose: 'Capture an approved non-mutating AUTO BUILDER generator tick receipt.',
    gate_policy: 'This bridge may call the protected generator cron route only. It may not deploy, change secrets, publish, charge, message customers, spend, or run credentialed browser actions.',
    auth: {
      token_name_options: ['CRON_API_TOKEN', 'GENERATOR_CRON_TOKEN'],
      token_present: Boolean(token),
      token_value_exposed: false,
    },
    response: null,
    status: 'pending',
  };

  if (!token) {
    const receipt = {
      ...baseReceipt,
      status: 'hard_gate_missing_secret',
      next_action: 'Add CRON_API_TOKEN or GENERATOR_CRON_TOKEN to the approved GitHub Actions secret channel, then rerun this workflow.',
    };
    writeReceipt(receipt);
    console.error('Missing CRON_API_TOKEN or GENERATOR_CRON_TOKEN. Receipt written.');
    process.exit(1);
  }

  let responseText = '';
  let status = 0;
  let statusText = '';

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        'x-cron-token': token,
      },
    });

    status = response.status;
    statusText = response.statusText;
    responseText = await response.text();

    let parsed = null;
    try {
      parsed = responseText ? JSON.parse(responseText) : null;
    } catch {
      parsed = null;
    }

    const receipt = {
      ...baseReceipt,
      status: response.ok && parsed?.ok ? 'verified' : 'failed',
      response: {
        ok: response.ok,
        status,
        status_text: statusText,
        elapsed_ms: Date.now() - startedAt,
        parsed,
        text: parsed ? undefined : safeText(responseText),
      },
      generator_tick_verified: Boolean(response.ok && parsed?.ok && parsed?.plan),
      telemetry_status: parsed?.telemetry?.status || parsed?.telemetry?.ok || null,
      next_action: response.ok && parsed?.ok ? 'protected_policy_smoke_receipt' : 'Inspect generator tick failure receipt and resolve gate.',
    };

    writeReceipt(receipt);
    console.log(`Receipt written to ${outPath}`);

    if (receipt.status !== 'verified') {
      throw new Error(`Generator tick route returned ${status} ${statusText}`);
    }
  } catch (error) {
    const receipt = {
      ...baseReceipt,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      response: {
        ok: false,
        status,
        status_text: statusText,
        elapsed_ms: Date.now() - startedAt,
        text: safeText(responseText),
      },
      next_action: 'Inspect generator tick failure receipt and resolve gate.',
    };
    writeReceipt(receipt);
    console.error(receipt.error);
    process.exit(1);
  }
}

main().catch((error) => {
  writeReceipt({
    receipt_id: 'generator-tick-receipt',
    created_at: new Date().toISOString(),
    status: 'failed',
    error: error instanceof Error ? error.message : String(error),
    mutation_executed: false,
    protected_actions_executed: false,
  });
  console.error(error);
  process.exit(1);
});

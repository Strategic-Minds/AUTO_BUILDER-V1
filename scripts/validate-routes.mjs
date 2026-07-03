import { receiptBase, writeJson } from '../lib/receipt.mjs';

const receipt = receiptBase('route-smoke');
const baseUrl = process.env.VALIDATION_BASE_URL ?? 'http://127.0.0.1:3000';

async function readJson(route, init) {
  const res = await fetch(new URL(route, baseUrl), init);
  const body = await res.json().catch(async () => ({ text: await res.text() }));
  return { route, status: res.status, ok: res.ok, body };
}

async function main() {
  const results = [];
  results.push(await readJson('/api/health'));
  results.push(await readJson('/api/cron/factory-readiness'));
  results.push(await readJson('/api/factory/router', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idea: 'browser validation route smoke' })
  }));
  results.push(await readJson('/api/factory/build-packet', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idea: 'browser validation route smoke' })
  }));

  receipt.receipts.push(...results);
  await writeJson('validation-artifacts/route-smoke.receipt.json', {
    ...receipt,
    target: baseUrl,
    status: 'passed'
  });
}

main().catch(async (error) => {
  await writeJson('validation-artifacts/route-smoke.receipt.json', {
    ...receipt,
    target: baseUrl,
    status: 'failed',
    blocker: String(error instanceof Error ? error.message : error)
  });
  console.error(error);
  process.exit(1);
});

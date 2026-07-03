import { receiptBase, writeJson } from '../lib/receipt.mjs';

const receipt = receiptBase('cron-dry-run');
const baseUrl = process.env.VALIDATION_BASE_URL ?? 'http://127.0.0.1:3000';

async function readJson(route) {
  const res = await fetch(new URL(route, baseUrl));
  const body = await res.json().catch(async () => ({ text: await res.text() }));
  return { route, status: res.status, ok: res.ok, body };
}

async function main() {
  const results = [];
  results.push(await readJson('/api/cron/factory-readiness'));
  results.push(await readJson('/api/health'));
  receipt.receipts.push(...results);
  await writeJson('validation-artifacts/cron-dry-run.receipt.json', {
    ...receipt,
    target: baseUrl,
    status: 'passed'
  });
}

main().catch(async (error) => {
  await writeJson('validation-artifacts/cron-dry-run.receipt.json', {
    ...receipt,
    target: baseUrl,
    status: 'failed',
    blocker: String(error instanceof Error ? error.message : error)
  });
  console.error(error);
  process.exit(1);
});

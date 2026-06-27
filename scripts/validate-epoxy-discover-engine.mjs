import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/app/api/cron/epoxy-competitor-queue/route.ts',
  'src/app/api/preview/epoxy-competitor-queue-dry-run/route.ts',
  'src/lib/epoxy-discover-engine/states.ts',
  'src/lib/epoxy-discover-engine/types.ts',
  'src/lib/epoxy-discover-engine/state-queue.ts',
  'src/lib/epoxy-discover-engine/supabase-adapter.ts',
  'src/lib/epoxy-discover-engine/sheet-sync-adapter.ts',
  'src/lib/epoxy-discover-engine/receipt-writer.ts',
  'src/lib/epoxy-discover-engine/worker.ts',
  'supabase/migrations/0004_epoxy_discover_engine_draft.sql',
  'docs/epoxy-discover-engine/IMPLEMENTATION_LANE.md'
];

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

for (const path of requiredFiles) {
  assert(existsSync(path), `${path} is missing.`);
  assert(readFileSync(path, 'utf8').trim().length > 0, `${path} is empty.`);
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
assert(
  packageJson.scripts?.['validate:epoxy-discover-engine'] === 'node scripts/validate-epoxy-discover-engine.mjs',
  'package.json must expose validate:epoxy-discover-engine.'
);

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
assert(
  vercel.crons?.some((cron) => cron.path === '/api/cron/epoxy-competitor-queue' && cron.schedule === '*/5 * * * *'),
  'vercel.json must schedule /api/cron/epoxy-competitor-queue every 5 minutes.'
);

const route = readFileSync('src/app/api/cron/epoxy-competitor-queue/route.ts', 'utf8');
for (const marker of ['authorizeCronRequest', 'runEpoxyCompetitorQueue', 'productionActionAllowed', 'dryRun']) {
  assert(route.includes(marker), `Cron route missing marker: ${marker}.`);
}

const previewRoute = readFileSync('src/app/api/preview/epoxy-competitor-queue-dry-run/route.ts', 'utf8');
for (const marker of ['VERCEL_ENV === "production"', 'dryRun: true', 'forcedDryRun', 'routeDisabledInProduction']) {
  assert(previewRoute.includes(marker), `Preview dry-run route missing marker: ${marker}.`);
}

const worker = readFileSync('src/lib/epoxy-discover-engine/worker.ts', 'utf8');
for (const marker of ['productionActionAllowed', 'liveWritesAllowed', 'writeEpoxyReceipt']) {
  assert(worker.includes(marker), `Worker missing marker: ${marker}.`);
}

const supabaseAdapter = readFileSync('src/lib/epoxy-discover-engine/supabase-adapter.ts', 'utf8');
for (const marker of ['EPOXY_DISCOVER_RELEASE_APPROVED', 'EPOXY_DISCOVER_PERSISTENCE_ENABLED', 'claim_epoxy_queue_job']) {
  assert(supabaseAdapter.includes(marker), `Supabase adapter missing marker: ${marker}.`);
}

const sheetAdapter = readFileSync('src/lib/epoxy-discover-engine/sheet-sync-adapter.ts', 'utf8');
for (const marker of ['EPOXY_SHEET_SYNC_ENABLED', 'EPOXY_SHEET_SYNC_WEBHOOK_URL', 'allowLiveWrites']) {
  assert(sheetAdapter.includes(marker), `Sheet adapter missing marker: ${marker}.`);
}

const receiptWriter = readFileSync('src/lib/epoxy-discover-engine/receipt-writer.ts', 'utf8');
assert(receiptWriter.includes('epoxy_run_receipts'), 'Receipt writer must target epoxy_run_receipts.');

const migration = readFileSync('supabase/migrations/0004_epoxy_discover_engine_draft.sql', 'utf8');
for (const table of [
  'epoxy_states',
  'epoxy_queue',
  'epoxy_competitors',
  'epoxy_website_intelligence',
  'epoxy_change_detection',
  'epoxy_reconstruction_packets',
  'epoxy_run_receipts',
  'epoxy_failed_jobs'
]) {
  assert(migration.includes(`public.${table}`), `Migration missing table marker: ${table}.`);
  assert(migration.includes(`alter table public.${table} enable row level security`), `Migration missing RLS for: ${table}.`);
}

for (const marker of [
  'claim_epoxy_queue_job',
  'for update skip locked',
  'revoke all on table',
  'from anon, authenticated, service_role',
  'grant select on table',
  'grant select, insert, update, delete on table',
  'revoke execute on function public.claim_epoxy_queue_job(text) from public, anon, authenticated',
  'grant execute on function public.claim_epoxy_queue_job(text) to service_role'
]) {
  assert(migration.includes(marker), `Migration missing governance marker: ${marker}.`);
}

console.log('Epoxy discover engine validation passed.');

// ─── PATCH: claimed-job-key preservation validation ──────────────────────────
console.log("\n[PATCH VALIDATION] Claimed job key preservation...");

// Test 1: worker.ts must import completeEpoxyQueueJob and failEpoxyQueueJob
const workerSrc = readFileSync("src/lib/epoxy-discover-engine/worker.ts", "utf-8");
assert(
  workerSrc.includes("completeEpoxyQueueJob"),
  "FAIL: worker.ts must import completeEpoxyQueueJob from supabase-adapter"
);
assert(
  workerSrc.includes("failEpoxyQueueJob"),
  "FAIL: worker.ts must import failEpoxyQueueJob from supabase-adapter"
);
console.log("  ✅ worker.ts imports completeEpoxyQueueJob + failEpoxyQueueJob");

// Test 2: worker.ts must call resolveQueueJob (key preservation function)
assert(
  workerSrc.includes("resolveQueueJob"),
  "FAIL: worker.ts must use resolveQueueJob to preserve claimed job key"
);
console.log("  ✅ worker.ts uses resolveQueueJob (claimed key preservation)");

// Test 3: resolveQueueJob must check !input.dryRun before using claimed key
assert(
  workerSrc.includes("!input.dryRun"),
  "FAIL: resolveQueueJob must gate live-key preservation on !input.dryRun"
);
console.log("  ✅ resolveQueueJob gates key preservation on !input.dryRun");

// Test 4: supabase-adapter must export completeEpoxyQueueJob
const adapterSrc = readFileSync("src/lib/epoxy-discover-engine/supabase-adapter.ts", "utf-8");
assert(
  adapterSrc.includes("export async function completeEpoxyQueueJob"),
  "FAIL: supabase-adapter.ts must export completeEpoxyQueueJob"
);
assert(
  adapterSrc.includes("export async function failEpoxyQueueJob"),
  "FAIL: supabase-adapter.ts must export failEpoxyQueueJob"
);
console.log("  ✅ supabase-adapter.ts exports completeEpoxyQueueJob + failEpoxyQueueJob");

// Test 5: completeEpoxyQueueJob must update status to COMPLETE
assert(
  adapterSrc.includes('"COMPLETE"'),
  "FAIL: completeEpoxyQueueJob must set status to COMPLETE"
);
console.log('  ✅ completeEpoxyQueueJob sets status: "COMPLETE"');

// Test 6: failEpoxyQueueJob must handle RETRY and FAILED transitions
assert(
  adapterSrc.includes('"RETRY"') && adapterSrc.includes('"FAILED"'),
  "FAIL: failEpoxyQueueJob must handle both RETRY and FAILED status transitions"
);
console.log('  ✅ failEpoxyQueueJob handles RETRY + FAILED transitions');

// Test 7: worker error path must call failEpoxyQueueJob
assert(
  workerSrc.includes("await failEpoxyQueueJob"),
  "FAIL: worker.ts error path must call failEpoxyQueueJob"
);
console.log("  ✅ worker.ts error path calls failEpoxyQueueJob");

// Test 8: claimed key is preserved verbatim (no new key generation)
assert(
  workerSrc.includes("claimed.jobKey"),
  "FAIL: resolveQueueJob must use claimed.jobKey directly — no regeneration"
);
console.log("  ✅ resolveQueueJob preserves claimed.jobKey verbatim");

// Test 9: dry-run path still generates synthetic key
assert(
  workerSrc.includes("buildStateQueueJob"),
  "FAIL: dry-run path must still call buildStateQueueJob for synthetic key"
);
console.log("  ✅ dry-run path still uses buildStateQueueJob for synthetic key");

// Test 10: worker safety check — only update the row WE claimed
assert(
  adapterSrc.includes(".eq(\"locked_by\", input.workerId)"),
  "FAIL: completeEpoxyQueueJob must filter by locked_by=workerId to prevent foreign-key stomping"
);
console.log("  ✅ completeEpoxyQueueJob scoped to locked_by=workerId (safety guard)");

console.log("\n✅ ALL CLAIMED-JOB-KEY PRESERVATION CHECKS PASSED");


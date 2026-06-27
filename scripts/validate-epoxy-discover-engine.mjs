import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/app/api/cron/epoxy-competitor-queue/route.ts',
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

import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(path, 'utf8')
}

function assert(condition, message) {
  if (!condition) {
    console.error(`Autonomous package loop validation failed: ${message}`)
    process.exit(1)
  }
}

const requiredFiles = [
  'src/lib/auto-builder/autonomous-package-loop.ts',
  'src/app/api/cron/auto-builder/route.ts',
  'src/app/api/cron/auto-builder-reconcile/route.ts',
  'src/app/api/cron/auto-builder-full-validate/route.ts',
  'src/app/api/cron/auto-builder-nightly/route.ts',
  'supabase/migrations/20260703110000_autonomous_package_loop.sql',
  'docs/AUTO_BUILDER_AUTONOMOUS_PACKAGE_LOOP.md',
  'docs/AUTO_BUILDER_AUTONOMOUS_PACKAGE_LOOP_RECEIPT.md',
]

for (const path of requiredFiles) {
  assert(read(path).length > 0, `${path} is missing or empty`)
}

const loop = read('src/lib/auto-builder/autonomous-package-loop.ts')
for (const marker of [
  'QUEUE_STATES',
  'LIFECYCLE_STAGES',
  'PROTECTED_ACTIONS',
  'runAutonomousPackageLoop',
  'productionActionAllowed: false',
  'AUTO_BUILDER_AUTONOMOUS_LOOP_PERSISTENCE_ENABLED',
  'AUTO_BUILDER_AUTONOMOUS_WORKERS_ENABLED',
  'AUTO_BUILDER_RECEIPT_WRITES_ENABLED',
  'automation_runs',
  'automation_scorecards',
  'automation_package_candidates',
]) {
  assert(loop.includes(marker), `loop missing marker ${marker}`)
}

for (const action of [
  'production deploy',
  'live Supabase write or execute',
  'secret creation or exposure',
  'payment execution',
  'customer message or external publishing',
]) {
  assert(loop.includes(action), `protected action missing: ${action}`)
}

const cronRoutes = [
  'src/app/api/cron/auto-builder/route.ts',
  'src/app/api/cron/auto-builder-reconcile/route.ts',
  'src/app/api/cron/auto-builder-full-validate/route.ts',
  'src/app/api/cron/auto-builder-nightly/route.ts',
]

for (const path of cronRoutes) {
  const source = read(path)
  assert(source.includes('authorizeCronRequest'), `${path} must use shared cron auth`)
  assert(source.includes('runAutonomousPackageLoop'), `${path} must run autonomous package loop`)
  assert(source.includes('production_mutation: false'), `${path} must declare no production mutation`)
  assert(source.includes('productionActionAllowed'), `${path} must expose productionActionAllowed`) 
}

const vercel = read('vercel.json')
for (const route of [
  '/api/cron/auto-builder',
  '/api/cron/auto-builder-reconcile',
  '/api/cron/auto-builder-full-validate',
  '/api/cron/auto-builder-nightly',
]) {
  assert(vercel.includes(route), `vercel.json missing ${route}`)
}
assert(vercel.includes('*/5 * * * *'), 'vercel.json must keep five-minute heartbeat cadence')
assert(vercel.includes('*/15 * * * *'), 'vercel.json must include fifteen-minute reconcile cadence')
assert(vercel.includes('0 6,18 * * *'), 'vercel.json must include twice-daily validation cadence')
assert(vercel.includes('0 2 * * *'), 'vercel.json must include nightly drain cadence')

const migration = read('supabase/migrations/20260703110000_autonomous_package_loop.sql')
for (const table of [
  'automation_queue',
  'automation_runs',
  'automation_jobs',
  'automation_scorecards',
  'automation_repair_queue',
  'automation_hardening_queue',
  'automation_package_candidates',
  'automation_approvals',
  'automation_receipts',
]) {
  assert(migration.includes(`create table if not exists ${table}`), `migration missing ${table}`)
  assert(migration.includes(`alter table ${table} enable row level security`), `migration missing RLS for ${table}`)
}
assert(migration.includes("auth.role() = 'service_role'"), 'migration must include explicit service-role policies')
assert(migration.includes('Do not apply to production'), 'migration must carry production approval warning')

const docs = read('docs/AUTO_BUILDER_AUTONOMOUS_PACKAGE_LOOP.md')
for (const phrase of ['queue -> validate -> score -> fix -> retest -> harden -> retest -> package', 'Protected Lane', 'Package Done Standard', 'Rollback']) {
  assert(docs.includes(phrase), `docs missing phrase: ${phrase}`)
}

const receipt = read('docs/AUTO_BUILDER_AUTONOMOUS_PACKAGE_LOOP_RECEIPT.md')
for (const phrase of ['No production deploy', 'No live Supabase mutation', 'No Vercel cron activation', 'Next Gate']) {
  assert(receipt.includes(phrase), `receipt missing phrase: ${phrase}`)
}

const packageJson = JSON.parse(read('package.json'))
assert(packageJson.scripts?.['validate:package-loop'], 'package.json must define validate:package-loop')
assert(packageJson.scripts?.['validate:all']?.includes('validate:package-loop'), 'validate:all must include validate:package-loop')

console.log('Autonomous package loop validation passed.')

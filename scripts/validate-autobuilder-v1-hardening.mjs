import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(path, 'utf8')
}

function assert(condition, message) {
  if (!condition) {
    console.error(`AUTO_BUILDER V1 hardening validation failed: ${message}`)
    process.exit(1)
  }
}

const gatewayRoutes = [
  'src/app/api/mcp/gateway/route.ts',
  'src/app/api/mcp/universal-ops/route.ts',
  'src/app/api/mcp/xps-factory/route.ts',
]

for (const path of gatewayRoutes) {
  const source = read(path)
  assert(source.includes('requireAuthorizedExecution'), `${path} must call requireAuthorizedExecution before tool routing`)
}

const cronRoutes = [
  'src/app/api/cron/auto-builder/route.ts',
  'src/app/api/cron/enterprise-kernel/route.ts',
  'src/app/api/cron/quality-auto-heal/route.ts',
  'src/app/api/cron/intelligence-ingest/route.ts',
]

for (const path of cronRoutes) {
  const source = read(path)
  assert(source.includes('authorizeCronRequest'), `${path} must use shared fail-closed cron auth`)
  assert(source.includes('production_mutation: false'), `${path} must declare no production mutation`)
}

const adapterRoutes = [
  'src/app/api/adapters/auto-fix/route.ts',
  'src/app/api/adapters/auto-heal/route.ts',
  'src/app/api/adapters/auto-harden/route.ts',
  'src/app/api/adapters/quality-scan/route.ts',
]

for (const path of adapterRoutes) {
  const source = read(path)
  assert(source.includes('authorizeCronRequest'), `${path} must use shared fail-closed cron auth`)
  assert(source.includes('production_mutation: false'), `${path} health response must declare no production mutation`)
}

const cronAuth = read('src/lib/cron-auth.ts')
assert(cronAuth.includes('missing_configuration'), 'cron auth must fail closed when no production secret is configured')
assert(cronAuth.includes('authorization') && cronAuth.includes('x-cron-token') && cronAuth.includes('x-cron-secret'), 'cron auth must accept documented token headers')

const executionAuth = read('src/lib/autobuilder-v2/execution-route-auth.ts')
assert(executionAuth.includes('AUTO_BUILDER_OPERATOR_TOKEN'), 'execution auth must support operator token')
assert(executionAuth.includes('AUTO_BUILDER_BRIDGE_TOKEN'), 'execution auth must support bridge token')
assert(executionAuth.includes('requireAuthorizedExecution'), 'execution auth must export requireAuthorizedExecution')

const adapterBase = read('src/workers/adapters/base.ts')
assert(adapterBase.includes('AUTO_BUILDER_RECEIPT_WRITES_ENABLED'), 'adapter base must make dry-run receipt writes opt-in')
assert(adapterBase.includes('receipt_write_skipped'), 'adapter base must expose skipped dry-run receipt writes')

const dryRunWorkers = [
  'src/workers/adapters/auto-fix.ts',
  'src/workers/adapters/auto-heal.ts',
  'src/workers/adapters/auto-harden.ts',
  'src/workers/adapters/quality-scan.ts',
]

for (const path of dryRunWorkers) {
  const source = read(path)
  assert(source.includes('dry_run_only'), `${path} must return dry-run-only details`) 
  assert(source.includes('ctx.dryRun') || source.includes('_ctx.dryRun'), `${path} must branch on adapter dry-run mode`)
}

const packageJson = JSON.parse(read('package.json'))
for (const scriptName of ['lint', 'typecheck', 'validate:hardening', 'validate:all']) {
  assert(packageJson.scripts?.[scriptName], `package.json must define ${scriptName}`)
}

const workflow = read('.github/workflows/auto-builder-master-validate.yml')
for (const requiredRun of ['npm run lint', 'npm run typecheck', 'npm run validate:hardening', 'npm run build']) {
  assert(workflow.includes(requiredRun), `CI workflow must run ${requiredRun}`)
}
assert(!workflow.includes('npm run lint --if-present'), 'CI lint must not be optional')
assert(!workflow.includes('npm run build --if-present'), 'CI build must not be optional')

console.log('AUTO_BUILDER V1 hardening validation passed.')

import { readFileSync } from 'node:fs';

const requiredFiles = [
  'src/lib/autonomous-control-plane/state.ts',
  'src/app/autonomous-control-plane/page.tsx',
  'src/app/autonomous-control-plane/page.module.css',
  'src/app/api/autonomous-control-plane/state/route.ts',
  'src/app/api/autonomous-control-plane/run-loop/route.ts',
  'src/app/api/cron/autonomous-control-plane/route.ts',
  'docs/autonomous-control-plane/BUILD_PACKET.md',
  'docs/autonomous-control-plane/SUPABASE_PERSISTENCE_MIGRATION_REVIEW.md'
];

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

for (const path of requiredFiles) {
  const source = readFileSync(path, 'utf8');
  assert(source.length > 0, `${path} is empty or missing.`);
}

const state = readFileSync('src/lib/autonomous-control-plane/state.ts', 'utf8');
const cron = readFileSync('src/app/api/cron/autonomous-control-plane/route.ts', 'utf8');
const page = readFileSync('src/app/autonomous-control-plane/page.tsx', 'utf8');

for (const stage of ['DISCOVER', 'VALIDATE', 'BRAND', 'BUILD', 'DEPLOY', 'DISTRIBUTE', 'MONETIZE', 'ANALYZE', 'OPTIMIZE', 'SCALE', 'REPLICATE', 'REPEAT']) {
  assert(state.includes(stage), `Missing AWOS loop stage ${stage}.`);
}

for (const gate of ['production deploy', 'live billing', 'external publishing']) {
  assert(JSON.stringify(state).toLowerCase().includes(gate), `Missing governance gate marker: ${gate}.`);
}

assert(state.includes('productionActionAllowed: false'), 'State must keep productionActionAllowed false.');
assert(cron.includes('AUTONOMOUS_CONTROL_PLANE_CRON_SECRET'), 'Cron route must support signed cron secret.');
assert(cron.includes('dryRun'), 'Cron route must expose dry-run evidence mode.');
assert(cron.includes('productionActionAllowed: false'), 'Cron route must keep productionActionAllowed false.');
assert(page.includes('Strategic Minds'), 'Preview page must render Strategic Minds positioning.');
assert(page.includes('/api/autonomous-control-plane/run-loop'), 'Preview page must link to dry-run loop route.');

console.log('Autonomous control plane validation passed.');

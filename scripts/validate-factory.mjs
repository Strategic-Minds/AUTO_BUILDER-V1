import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/lib/factory.ts',
  'src/lib/factory-registry.ts',
  'src/lib/queue-runner.ts',
  'src/lib/finance-sim.ts',
  'src/app/api/factory/idea-intake/route.ts',
  'src/app/api/factory/router/route.ts',
  'src/app/api/factory/build-packet/route.ts',
  'src/app/api/factory/queue-runner/route.ts',
  'src/app/api/factory/hardening/route.ts',
  'src/app/api/factory/capability-test/route.ts',
  'src/app/api/factory/reverse-engineering/route.ts',
  'src/app/api/factory/financial-simulation/route.ts',
  'src/app/api/cron/factory-readiness/route.ts',
  'src/app/api/cron/reverse-engineering-passive/route.ts',
  'supabase/migrations/0002_factory_schema.sql',
  'supabase/migrations/0003_finance_prediction_simulation.sql',
  'factory/templates/landing-lead-capture.json',
  'factory/templates/auth-dashboard.json',
  'factory/templates/agent-console.json',
  'factory/templates/workflow-queue-runner.json',
  'factory/templates/financial-forecast-panel.json',
  'factory/templates/financial-prediction-simulation.json',
  'packages/finance-sim/simulator.py',
  'packages/finance-sim/README.md',
  'docs/ONE_HOUR_BUILD_FACTORY.md',
  'docs/CAPABILITY_TEST_SYSTEM.md',
  'docs/PASSIVE_REVERSE_ENGINEERING_SYSTEM.md',
  'docs/FINANCIAL_PREDICTION_SIMULATION_SYSTEM.md',
  '.github/workflows/preview-validation.yml'
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missing factory files:', missing.join(', '));
  process.exit(1);
}

const factoryMigration = readFileSync('supabase/migrations/0002_factory_schema.sql', 'utf8');
for (const requiredTable of ['ideas', 'build_cards', 'templates', 'jobs', 'approval_requests']) {
  if (!factoryMigration.includes(`public.${requiredTable}`)) {
    console.error(`Factory migration missing table: ${requiredTable}`);
    process.exit(1);
  }
}

const financeMigration = readFileSync('supabase/migrations/0003_finance_prediction_simulation.sql', 'utf8');
for (const requiredTable of ['leads', 'opportunities', 'sales', 'spend', 'forecasts', 'simulation_runs', 'decisions']) {
  if (!financeMigration.includes(`public.${requiredTable}`)) {
    console.error(`Finance migration missing table: ${requiredTable}`);
    process.exit(1);
  }
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
if (packageJson.scripts?.lint !== 'npm run validate:factory') {
  console.error('Package lint script must delegate to validate:factory.');
  process.exit(1);
}
if (packageJson.scripts?.typecheck !== 'tsc --noEmit --pretty false') {
  console.error('Package typecheck script must run TypeScript without emitting files.');
  process.exit(1);
}

const workflow = readFileSync('.github/workflows/preview-validation.yml', 'utf8');
for (const marker of ['npm install', 'npm run lint', 'npm run typecheck', 'npm run build']) {
  if (!workflow.includes(marker)) {
    console.error(`Workflow missing marker: ${marker}`);
    process.exit(1);
  }
}

console.log('Factory validation passed: schema, routes, finance simulation, templates, workflow, docs, and explicit frontend checks are installed.');

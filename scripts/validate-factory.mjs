import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/lib/factory.ts',
  'src/lib/factory-registry.ts',
  'src/lib/queue-runner.ts',
  'src/app/api/factory/idea-intake/route.ts',
  'src/app/api/factory/router/route.ts',
  'src/app/api/factory/build-packet/route.ts',
  'src/app/api/factory/queue-runner/route.ts',
  'src/app/api/factory/hardening/route.ts',
  'src/app/api/factory/capability-test/route.ts',
  'src/app/api/factory/reverse-engineering/route.ts',
  'src/app/api/cron/factory-readiness/route.ts',
  'src/app/api/cron/reverse-engineering-passive/route.ts',
  'supabase/migrations/0002_factory_schema.sql',
  'factory/templates/landing-lead-capture.json',
  'factory/templates/auth-dashboard.json',
  'factory/templates/agent-console.json',
  'factory/templates/workflow-queue-runner.json',
  'factory/templates/financial-forecast-panel.json',
  'docs/ONE_HOUR_BUILD_FACTORY.md',
  'docs/CAPABILITY_TEST_SYSTEM.md',
  'docs/PASSIVE_REVERSE_ENGINEERING_SYSTEM.md',
  '.github/workflows/preview-validation.yml'
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missing factory files:', missing.join(', '));
  process.exit(1);
}

const migration = readFileSync('supabase/migrations/0002_factory_schema.sql', 'utf8');
for (const requiredTable of ['ideas', 'build_cards', 'templates', 'jobs', 'approval_requests']) {
  if (!migration.includes(`public.${requiredTable}`)) {
    console.error(`Migration missing table: ${requiredTable}`);
    process.exit(1);
  }
}

const workflow = readFileSync('.github/workflows/preview-validation.yml', 'utf8');
for (const marker of ['validate:factory', 'npm run build']) {
  if (!workflow.includes(marker)) {
    console.error(`Workflow missing marker: ${marker}`);
    process.exit(1);
  }
}

console.log('Factory validation passed: schema, routes, templates, workflow, and docs are installed.');

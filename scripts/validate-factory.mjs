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
  'docs/auto-builder-os/V2_TO_V1_ENHANCEMENT_MAP.md',
  'lib/receipt.mjs',
  'scripts/validate-prompt-library.mjs',
  'scripts/validate-browser.mjs',
  'scripts/validate-routes.mjs',
  'scripts/validate-cron.mjs',
  'scripts/public-discovery.mjs',
  'docs/gpt-action-contract.md',
  '.github/workflows/browser-validation.yml',
  '.github/workflows/preview-validation.yml'
];

const registryFiles = [
  'docs/registries/control-plane-registry.json',
  'docs/registries/gpt-bridge-registry.yaml',
  'docs/registries/prompt-library.yaml',
  'docs/registries/queue-lifecycle.yaml',
  'docs/registries/validation-scorecard.yaml',
  'docs/registries/vercel-cron-spec.yaml'
];

const missing = [...requiredFiles, ...registryFiles].filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missing factory files:', missing.join(', '));
  process.exit(1);
}

function readRequiredFile(file) {
  return readFileSync(file, 'utf8');
}

function validateJsonFile(file) {
  try {
    JSON.parse(readRequiredFile(file));
  } catch (error) {
    console.error(`Registry JSON parse failed for ${file}: ${error.message}`);
    process.exit(1);
  }
}

function validateYamlShape(file, requiredMarkers) {
  const content = readRequiredFile(file);
  for (const marker of requiredMarkers) {
    if (!content.includes(marker)) {
      console.error(`Registry YAML missing marker ${marker} in ${file}`);
      process.exit(1);
    }
  }
}

validateJsonFile('docs/registries/control-plane-registry.json');
validateYamlShape('docs/registries/gpt-bridge-registry.yaml', ['schema_version:', 'bridges:', 'supabase_mcp_bridge']);
validateYamlShape('docs/registries/prompt-library.yaml', ['schema_version:', 'required_fields:', 'families:']);
validateYamlShape('docs/registries/queue-lifecycle.yaml', ['schema_version:', 'queue_states:', 'transition_rules:']);
validateYamlShape('docs/registries/validation-scorecard.yaml', ['schema_version:', 'thresholds:', 'categories:', 'validator_authority:']);
validateYamlShape('docs/registries/vercel-cron-spec.yaml', ['schema_version:', 'existing_v1_routes:', 'proposed_contracts_from_v2:', 'docs_only']);

const vercelCronSpec = readRequiredFile('docs/registries/vercel-cron-spec.yaml');
const existingRouteMatches = [...vercelCronSpec.matchAll(/^  - path: (\/api\/cron\/[a-z0-9-]+)$/gm)].map((match) => match[1]);
for (const route of existingRouteMatches) {
  const routeFile = `src/app${route}/route.ts`;
  if (!existsSync(routeFile)) {
    console.error(`Vercel cron registry route missing file: ${route} -> ${routeFile}`);
    process.exit(1);
  }
}

const factoryMigration = readRequiredFile('supabase/migrations/0002_factory_schema.sql');
for (const requiredTable of ['ideas', 'build_cards', 'templates', 'jobs', 'approval_requests']) {
  if (!factoryMigration.includes(`public.${requiredTable}`)) {
    console.error(`Factory migration missing table: ${requiredTable}`);
    process.exit(1);
  }
}

const financeMigration = readRequiredFile('supabase/migrations/0003_finance_prediction_simulation.sql');
for (const requiredTable of ['leads', 'opportunities', 'sales', 'spend', 'forecasts', 'simulation_runs', 'decisions']) {
  if (!financeMigration.includes(`public.${requiredTable}`)) {
    console.error(`Finance migration missing table: ${requiredTable}`);
    process.exit(1);
  }
}

const workflow = readRequiredFile('.github/workflows/preview-validation.yml');
for (const marker of ['validate:factory', 'npm run build']) {
  if (!workflow.includes(marker)) {
    console.error(`Workflow missing marker: ${marker}`);
    process.exit(1);
  }
}

const browserWorkflow = readRequiredFile('.github/workflows/browser-validation.yml');
for (const marker of ['validate:routes', 'validate:cron', 'validate:browser', 'playwright install --with-deps chromium']) {
  if (!browserWorkflow.includes(marker)) {
    console.error(`Browser workflow missing marker: ${marker}`);
    process.exit(1);
  }
}

console.log('Factory validation passed: schema, routes, finance simulation, templates, workflow, registry manifests, browser contract, prompt library, and cron route parity are installed.');
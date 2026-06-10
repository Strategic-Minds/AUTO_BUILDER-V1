import { readFileSync } from 'node:fs';

const expectedCallableTools = [
  'health_check',
  'get_repo_summary',
  'list_repo_files',
  'read_bootstrap_status',
  'read_text_file',
  'run_job',
  'run_universal_job',
  'run_drive_job',
  'drive_list_tree',
  'drive_create_folder',
  'drive_move_folder',
  'drive_move_file',
  'drive_write_receipt',
  'run_platform_provisioning_job',
  'create_github_repo',
  'create_vercel_project',
  'create_vercel_workflow',
  'create_vercel_agent',
  'create_ai_gateway',
  'rollback'
];

const requiredEnvNames = [
  'AUTO_BUILDER_OPERATOR_TOKEN',
  'AUTO_BUILDER_BRIDGE_TOKEN',
  'GOOGLE_CLIENT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_DRIVE_ROOT_FOLDER_ID',
  'GITHUB_TOKEN',
  'GITHUB_ORG',
  'VERCEL_TOKEN',
  'VERCEL_TEAM_ID',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SHOPIFY_SHOP',
  'SHOPIFY_ADMIN_TOKEN',
  'AI_GATEWAY_API_KEY',
  'OPENAI_API_KEY',
  'GROQ_API_KEY'
];

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function countRegisterTool(source) {
  return [...source.matchAll(/server\.registerTool\('/g)].length;
}

function assertSourceAdvertisesRelativeEndpoint(source, path, endpoint) {
  assert(source.includes(endpoint), `${path} does not advertise required endpoint: ${endpoint}`);
  assert(!source.includes('/docs/auto-builder-2-gpt-actions.openapi.yaml'), `${path} advertises removed OpenAPI endpoint.`);
}

const mcpRouteSources = [
  ['src/app/api/mcp/route.ts', read('src/app/api/mcp/route.ts')],
  ['src/app/api/mcp-minimal/[transport]/route.ts', read('src/app/api/mcp-minimal/[transport]/route.ts')]
];
const routeSource = mcpRouteSources[0][1];
const minimalRouteSource = mcpRouteSources[1][1];
const executionSource = read('src/lib/autobuilder-v2/execution-tools.ts');
const toolsRouteSource = read('src/app/api/mcp/tools/route.ts');
const manifestSource = read('src/app/api/mcp/manifest/route.ts');
const pluginSource = read('src/app/.well-known/ai-plugin.json/route.ts');
const runJobRouteSource = read('src/app/api/bridge/run-job/route.ts');
const runUniversalJobRouteSource = read('src/app/api/bridge/run-universal-job/route.ts');
const rollbackRouteSource = read('src/app/api/bridge/rollback/route.ts');
const bridgeExecutionRouteSource = read('src/app/api/bridge/[bridge]/[action]/route.ts');
const packageJson = JSON.parse(read('package.json'));

for (const [path, source] of mcpRouteSources) {
  assert(countRegisterTool(source) === expectedCallableTools.length, `${path} registers ${countRegisterTool(source)} tools, expected ${expectedCallableTools.length}.`);
  for (const toolName of expectedCallableTools) {
    assert(
      source.includes(`server.registerTool('${toolName}'`),
      `${path} is missing callable tool registration: ${toolName}`
    );
  }
  assert(source.includes('expectedCallableMcpToolNames'), `${path} does not expose expectedCallableMcpToolNames.`);
}

for (const toolName of expectedCallableTools) {
  assert(
    executionSource.includes(`"${toolName}"`) || ['health_check', 'get_repo_summary', 'list_repo_files', 'read_bootstrap_status', 'read_text_file'].includes(toolName),
    `Execution tool registry is missing: ${toolName}`
  );
}

assert(
  packageJson.scripts?.['validate:mcp-tools'] === 'node scripts/validate-mcp-tools.mjs',
  'package.json is missing validate:mcp-tools script.'
);

for (const marker of [
  'sanitizeForResponse',
  'secretKeyPattern',
  'receipt:',
  'rollback:',
  'would_create_folder',
  'would_move_folder',
  'would_move_file',
  'would_create_repo',
  'would_create_vercel_project',
  'would_create_workflow',
  'would_create_agent',
  'would_create_ai_gateway',
  'rollback_plan',
  'not_implemented',
  'mode !== "execute"',
  'folderManifestRecords',
  'executeApprovedFolderManifest'
]) {
  assert(executionSource.includes(marker), `Execution contract missing marker: ${marker}`);
}

for (const marker of [
  'approved_write',
  'folder_manifest',
  'create_missing_folders',
  'await runDriveJobTool'
]) {
  assert(routeSource.includes(marker), `Primary MCP route missing governed Drive marker: ${marker}`);
  assert(minimalRouteSource.includes(marker), `Minimal MCP route missing governed Drive marker: ${marker}`);
}

for (const metadataSource of [toolsRouteSource, manifestSource]) {
  assert(metadataSource.includes('expectedCallableMcpToolNames'), 'MCP metadata route does not use expectedCallableMcpToolNames.');
  assert(metadataSource.includes('activeOperatingMap'), 'MCP metadata route does not expose activeOperatingMap.');
}

assertSourceAdvertisesRelativeEndpoint(manifestSource, 'src/app/api/mcp/manifest/route.ts', '/api/mcp');
assertSourceAdvertisesRelativeEndpoint(manifestSource, 'src/app/api/mcp/manifest/route.ts', '/api/mcp/tools');
assertSourceAdvertisesRelativeEndpoint(manifestSource, 'src/app/api/mcp/manifest/route.ts', '/.well-known/ai-plugin.json');
assert(manifestSource.includes("openapiAdvertised: false"), 'MCP manifest must explicitly mark OpenAPI as not advertised.');
assert(manifestSource.includes("authoritative: 'mcp'"), 'MCP manifest must mark MCP as authoritative discovery.');

assert(pluginSource.includes("api: {"), 'Plugin route must include an api field.');
assert(pluginSource.includes("type: 'none'"), 'Plugin route must disable OpenAPI fallback when no OpenAPI endpoint exists.');
assert(pluginSource.includes('requestBaseUrl'), 'Plugin route must build URLs from the incoming request host.');
assert(pluginSource.includes('/api/mcp'), 'Plugin route must advertise the MCP endpoint.');
assert(pluginSource.includes('/api/mcp/manifest'), 'Plugin route must advertise the MCP manifest endpoint.');
assert(pluginSource.includes('/api/mcp/tools'), 'Plugin route must advertise the MCP tools endpoint.');
assert(!pluginSource.includes('/docs/auto-builder-2-gpt-actions.openapi.yaml'), 'Plugin route advertises removed OpenAPI endpoint.');
assert(!pluginSource.includes('const productionBaseUrl'), 'Plugin route must not hardcode production base URL.');

const metadataToolCountMarkers = [
  'tools: expectedCallableMcpToolNames',
  'executionTools: autoBuilder2ExecutionToolNames'
];
for (const marker of metadataToolCountMarkers) {
  assert(manifestSource.includes(marker), `Manifest route missing parity marker: ${marker}`);
  assert(toolsRouteSource.includes(marker), `Tools route missing parity marker: ${marker}`);
}

assert(runJobRouteSource.includes('runJob'), 'Static /api/bridge/run-job route is not wired to runJob.');
assert(runUniversalJobRouteSource.includes('runUniversalJob'), 'Static /api/bridge/run-universal-job route is not wired to runUniversalJob.');
assert(rollbackRouteSource.includes('rollbackTool'), 'Static /api/bridge/rollback route is not wired to rollbackTool.');

for (const routeSource of [runJobRouteSource, runUniversalJobRouteSource, rollbackRouteSource]) {
  assert(routeSource.includes('requiresOperatorAuth'), 'Static bridge route missing execute/rollback auth guard.');
  assert(routeSource.includes('verifyExecutionRouteAuth'), 'Static bridge route missing bearer auth verification.');
}

for (const marker of [
  'drive/run-drive-job',
  'drive/list-tree',
  'drive/create-folder',
  'drive/move-folder',
  'drive/move-file',
  'drive/write-receipt',
  'platform/run-platform-provisioning-job',
  'github/create-repo',
  'vercel/create-project',
  'vercel/create-workflow',
  'vercel/create-agent',
  'ai-gateway/create',
  'requiresOperatorAuth',
  'verifyExecutionRouteAuth'
]) {
  assert(bridgeExecutionRouteSource.includes(marker), `Two-segment bridge route missing marker: ${marker}`);
}

for (const envName of requiredEnvNames) {
  assert(executionSource.includes(`"${envName}"`), `Required env name missing from execution contract: ${envName}`);
  const envValue = process.env[envName];
  if (envValue && envValue.length >= 8) {
    for (const [path, source] of [
      ...mcpRouteSources,
      ['src/lib/autobuilder-v2/execution-tools.ts', executionSource],
      ['src/app/api/mcp/tools/route.ts', toolsRouteSource],
      ['src/app/api/mcp/manifest/route.ts', manifestSource],
      ['src/app/.well-known/ai-plugin.json/route.ts', pluginSource],
      ['src/app/api/bridge/run-job/route.ts', runJobRouteSource],
      ['src/app/api/bridge/run-universal-job/route.ts', runUniversalJobRouteSource],
      ['src/app/api/bridge/rollback/route.ts', rollbackRouteSource],
      ['src/app/api/bridge/[bridge]/[action]/route.ts', bridgeExecutionRouteSource]
    ]) {
      assert(!source.includes(envValue), `Secret value for ${envName} appears in ${path}.`);
    }
  }
}

for (const forbidden of ['Strategic-Minds/SANDBOX"', 'Strategic-Minds/FRONTEND"']) {
  const activeMapStart = executionSource.indexOf('export const activeOperatingMap');
  const activeMapEnd = executionSource.indexOf('} as const;', activeMapStart);
  const activeMapSource = activeMapStart >= 0 && activeMapEnd > activeMapStart ? executionSource.slice(activeMapStart, activeMapEnd) : '';
  assert(!activeMapSource.includes(forbidden), `Active operating map includes forbidden repo: ${forbidden}`);
}

console.log(`MCP tool validation passed: ${expectedCallableTools.length} required callable tools are registered across ${mcpRouteSources.length} MCP routes with MCP-authoritative discovery, plugin/manifest/tools parity, dry-run, receipt, rollback, governed Drive, and secret-safety markers.`);

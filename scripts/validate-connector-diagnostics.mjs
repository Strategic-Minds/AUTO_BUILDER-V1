import { readFileSync } from 'node:fs';

const routePaths = [
  'src/app/api/mcp/route.ts',
  'src/app/api/mcp-minimal/[transport]/route.ts'
];

const requiredMarkers = [
  'connector_schema_version',
  'strict-20-2026-06-10',
  'expected_tool_count',
  'production_mcp_url',
  'production_manifest_url',
  'production_tools_url',
  'stale_schema_instructions',
  'server_truth',
  'no_write_fix_rule'
];

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

for (const path of routePaths) {
  const source = readFileSync(path, 'utf8');
  for (const marker of requiredMarkers) {
    assert(source.includes(marker), `${path} missing stale connector diagnostic marker: ${marker}`);
  }
  assert(source.includes('health_check'), `${path} missing health_check surface.`);
  assert(source.includes('read_bootstrap_status'), `${path} missing read_bootstrap_status surface.`);
}

console.log(`Connector diagnostic validation passed for ${routePaths.length} MCP routes.`);

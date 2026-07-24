import { readFileSync } from 'node:fs';

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

const server = readFileSync('src/lib/mcp/server.ts', 'utf8');
const route = readFileSync('src/app/api/mcp/route.ts', 'utf8');
const discovery = readFileSync('.well-known/mcp.json', 'utf8');
const dynamicDiscovery = readFileSync('src/app/api/mcp/well-known/route.ts', 'utf8');
const manifest = readFileSync('src/app/api/mcp/manifest/route.ts', 'utf8');

assert(server.includes("MCP_VERSION = '2024-11-05'"), 'Compatibility default is not 2024-11-05.');
assert(server.includes('SUPPORTED_MCP_VERSIONS'), 'Supported MCP protocol versions are not declared.');
assert(server.includes('negotiateMcpVersion'), 'Protocol negotiation helper is missing.');
assert(route.includes('negotiateMcpVersion(params.protocolVersion)'), 'Initialize does not negotiate the requested protocol.');
assert(route.includes('MCP-Protocol-Version'), 'CORS does not allow MCP-Protocol-Version.');
assert(!route.includes('2025-11-05'), 'Primary route still advertises unsupported 2025-11-05.');
assert(!discovery.includes('2025-11-05'), 'Static discovery still advertises unsupported 2025-11-05.');
assert(!dynamicDiscovery.includes('2025-11-05'), 'Dynamic discovery still advertises unsupported 2025-11-05.');
assert(discovery.includes('"mcp_endpoint": "/api/mcp"'), 'Static discovery does not point to the compatible endpoint.');
assert(discovery.includes('"transport": "streamable-http"'), 'Static discovery transport is inconsistent.');
assert(manifest.includes("endpoint: '/api/mcp'"), 'Manifest does not point to the compatible endpoint.');

console.log('MCP protocol compatibility validation passed.');

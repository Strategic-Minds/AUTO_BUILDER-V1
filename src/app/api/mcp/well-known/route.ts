import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Serves /.well-known/mcp.json via rewrite in vercel.json
// Allows ChatGPT Business to auto-discover this MCP gateway
export async function GET() {
  return NextResponse.json({
    schema_version: '1.0',
    name: 'REALITY OS MCP Gateway',
    description: 'Strategic Minds AUTO BUILDER — persistent MCP bridge for Base44 and ChatGPT Business',
    mcp_endpoint: 'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp',
    manifest_url: 'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/manifest',
    transport: 'streamable-http',
    protocol_version: '2024-11-05',
    operator: 'Strategic Minds / Jeremy Bensen',
    app_id: '6a4ae522852a5e08bfa42450',
    governance: 'preview_first',
    docs: 'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/manifest',
    tools_count: 36,
    domains: ['system', 'base44', 'github', 'workflow', 'intel']
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

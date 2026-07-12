import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      schema_version: '2025-11-25',
      name: 'Strategic Minds Enterprise MCP',
      description:
        'Governed autonomous MCP gateway for Strategic Minds / XPS. Base44 + ChatGPT bidirectional bridge.',
      mcp_endpoint:
        'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp',
      transport: 'streamable-http',
      auth: {
        type: 'bearer',
        header: 'Authorization',
        note: 'Provide AUTO_BUILDER_BRIDGE_TOKEN as Bearer token',
      },
      capabilities: {
        tools: { listChanged: true },
        resources: { listChanged: false },
        prompts: { listChanged: false },
        logging: {},
      },
      governance: {
        default_mode: 'APPROVAL_REQUIRED',
        deny_by_default: true,
        every_action_receipted: true,
        operator: 'Jeremy Bensen / Strategic Minds',
      },
      discovery: {
        tools_url:
          'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/tools',
        manifest_url:
          'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/manifest',
        gateway_url:
          'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/gateway',
      },
      base44_bridge: {
        app_id: '6a4ae522852a5e08bfa42450',
        app_name: 'AUTO BUILDER ORCHESTRATOR',
        note: 'Identify by exact app ID only — duplicate display name exists',
      },
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
}

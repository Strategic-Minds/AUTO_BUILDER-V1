import { NextResponse } from 'next/server';

const productionBaseUrl = 'https://auto-builder-strategic-minds-advisory.vercel.app';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    schema_version: 'v1',
    name_for_human: 'AUTO BUILDER 2',
    name_for_model: 'auto_builder_2',
    description_for_human: 'Governed Auto Builder 2 orchestration system for Strategic Minds Advisory.',
    description_for_model:
      'Use AUTO BUILDER 2 to inspect stack status, list MCP tools, and operate governed dry-run-first execution tools. Live mutations require explicit execute mode and provider approval gates.',
    auth: {
      type: 'none'
    },
    api: {
      type: 'openapi',
      url: `${productionBaseUrl}/docs/auto-builder-2-gpt-actions.openapi.yaml`
    },
    logo_url: `${productionBaseUrl}/favicon.ico`,
    contact_email: 'strategicmindsadvisory@gmail.com',
    legal_info_url: `${productionBaseUrl}/api/mcp/manifest`,
    mcp: {
      transport: 'streamable-http',
      url: `${productionBaseUrl}/api/mcp`,
      manifest_url: `${productionBaseUrl}/api/mcp/manifest`,
      tools_url: `${productionBaseUrl}/api/mcp/tools`
    }
  });
}

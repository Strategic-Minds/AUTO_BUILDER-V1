import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function requestBaseUrl(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : 'https://auto-builder-strategic-minds-advisory.vercel.app';
}

export async function GET(request: NextRequest) {
  const baseUrl = requestBaseUrl(request);

  return NextResponse.json({
    schema_version: 'v1',
    name_for_human: 'AUTO BUILDER 2',
    name_for_model: 'auto_builder_2',
    description_for_human: 'Governed Auto Builder 2 orchestration system for Strategic Minds Advisory.',
    description_for_model:
      'Use AUTO BUILDER 2 to inspect stack status, list MCP tools, and operate governed dry-run-first execution tools. Live mutations require explicit execute mode and provider approval gates. MCP discovery is authoritative.',
    auth: {
      type: 'none'
    },
    api: {
      type: 'openapi',
      url: `${baseUrl}/api/mcp/manifest`,
      is_user_authenticated: false
    },
    logo_url: `${baseUrl}/favicon.ico`,
    contact_email: 'strategicmindsadvisory@gmail.com',
    legal_info_url: `${baseUrl}/api/mcp/manifest`,
    mcp: {
      transport: 'streamable-http',
      url: `${baseUrl}/api/mcp`,
      manifest_url: `${baseUrl}/api/mcp/manifest`,
      tools_url: `${baseUrl}/api/mcp/tools`,
      authoritative: true,
      openapi_fallback: false
    }
  });
}

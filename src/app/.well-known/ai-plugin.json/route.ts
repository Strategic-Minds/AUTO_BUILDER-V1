import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    schema_version: 'v1',
    name_for_human: 'AUTO BUILDER',
    name_for_model: 'auto_builder',
    description_for_human: 'Governed recursive orchestration system for Strategic Minds Advisory.',
    description_for_model:
      'Use AUTO BUILDER to inspect stack status and verify governed action registration. Preserve governance locks and recursive continuation rules.',
    auth: {
      type: 'none',
    },
    api: {
      type: 'openapi',
      url: 'https://auto-builder-livid.vercel.app/.well-known/openapi.yaml',
    },
    logo_url: 'https://auto-builder-livid.vercel.app/favicon.ico',
    contact_email: 'strategicmindsadvisory@gmail.com',
    legal_info_url: 'https://auto-builder-livid.vercel.app/api/mcp/manifest',
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { ALL_TOOLS } from '@/lib/mcp/tools';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  const tools = domain ? ALL_TOOLS.filter(t => t.name.startsWith(domain + '.')) : ALL_TOOLS;
  return NextResponse.json({
    total: tools.length,
    tools: tools.map(t => ({
      name: t.name,
      description: t.description,
      scope: t.scope,
      risk: t.risk,
      requires_approval: t.requiresApproval,
      receipt_behavior: t.receiptBehavior
    }))
  }, { headers: { 'Access-Control-Allow-Origin': '*' } });
}

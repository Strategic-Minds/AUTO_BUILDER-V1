import { NextResponse } from 'next/server';

const MCP = 'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp-extended';

export async function GET() {
  const ts = new Date().toISOString();
  try {
    const r = await fetch(MCP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'social_intelligence_sweep', arguments: { platforms: ['instagram','youtube','tiktok','reddit'], keywords: ['epoxy floor','polished concrete','garage floor coating'], triggered_by: 'vercel_cron' } } }) });
    const d = await r.json();
    return NextResponse.json({ ok: true, ts, result: d?.result?.content?.[0]?.text || 'dispatched', source: 'vercel_cron' });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) });
  }
}

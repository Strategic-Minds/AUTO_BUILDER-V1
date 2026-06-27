import { NextResponse } from 'next/server';
import { callMcpTool, requireApexCron } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const blocked = requireApexCron(request, 'apex-social-sweep');
  if (blocked) return blocked;

  const ts = new Date().toISOString();
  const sweep = await callMcpTool(request, 'social_intelligence_sweep', {
    platforms: ['instagram', 'youtube', 'tiktok', 'reddit'],
    keywords: ['epoxy floor', 'polished concrete', 'garage floor coating'],
    triggered_by: 'vercel_cron',
  });

  return NextResponse.json({
    ok: sweep.ok,
    ts,
    sweep,
    source: 'vercel_cron',
  });
}

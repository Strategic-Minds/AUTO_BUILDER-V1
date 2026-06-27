import { NextResponse } from 'next/server';
import { callMcpTool, requireApexCron } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const blocked = requireApexCron(request, 'apex-seo-sweep');
  if (blocked) return blocked;

  const ts = new Date().toISOString();
  const sweep = await callMcpTool(request, 'seo_intelligence_sweep', {
    targets: ['phoenix-epoxy-pros-site.vercel.app', 'xpswebsites.vercel.app'],
    triggered_by: 'vercel_cron',
  });

  return NextResponse.json({
    ok: sweep.ok,
    ts,
    sweep,
    source: 'vercel_cron',
  });
}

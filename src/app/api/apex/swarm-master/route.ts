import { NextResponse } from 'next/server';
import { callMcpTool, requireApexCron, sendWhatsApp } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const blocked = requireApexCron(request, 'apex-swarm-master');
  if (blocked) return blocked;

  const ts = new Date().toISOString();
  const sweep = await callMcpTool(request, 'swarm_intelligence_sweep', {
    pack: 'master',
    priority: 'high',
    targets: 105,
    triggered_by: 'vercel_cron_sunday',
  });

  const alert = await sendWhatsApp(`SUNDAY MASTER SWARM - 105 targets dispatched - ${ts.split('T')[0]} - Intel ready in 30min`);

  return NextResponse.json({
    ok: sweep.ok && alert.ok,
    ts,
    targets: 105,
    sweep,
    alert,
    source: 'vercel_cron_sunday',
  });
}

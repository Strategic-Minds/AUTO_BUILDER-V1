import { NextResponse } from 'next/server';
import { callMcpTool, postSupabase, requireApexCron } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HIGH_PRIORITY_TARGETS = [
  'ameripolish.com',
  'husqvarna.com/us/construction',
  'diamondback-ep.com',
  'epoxy.com',
  'garagepros.com',
  'floortex.us',
  'garagemahal.com',
  'floorgraphix.com',
  'quality-epoxy.com',
  'strongholdfloors.com',
];

export async function GET(request: Request) {
  const blocked = requireApexCron(request, 'apex-swarm-nightly');
  if (blocked) return blocked;

  const ts = new Date().toISOString();
  const sweep = await callMcpTool(request, 'swarm_intelligence_sweep', {
    targets: HIGH_PRIORITY_TARGETS,
    pack: 'epoxy',
    priority: 'high',
    triggered_by: 'vercel_cron_nightly',
  });

  const memoryWrite = await postSupabase('agent_memory', {
    agent_id: 'DISCOVERY',
    memory_type: 'operational',
    key: `swarm_nightly_${ts}`,
    value: { ts, targets: HIGH_PRIORITY_TARGETS.length, result: sweep.result, ok: sweep.ok },
    importance: 7,
    tags: ['swarm', 'nightly', 'vercel_cron'],
  });

  return NextResponse.json({
    ok: sweep.ok && memoryWrite.ok,
    ts,
    targets: HIGH_PRIORITY_TARGETS.length,
    sweep,
    memoryWrite,
    source: 'vercel_cron',
  });
}

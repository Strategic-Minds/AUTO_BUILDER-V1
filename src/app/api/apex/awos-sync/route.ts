import { NextResponse } from 'next/server';
import { callMcpTool, postSupabase, requireApexCron } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const blocked = requireApexCron(request, 'apex-awos-sync');
  if (blocked) return blocked;

  const ts = new Date().toISOString();

  const memoryWrite = await postSupabase('agent_memory', {
    agent_id: 'APEX',
    memory_type: 'operational',
    key: 'base44_state',
    value: { ts, source: 'vercel_cron_sync', status: 'active', sites: 4, automations: 16 },
    importance: 7,
    tags: ['sync', 'vercel_cron'],
  });

  const receipt = await callMcpTool(request, 'post_bridge_receipt', {
    agent: 'APEX',
    ts,
    source: 'vercel_awos_sync',
  });

  return NextResponse.json({
    ok: memoryWrite.ok && receipt.ok,
    ts,
    memoryWrite,
    receipt,
    source: 'vercel_cron',
  });
}

import { NextResponse } from 'next/server';
import { getSupabase, postSupabase, requireApexCron } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const blocked = requireApexCron(request, 'apex-council-sync');
  if (blocked) return blocked;

  const ts = new Date().toISOString();
  const entries = await getSupabase('agent_memory?tags=cs.{council}&order=created_at.desc&limit=20');
  const entryCount = Array.isArray(entries.data) ? entries.data.length : 0;

  const summaryWrite = await postSupabase('agent_memory', {
    agent_id: 'APEX',
    memory_type: 'operational',
    key: `council_summary_${Date.now()}`,
    value: { ts, entries_processed: entryCount, source: 'vercel_cron' },
    importance: 6,
    tags: ['council', 'summary', 'vercel_cron'],
  });

  return NextResponse.json({
    ok: entries.ok && summaryWrite.ok,
    ts,
    entries: entryCount,
    read: { ok: entries.ok, status: entries.status },
    summaryWrite,
    source: 'vercel_cron',
  });
}

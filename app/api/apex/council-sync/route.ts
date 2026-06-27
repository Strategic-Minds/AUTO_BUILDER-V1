import { NextResponse } from 'next/server';

const SUPA_URL = 'https://prhppuuwcnmfdhwsagug.supabase.co';
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET() {
  if (!SUPA_KEY) return NextResponse.json({ ok: false, error: 'no key' });

  // Read recent council entries
  const r = await fetch(`${SUPA_URL}/rest/v1/agent_memory?tags=cs.{council}&order=created_at.desc&limit=20`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  const entries = await r.json();

  // Write summary
  await fetch(`${SUPA_URL}/rest/v1/agent_memory`, {
    method: 'POST',
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({
      agent_id: 'APEX',
      key: `council_summary_${Date.now()}`,
      value: JSON.stringify({ ts: new Date().toISOString(), entries_processed: entries?.length || 0, source: 'vercel_cron' }),
      importance: 6,
      tags: ['council', 'summary', 'vercel_cron'],
    }),
  });

  return NextResponse.json({ ok: true, entries: entries?.length || 0, source: 'vercel_cron' });
}

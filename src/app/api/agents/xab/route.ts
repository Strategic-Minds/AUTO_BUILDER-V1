import { NextResponse } from 'next/server';

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const hdrs = { apikey: KEY, Authorization: `Bearer ${KEY}` };

export async function GET() {
  try {
    const r = await fetch(`${SB}/rest/v1/xab_agents?select=*&order=created_at.asc`, { headers: hdrs });
    const agents = await r.json();
    return NextResponse.json({ agents, count: agents.length });
  } catch (e) {
    return NextResponse.json({ agents: [], error: String(e) });
  }
}


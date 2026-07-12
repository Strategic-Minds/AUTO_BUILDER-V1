import { NextResponse } from 'next/server';

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const hdrs = { apikey: KEY, Authorization: `Bearer ${KEY}` };

export async function GET() {
  try {
    const r = await fetch(`${SB}/rest/v1/xab_connectors?select=*&order=created_at.asc`, { headers: hdrs });
    const connectors = await r.json();
    return NextResponse.json({ connectors, count: connectors.length });
  } catch (e) {
    return NextResponse.json({ connectors: [], error: String(e) });
  }
}


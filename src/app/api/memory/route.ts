import { NextRequest, NextResponse } from 'next/server';

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const hdrs = { apikey: KEY, Authorization: `Bearer ${KEY}` };

export async function GET(req: NextRequest) {
  const agent_id = req.nextUrl.searchParams.get('agent_id') || '';
  const type = req.nextUrl.searchParams.get('type') || 'all';
  try {
    const results: Record<string,unknown[]> = {};
    if (type === 'all' || type === 'semantic') {
      const q = agent_id ? `?agent_id=eq.${agent_id}&order=created_at.desc&limit=50` : `?order=created_at.desc&limit=50`;
      const r = await fetch(`${SB}/rest/v1/memory_semantic${q}`, { headers: hdrs });
      results.semantic = await r.json();
    }
    if (type === 'all' || type === 'episodic') {
      const q = agent_id ? `?agent_id=eq.${agent_id}&order=created_at.desc&limit=20` : `?order=created_at.desc&limit=20`;
      const r = await fetch(`${SB}/rest/v1/memory_episodic${q}`, { headers: hdrs });
      results.episodic = await r.json();
    }
    return NextResponse.json({ memory: results, agent_id });
  } catch (e) {
    return NextResponse.json({ memory: {}, error: String(e) });
  }
}


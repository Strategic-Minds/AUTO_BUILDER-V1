import { NextResponse } from 'next/server';

const PROD = 'https://www.autobuilderos.com';
const SB = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const hdrs = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const CHECKS = [
  { name: 'Homepage', url: '/', critical: true },
  { name: 'MCP endpoint', url: '/api/mcp-minimal/mcp', critical: true },
  { name: 'Agents route', url: '/api/agents/xab', critical: true },
  { name: 'Connectors route', url: '/api/connectors', critical: true },
  { name: 'Auto-heal', url: '/api/adapters/auto-heal' },
  { name: 'Quality scan', url: '/api/adapters/quality-scan' },
  { name: 'Auto-fix', url: '/api/adapters/auto-fix' },
];

export const dynamic = 'force-dynamic';

export async function GET() {
  const results = await Promise.all(CHECKS.map(async (c) => {
    try {
      const r = await fetch(`${PROD}${c.url}`, { signal: AbortSignal.timeout(8000) });
      return { ...c, status: r.status, pass: r.status < 400 };
    } catch {
      return { ...c, status: 0, pass: false };
    }
  }));

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const critFailed = results.filter(r => !r.pass && r.critical).length;
  let score = Math.round((passed / results.length) * 100);
  if (critFailed > 0) score = Math.min(score, 59);

  // Get last QA run
  let lastRun = null;
  try {
    const qr = await fetch(`${SB}/rest/v1/qa_validation_runs?select=*&order=started_at.desc&limit=1`, { headers: hdrs });
    const runs = await qr.json();
    lastRun = runs[0] || null;
  } catch {}

  return NextResponse.json({ score, passed, failed, critical_failures: critFailed, checks: results, last_full_run: lastRun });
}


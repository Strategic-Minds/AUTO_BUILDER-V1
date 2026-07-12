import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PROD = 'https://www.autobuilderos.com';
const SB = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const hdrs = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' };

function isQuietHours() {
  const h = parseInt(new Date().toLocaleString('en-US',{timeZone:'America/New_York',hour:'numeric',hour12:false}));
  return h >= 2 && h < 4;
}

async function check(url: string, critical = false, timeout = 10000) {
  const start = Date.now();
  if (isQuietHours() && !critical) return { url, status: 'SKIP', ms: 0, critical };
  try {
    const r = await fetch(`${PROD}${url}`, { signal: AbortSignal.timeout(timeout) });
    const ms = Date.now() - start;
    const pass = r.status < 500;
    return { url, status: pass ? 'PASS' : 'FAIL', http: r.status, ms, critical };
  } catch (e: unknown) {
    return { url, status: 'FAIL', http: 0, ms: Date.now()-start, err: e instanceof Error ? e.message : 'timeout', critical };
  }
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) return NextResponse.json({error:'unauthorized'},{status:401});

  const start = Date.now();
  const runId = `QA-${Date.now()}`;

  const tests = await Promise.all([
    // CRITICAL
    check('/', true, 15000),
    check('/api/agents/xab', true),
    check('/api/connectors', true),
    check('/api/validation', true),
    check('/api/agents/message', false),
    check('/api/canvas/generate', false),
    check('/api/memory', false),
    // HIGH
    check('/api/adapters/auto-heal'),
    check('/api/adapters/quality-scan'),
    check('/api/adapters/auto-fix'),
    check('/api/whatsapp/status'),
    check('/api/mcp-minimal/mcp'),
  ]);

  const passed = tests.filter(t => t.status === 'PASS').length;
  const failed = tests.filter(t => t.status === 'FAIL').length;
  const critFailed = tests.filter(t => t.status === 'FAIL' && t.critical).length;
  const total = tests.filter(t => t.status !== 'SKIP').length;
  let score = total > 0 ? Math.round((passed / total) * 100) : 0;
  let cap: number | undefined;
  if (critFailed > 0) { cap = 59; score = Math.min(score, 59); }

  const ms = Date.now() - start;

  // Save run
  await fetch(`${SB}/rest/v1/qa_validation_runs`, {
    method: 'POST', headers: hdrs,
    body: JSON.stringify({ run_id: runId, run_type: 'smoke', triggered_by: 'cron', overall_score: score, total_tests: tests.length, passed, failed, skipped: tests.filter(t=>t.status==='SKIP').length, critical_failures: critFailed, hard_score_cap: cap, test_results: tests, duration_ms: ms, completed_at: new Date().toISOString() })
  }).catch(() => null);

  // Auto-heal on failures
  if (failed > 0) {
    await fetch(`${PROD}/api/adapters/auto-heal`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({source:'qa-agent',score,failed}) }).catch(() => null);
  }

  return NextResponse.json({
    run_id: runId, score: `${score}/100`, cap, passed, failed, critical_failures: critFailed,
    duration_ms: ms, quiet_hours: isQuietHours(),
    throttle: score >= 95 ? 'QUIET_3AM' : score >= 80 ? 'HOURLY' : 'EVERY_5MIN',
    tests: tests.map(t => ({ url: t.url, status: t.status, ms: t.ms }))
  });
}

export async function POST(req: NextRequest) { return GET(req); }


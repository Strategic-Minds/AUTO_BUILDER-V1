import { NextRequest, NextResponse } from 'next/server'
import { authorizeCronRequest } from '@/lib/cron-auth'

// Intelligence ingest: rolls up intelligence/competitor/template signals.
// Safe dry-run only; no external writes performed here.
export async function GET(req: NextRequest) {
  const authorization = authorizeCronRequest(req)
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.reason, authorization }, { status: authorization.status })
  }

  const mode = process.env.AUTO_BUILDER_MODE || 'dry_run'
  return NextResponse.json({
    ok: true,
    mode,
    route: '/api/cron/intelligence-ingest',
    action: 'intelligence_rollup_ingest',
    production_mutation: false,
    authorization,
  })
}

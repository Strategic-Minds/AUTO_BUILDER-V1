import { NextRequest, NextResponse } from 'next/server'
import { authorizeCronRequest } from '@/lib/cron-auth'

// Enterprise kernel heartbeat: registry/queue consistency check.
// Safe dry-run only; no production mutation performed here.
export async function GET(req: NextRequest) {
  const authorization = authorizeCronRequest(req)
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.reason, authorization }, { status: authorization.status })
  }

  const mode = process.env.AUTO_BUILDER_MODE || 'dry_run'
  return NextResponse.json({
    ok: true,
    mode,
    route: '/api/cron/enterprise-kernel',
    action: 'registry_consistency_heartbeat',
    production_mutation: false,
    authorization,
  })
}

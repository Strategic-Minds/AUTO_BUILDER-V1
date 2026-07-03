import { NextRequest, NextResponse } from 'next/server'
import { authorizeCronRequest } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authorization = authorizeCronRequest(req)
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.reason, authorization }, { status: authorization.status })
  }

  return NextResponse.json({
    ok: true,
    mode: process.env.AUTO_BUILDER_MODE || 'dry_run',
    action: 'auto_builder_5_minute_heartbeat',
    production_mutation: false,
    authorization,
    timestamp: new Date().toISOString()
  })
}

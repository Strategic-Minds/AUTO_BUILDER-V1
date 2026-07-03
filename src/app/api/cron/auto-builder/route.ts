import { NextRequest, NextResponse } from 'next/server'
import { authorizeCronRequest } from '@/lib/cron-auth'
import { runAutonomousPackageLoop } from '@/lib/auto-builder/autonomous-package-loop'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function shouldExecuteWorkers(req: NextRequest) {
  return req.nextUrl.searchParams.get('executeWorkers') === '1' || process.env.AUTO_BUILDER_AUTONOMOUS_WORKERS_ENABLED === '1'
}

export async function GET(req: NextRequest) {
  const authorization = authorizeCronRequest(req)
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.reason, authorization }, { status: authorization.status })
  }

  const result = await runAutonomousPackageLoop({
    cadence: 'heartbeat_5m',
    source: 'api/cron/auto-builder',
    executeWorkers: shouldExecuteWorkers(req),
  })

  return NextResponse.json({
    ok: result.ok,
    mode: process.env.AUTO_BUILDER_MODE || 'dry_run',
    action: 'auto_builder_5_minute_autonomous_package_loop',
    production_mutation: false,
    productionActionAllowed: result.productionActionAllowed,
    authorization,
    result,
    timestamp: new Date().toISOString(),
  })
}

export const POST = GET

import { NextRequest, NextResponse } from 'next/server'
import { authorizeCronRequest } from '@/lib/cron-auth'
import { runAutonomousPackageLoop } from '@/lib/auto-builder/autonomous-package-loop'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const authorization = authorizeCronRequest(req)
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.reason, authorization }, { status: authorization.status })
  }

  const result = await runAutonomousPackageLoop({
    cadence: 'reconcile_15m',
    source: 'api/cron/auto-builder-reconcile',
    executeWorkers: req.nextUrl.searchParams.get('executeWorkers') === '1',
  })

  return NextResponse.json({
    ok: result.ok,
    action: 'auto_builder_15_minute_registry_reconcile',
    production_mutation: false,
    productionActionAllowed: result.productionActionAllowed,
    authorization,
    result,
    timestamp: new Date().toISOString(),
  })
}

export const POST = GET

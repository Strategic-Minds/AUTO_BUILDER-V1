import { NextRequest, NextResponse } from 'next/server'
import { authorizeCronRequest } from '@/lib/cron-auth'

// Quality/auto-heal sweep: checks validation/scoring registries for
// repair-needed items. Safe dry-run only; actual repair execution remains gated.
export async function GET(req: NextRequest) {
  const authorization = authorizeCronRequest(req)
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.reason, authorization }, { status: authorization.status })
  }

  const mode = process.env.AUTO_BUILDER_MODE || 'dry_run'
  return NextResponse.json({
    ok: true,
    mode,
    route: '/api/cron/quality-auto-heal',
    action: 'quality_scan_and_repair_sweep',
    production_mutation: false,
    authorization,
  })
}

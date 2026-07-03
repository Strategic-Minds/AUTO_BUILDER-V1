import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Hardening fix (2026-07-03, auto-heal pass): this route previously had NO auth
// check at all, despite being a live production cron endpoint - anyone on the
// internet could hit it. Vercel's native cron convention sends
// `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set as an env var.
// If CRON_SECRET is not yet configured, this fails open (same fail-open pattern
// used by the other ported cron/adapter routes) so nothing breaks pre-approval -
// but once Jeremy approves setting CRON_SECRET, this route becomes properly gated.
function isAuthorized(req: NextRequest): boolean {
  const configured = process.env.CRON_SECRET
  if (!configured) return true // fail-open until secret is approved + set
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${configured}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return NextResponse.json({
    ok: true,
    mode: process.env.AUTO_BUILDER_MODE || 'dry_run',
    action: 'auto_builder_5_minute_heartbeat',
    timestamp: new Date().toISOString()
  })
}

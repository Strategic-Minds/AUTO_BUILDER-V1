import { NextRequest, NextResponse } from 'next/server'
import { authorizeCronRequest } from '@/lib/cron-auth'
import { run } from '@/workers/adapters/quality-scan'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ adapter: 'quality-scan', ready: true, production_mutation: false })
}

export async function POST(req: NextRequest) {
  const authorization = authorizeCronRequest(req)
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.reason, authorization }, { status: authorization.status })
  }

  const result = await run()
  const statusCode = result.status === 'error' ? 500 : 200
  return NextResponse.json({ ...result, authorization }, { status: statusCode })
}

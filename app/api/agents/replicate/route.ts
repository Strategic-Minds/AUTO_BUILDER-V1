import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}))
  return NextResponse.json({
    ok: true,
    mode: 'dry-run-agent-replication',
    received: payload,
    output: {
      template_required: true,
      approval_required: true,
      live_provisioning: false
    }
  })
}

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}))
  return NextResponse.json({
    ok: true,
    mode: 'dry-run-agent-message',
    received: payload,
    note: 'Queue message in Supabase agent_messages after approval and credentials.'
  })
}

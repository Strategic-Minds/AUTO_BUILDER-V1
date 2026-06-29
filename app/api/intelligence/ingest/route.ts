import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}))
  return NextResponse.json({
    ok: true,
    mode: 'dry-run-ingestion',
    received: payload,
    required_destinations: [
      '07_Intelligence/universal-business',
      '07_Intelligence/epoxy-decorative-concrete-polished-concrete'
    ],
    note: 'Persist to Supabase and Drive only after approval and configured credentials.'
  })
}

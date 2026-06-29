import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const startedAt = new Date().toISOString()
  const userAgent = request.headers.get('user-agent')
  const schedule = request.headers.get('x-vercel-cron-schedule')

  return NextResponse.json({
    ok: true,
    mode: 'validator-heartbeat',
    startedAt,
    userAgent,
    schedule,
    actions: [
      'read queued swarm_tasks',
      'read queued ingestion_runs',
      'write heartbeat receipt',
      'do not perform production actions without approval'
    ]
  })
}

import { NextResponse } from 'next/server';
import { getVercelRedeployReadiness, planVercelRedeploy } from '@/runtime/vercel/redeploy-adapter';

export async function GET() {
  const readiness = getVercelRedeployReadiness();
  return NextResponse.json({
    ok: readiness.ok,
    runtime: 'vercel_redeploy_adapter',
    mode: 'dry_run',
    route: '/api/runtime/vercel',
    readiness,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await planVercelRedeploy({
    projectId: String(body.projectId ?? process.env.VERCEL_PROJECT_ID ?? ''),
    teamId: body.teamId ?? process.env.VERCEL_TEAM_ID,
    target: body.target === 'production' ? 'production' : 'preview',
    approvalPhrase: body.approvalPhrase,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 202 });
}

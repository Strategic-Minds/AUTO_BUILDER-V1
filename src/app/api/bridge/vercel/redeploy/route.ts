import { NextRequest, NextResponse } from 'next/server';
import {
  getVercelRedeployReadiness,
  triggerVercelRedeploy,
  type VercelRedeployRequest
} from '@/lib/bridges/vercelRedeployBridge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    name: 'Auto Builder Vercel Redeploy Bridge',
    mode: 'governed_redeploy_executor',
    productionDeploysDefaultBlocked: true,
    readiness: getVercelRedeployReadiness(),
    requestShape: {
      targetSystem: 'auto_builder or eden_skye_studios',
      mode: 'preview by default; production requires explicit approval phrase',
      ref: 'main',
      approvedProductionDeploy: false,
      approvalPhrase: 'APPROVE PRODUCTION DEPLOY only when production is explicitly approved'
    }
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as VercelRedeployRequest;
  const result = await triggerVercelRedeploy(body);
  const status = result.blocked ? 423 : result.ok ? 200 : result.status || 500;
  return NextResponse.json(result, { status });
}

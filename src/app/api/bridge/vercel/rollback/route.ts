import { NextRequest, NextResponse } from 'next/server';
import { requiresOperatorAuth, verifyExecutionRouteAuth } from '@/lib/autobuilder-v2/execution-route-auth';
import {
  getVercelDeploymentStatus,
  getVercelRollbackReadiness,
  triggerVercelRollback,
  type VercelRollbackRequest
} from '@/lib/bridges/vercelRedeployBridge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function rollbackRequiresAuth(input: VercelRollbackRequest & Record<string, unknown>) {
  return (
    input.operationMode === 'rollback' ||
    input.execute === true ||
    input.mode === 'production' ||
    requiresOperatorAuth(input)
  );
}

export async function GET(request: NextRequest) {
  const deploymentId = request.nextUrl.searchParams.get('deploymentId') || request.nextUrl.searchParams.get('id');
  if (deploymentId) {
    const auth = verifyExecutionRouteAuth(request);
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });

    const result = await getVercelDeploymentStatus(deploymentId);
    return NextResponse.json(result, { status: result.ok ? 200 : result.status || 500 });
  }

  return NextResponse.json({
    name: 'Auto Builder Vercel Rollback Bridge',
    mode: 'governed_rollback_executor',
    productionRollbacksDefaultBlocked: true,
    readiness: getVercelRollbackReadiness(),
    requestShape: {
      targetSystem: 'auto_builder or eden_skye_studios',
      mode: 'preview by default; production requires explicit approval phrase',
      operationMode: 'dry_run by default; rollback submits a new Vercel deployment from rollbackRef/rollbackSha',
      rollbackRef: 'main',
      rollbackSha: 'optional known-good commit sha',
      sourceDeploymentId: 'optional deployment being rolled back from',
      approvedProductionDeploy: false,
      approvalPhrase: 'APPROVE PRODUCTION DEPLOY only when production rollback is explicitly approved'
    },
    statusShape: {
      route: '/api/bridge/vercel/rollback?deploymentId=dpl_...',
      authRequired: true,
      provider: 'vercel',
      readyState: 'READY is required before rollback evidence can pass'
    }
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as VercelRollbackRequest & Record<string, unknown>;
  if (rollbackRequiresAuth(body)) {
    const auth = verifyExecutionRouteAuth(request);
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const result = await triggerVercelRollback(body);
  const status = result.blocked ? 423 : result.ok ? 200 : result.status || 500;
  return NextResponse.json(result, { status });
}

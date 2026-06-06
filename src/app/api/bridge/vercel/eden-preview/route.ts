import { NextRequest, NextResponse } from 'next/server';
import {
  createEdenPreviewDeployment,
  getEdenPreviewBridgeReadiness,
  type EdenPreviewBridgeRequest
} from '@/lib/bridges/edenVercelPreviewBridge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    name: 'Auto Builder Eden Vercel Preview Bridge',
    mode: 'preview_only',
    productionDeploysAllowed: false,
    readiness: getEdenPreviewBridgeReadiness(),
    requestShape: {
      ref: 'main',
      projectId: 'optional override; defaults to EDEN_SKYE_VERCEL_PROJECT_ID',
      repoId: 'optional override; defaults to Eden GitHub repo id',
      target: 'preview',
      routesToCheck: ['/', '/login', '/payment', '/closet', '/api/readiness', '/api/bridge/stack-readiness']
    }
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as EdenPreviewBridgeRequest;
  const result = await createEdenPreviewDeployment({
    ...body,
    target: body.target ?? 'preview'
  });

  const status = result.blocked ? 423 : result.ok ? 200 : result.status || 500;
  return NextResponse.json(result, { status });
}

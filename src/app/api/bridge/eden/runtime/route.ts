import { NextRequest, NextResponse } from 'next/server';
import {
  getEdenUniversalRuntimeReadiness,
  handleEdenUniversalRuntimeBridge,
  type EdenRuntimeBridgeRequest
} from '@/lib/bridges/edenUniversalRuntimeBridge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type BridgeResult = Awaited<ReturnType<typeof handleEdenUniversalRuntimeBridge>>;

function responseStatus(result: BridgeResult) {
  if ('blocked' in result && result.blocked === true) return result.status || 423;
  if ('status' in result && typeof result.status === 'number') return result.ok === false ? result.status : result.status < 300 ? result.status : 200;
  return 200;
}

export async function GET() {
  return NextResponse.json(getEdenUniversalRuntimeReadiness());
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as EdenRuntimeBridgeRequest;
  const result = await handleEdenUniversalRuntimeBridge(body, request.headers.get('authorization'));
  return NextResponse.json(result, { status: responseStatus(result) });
}

import { NextResponse } from 'next/server';
import { browserWorkerHealth, captureBrowserEvidence } from '@/runtime/browser/playwright-worker';

export async function GET() {
  const health = await browserWorkerHealth();
  return NextResponse.json({
    ok: health.ok,
    runtime: 'browser_worker',
    mode: 'dry_run',
    workerUrlPath: '/api/runtime/browser',
    health,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await captureBrowserEvidence({
    url: String(body.url ?? ''),
    action: body.action ?? 'capture_evidence',
    waitForSelector: body.waitForSelector,
    timeoutMs: body.timeoutMs,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 202 });
}

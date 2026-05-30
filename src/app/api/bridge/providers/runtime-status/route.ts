import { NextResponse } from 'next/server';
import { getRuntimeProviderStatus } from '@/lib/providers/runtimeProviderStatus';
import { insertTelemetry } from '@/lib/telemetry-store';

export async function GET() {
  const status = getRuntimeProviderStatus();

  await insertTelemetry('bridge_evidence', {
    worker: 'provider-runtime-status',
    status: 'success',
    evidence: JSON.stringify(status),
    blocker: null,
    created_at: new Date().toISOString()
  });

  return NextResponse.json(status);
}

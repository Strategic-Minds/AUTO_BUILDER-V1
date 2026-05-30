import { NextRequest, NextResponse } from 'next/server';
import { authorizeCronRequest } from '@/lib/cron-auth';
import { runSocialBridgeOnce } from '@/lib/social/socialBridgeQueue';
import { getRuntimeProviderStatus } from '@/lib/providers/runtimeProviderStatus';
import { insertTelemetry } from '@/lib/telemetry-store';

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { message: typeof error === 'string' ? error : JSON.stringify(error) };
}

export async function GET(request: NextRequest) {
  const authorization = authorizeCronRequest(request);
  if (!authorization.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: authorization.reason,
        mode: authorization.mode,
        acceptedHeaderNames: authorization.acceptedHeaderNames
      },
      { status: authorization.status }
    );
  }

  const checkedAt = new Date().toISOString();
  const providerStatus = getRuntimeProviderStatus();

  try {
    const result = await runSocialBridgeOnce('eden-skye-social-bridge-cron');

    await insertTelemetry('bridge_evidence', {
      worker: 'eden-skye-social-bridge-cron',
      status: result.ok ? 'success' : 'blocked',
      evidence: JSON.stringify({ result, providerStatus }),
      blocker: result.ok ? null : String(result.error ?? result.reason ?? 'social bridge did not complete'),
      created_at: checkedAt
    });

    return NextResponse.json({
      ok: result.ok,
      route: '/api/cron/social-bridge',
      checkedAt,
      providerStatus,
      result,
      boundedLoop: true,
      processedJobs: result.task || result.job ? 1 : 0
    });
  } catch (error) {
    const details = serializeError(error);

    await insertTelemetry('bridge_blockers', {
      blocker: 'social_bridge_cron_failed',
      state: 'open',
      details,
      created_at: checkedAt
    });

    return NextResponse.json(
      {
        ok: false,
        route: '/api/cron/social-bridge',
        error: 'social_bridge_cron_failed',
        details,
        providerStatus
      },
      { status: 500 }
    );
  }
}

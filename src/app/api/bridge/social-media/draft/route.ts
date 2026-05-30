import { NextRequest, NextResponse } from 'next/server';
import { queueSocialBridgeJob } from '@/lib/social/socialBridgeQueue';
import { evaluateProviderAction } from '@/lib/providers/providerSafety';
import { insertTelemetry } from '@/lib/telemetry-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    brand_id?: string;
    network?: 'facebook' | 'instagram';
    content_type?: 'POST' | 'REEL' | 'STORY';
    caption?: string;
    first_comment?: string;
    media_urls?: string[];
    media_source?: string;
    scheduled_for?: string;
    target?: string;
    approved?: boolean;
  };

  const network = body.network ?? 'facebook';
  const caption = body.caption ?? '';
  const brandId = body.brand_id ?? '6316987';

  const safety = evaluateProviderAction({
    provider: 'metricool',
    action: 'social_media_draft',
    riskClass: 'safe_draft',
    approved: body.approved === true,
    payload: {
      brand_id: brandId,
      network,
      target: body.target ?? network,
      content_type: body.content_type ?? 'POST'
    },
    source: 'api.bridge.social-media.draft'
  });

  if (!safety.ok) {
    await insertTelemetry('bridge_blockers', {
      blocker: safety.reason,
      state: 'open',
      created_at: new Date().toISOString()
    });
    return NextResponse.json({ ok: false, safety }, { status: 403 });
  }

  const result = await queueSocialBridgeJob({
    agent: 'eden_skye',
    job_type: network === 'instagram' ? 'instagram_post' : 'facebook_post',
    brand_id: brandId,
    timezone: 'America/New_York',
    network,
    content_type: body.content_type ?? 'POST',
    mode: 'draft_only',
    approval_state: 'approved_for_draft',
    caption,
    first_comment: body.first_comment,
    media_urls: body.media_urls,
    media_source: body.media_source,
    scheduled_for: body.scheduled_for,
    max_attempts: 12
  });

  return NextResponse.json({
    ok: result.ok,
    mode: 'draft_only',
    network,
    target: body.target ?? network,
    safety,
    result
  });
}

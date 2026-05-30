import type { SocialBridgeJob } from './socialBridgeTypes';

export type MetricoolDraftResult = {
  ok: boolean;
  mode: 'metricool_api' | 'dry_run' | 'blocked';
  status?: number;
  response?: unknown;
  error?: string;
};

function metricoolEnvStatus() {
  return {
    apiUrlConfigured: Boolean(process.env.METRICOOL_API_URL),
    apiTokenConfigured: Boolean(process.env.METRICOOL_API_TOKEN)
  };
}

export function getMetricoolBridgeStatus() {
  return {
    provider: 'metricool',
    ...metricoolEnvStatus(),
    requiredEnv: ['METRICOOL_API_URL', 'METRICOOL_API_TOKEN'],
    safeModes: ['draft_only'],
    blockedModesWithoutExactApproval: ['schedule', 'publish_now']
  };
}

export async function createMetricoolFacebookDraft(job: SocialBridgeJob): Promise<MetricoolDraftResult> {
  if (job.network !== 'facebook') {
    return { ok: false, mode: 'blocked', error: 'Only facebook is supported by this bridge action.' };
  }

  if (job.mode !== 'draft_only') {
    return { ok: false, mode: 'blocked', error: 'This endpoint only creates draft-only posts.' };
  }

  if (job.approval_state !== 'approved_for_draft') {
    return { ok: false, mode: 'blocked', error: 'Job is not approved for draft creation.' };
  }

  const apiUrl = process.env.METRICOOL_API_URL;
  const apiToken = process.env.METRICOOL_API_TOKEN;

  const payload = {
    blog_id: job.brand_id,
    networks: [job.network],
    text: job.caption,
    media: job.media_urls ?? [],
    draft: true,
    content_type: job.content_type,
    first_comment: job.first_comment ?? '',
    timezone: job.timezone,
    date: job.scheduled_for ?? new Date(Date.now() + 10 * 60 * 1000).toISOString()
  };

  if (!apiUrl || !apiToken) {
    return {
      ok: false,
      mode: 'dry_run',
      error: 'Metricool API environment is not configured. Draft payload prepared but not sent.',
      response: payload
    };
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let parsed: unknown = text;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  return {
    ok: response.ok,
    mode: 'metricool_api',
    status: response.status,
    response: parsed,
    error: response.ok ? undefined : 'Metricool API request failed.'
  };
}

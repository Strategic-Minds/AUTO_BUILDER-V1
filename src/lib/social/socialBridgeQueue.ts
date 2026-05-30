import { insertTelemetry, readTelemetryByQuery, updateTelemetry } from '@/lib/telemetry-store';
import { createMetricoolFacebookDraft, getMetricoolBridgeStatus } from './metricoolClient';
import type { SocialBridgeCreateInput, SocialBridgeJob } from './socialBridgeTypes';

const SOCIAL_QUEUE_NAME = 'eden_skye_social_bridge';

function id() {
  return `social_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeJob(input: SocialBridgeCreateInput): SocialBridgeJob {
  const now = new Date().toISOString();
  return {
    id: id(),
    agent: input.agent ?? 'eden_skye',
    job_type: input.job_type ?? 'facebook_post',
    brand_id: input.brand_id,
    timezone: input.timezone ?? 'America/New_York',
    network: input.network ?? 'facebook',
    content_type: input.content_type ?? 'POST',
    mode: input.mode ?? 'draft_only',
    approval_state: input.approval_state ?? 'approved_for_draft',
    publish_state: 'not_approved',
    caption: input.caption,
    first_comment: input.first_comment,
    media_urls: input.media_urls,
    media_source: input.media_source,
    scheduled_for: input.scheduled_for,
    attempts: 0,
    max_attempts: input.max_attempts ?? 12,
    created_at: now,
    updated_at: now
  };
}

export async function queueSocialBridgeJob(input: SocialBridgeCreateInput) {
  if (!input.caption || !input.brand_id) {
    return { ok: false, error: 'caption and brand_id are required' };
  }

  const job = normalizeJob(input);
  const safe = job.mode === 'draft_only' && job.approval_state === 'approved_for_draft';
  const state = safe ? 'queued' : 'approval_required';

  const task = await insertTelemetry('bridge_tasks', {
    task_type: 'social_bridge_draft',
    task_prompt: job.caption,
    target: SOCIAL_QUEUE_NAME,
    priority: 'high',
    state,
    approved: safe,
    safe,
    evidence: job,
    created_at: job.created_at
  });

  if (!safe) {
    await insertTelemetry('approval_queue', {
      action_type: 'social_bridge_public_action',
      reason: 'Social bridge job is not draft-only or lacks draft approval.',
      risk_score: 80,
      status: 'open',
      created_at: job.created_at
    });
  }

  return { ok: true, state, job, task };
}

export async function claimNextSocialBridgeJob(worker = 'eden-skye-social-worker') {
  const queued = await readTelemetryByQuery('bridge_tasks', {
    select: '*',
    target: `eq.${SOCIAL_QUEUE_NAME}`,
    state: 'eq.queued',
    order: 'created_at.asc',
    limit: '1'
  });
  const row = queued.rows[0] as Record<string, unknown> | undefined;
  if (!row) return { ok: true, claim: null, reason: 'No queued social bridge job.' };

  const now = new Date().toISOString();
  const claim = await insertTelemetry('bridge_claims', {
    task_ref: typeof row.id === 'string' ? row.id : null,
    worker,
    claimed_at: now,
    status: 'claimed'
  });

  await updateTelemetry('bridge_tasks', { state: 'claimed' }, { id: `eq.${String(row.id ?? '')}` });

  return { ok: true, claim, task: row };
}

function extractJob(row: Record<string, unknown>): SocialBridgeJob | null {
  const evidence = row.evidence;
  if (evidence && typeof evidence === 'object') return evidence as SocialBridgeJob;
  return null;
}

export async function runSocialBridgeOnce(worker = 'eden-skye-social-worker') {
  const claimResult = await claimNextSocialBridgeJob(worker);
  if (!claimResult.ok || !claimResult.task) return claimResult;

  const row = claimResult.task as Record<string, unknown>;
  const job = extractJob(row);
  const now = new Date().toISOString();

  if (!job) {
    const blocker = 'Queued social bridge task is missing serialized job evidence.';
    await insertTelemetry('bridge_blockers', {
      task_ref: typeof row.id === 'string' ? row.id : null,
      blocker,
      state: 'open',
      created_at: now
    });
    return { ok: false, error: blocker, task: row };
  }

  if (job.attempts >= job.max_attempts) {
    await updateTelemetry('bridge_tasks', { state: 'failed' }, { id: `eq.${String(row.id ?? '')}` });
    return { ok: false, error: 'max attempts reached', job };
  }

  const nextJob = { ...job, attempts: job.attempts + 1, updated_at: now };
  const result = await createMetricoolFacebookDraft(nextJob);

  await insertTelemetry('bridge_connector_actions', {
    connector: 'metricool',
    action: 'create_facebook_draft',
    status: result.ok ? 'success' : result.mode,
    request: nextJob,
    response: result,
    created_at: now
  });

  await insertTelemetry('bridge_evidence', {
    task_ref: typeof row.id === 'string' ? row.id : null,
    claim_ref: null,
    worker,
    status: result.ok ? 'success' : 'blocked',
    evidence: JSON.stringify(result),
    blocker: result.ok ? null : result.error ?? 'Metricool bridge blocked',
    created_at: now
  });

  if (result.ok) {
    await updateTelemetry('bridge_tasks', { state: 'completed', evidence: { ...nextJob, publish_state: 'draft_created' } }, { id: `eq.${String(row.id ?? '')}` });
  } else {
    await updateTelemetry('bridge_tasks', { state: 'queued', evidence: nextJob }, { id: `eq.${String(row.id ?? '')}` });
    await insertTelemetry('bridge_blockers', {
      task_ref: typeof row.id === 'string' ? row.id : null,
      blocker: result.error ?? 'Metricool bridge blocked',
      state: result.mode === 'dry_run' ? 'config_needed' : 'open',
      created_at: now
    });
  }

  return { ok: result.ok, job: nextJob, result, metricoolStatus: getMetricoolBridgeStatus() };
}

export function socialBridgeQueueInfo() {
  return {
    queue: SOCIAL_QUEUE_NAME,
    safeDefault: 'draft_only',
    worker: 'eden-skye-social-worker',
    telemetryTables: ['bridge_tasks', 'bridge_claims', 'bridge_evidence', 'bridge_blockers', 'bridge_connector_actions'],
    provider: getMetricoolBridgeStatus()
  };
}

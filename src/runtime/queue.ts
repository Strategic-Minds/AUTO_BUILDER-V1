import type { RuntimeJob, RuntimeMode, RuntimeProvider, RuntimeRisk } from './types';

export interface CreateRuntimeJobInput<TPayload = Record<string, unknown>> {
  type: string;
  provider: RuntimeProvider;
  payload?: TPayload;
  mode?: RuntimeMode;
  priority?: number;
  risk?: RuntimeRisk;
  approvalRequired?: boolean;
  approvalPhrase?: string;
  maxAttempts?: number;
}

const memoryQueue = new Map<string, RuntimeJob>();

function newId(prefix = 'job'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createRuntimeJob<TPayload = Record<string, unknown>>(
  input: CreateRuntimeJobInput<TPayload>,
): RuntimeJob<TPayload> {
  const now = new Date().toISOString();
  const job: RuntimeJob<TPayload> = {
    id: newId(),
    type: input.type,
    provider: input.provider,
    priority: input.priority ?? 50,
    state: input.approvalRequired ? 'waiting_approval' : 'queued',
    mode: input.mode ?? 'dry_run',
    risk: input.risk ?? 'low',
    payload: (input.payload ?? {}) as TPayload,
    approval: {
      required: Boolean(input.approvalRequired),
      phrase: input.approvalPhrase,
      granted: false,
    },
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    maxAttempts: input.maxAttempts ?? 5,
  };

  memoryQueue.set(job.id, job as RuntimeJob);
  return job;
}

export function listRuntimeJobs(): RuntimeJob[] {
  return Array.from(memoryQueue.values()).sort((a, b) => b.priority - a.priority);
}

export function getRuntimeJob(id: string): RuntimeJob | undefined {
  return memoryQueue.get(id);
}

export function updateRuntimeJob(id: string, patch: Partial<RuntimeJob>): RuntimeJob | undefined {
  const current = memoryQueue.get(id);
  if (!current) return undefined;
  const updated: RuntimeJob = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  memoryQueue.set(id, updated);
  return updated;
}

export function markRuntimeJobFailed(id: string, reason: string): RuntimeJob | undefined {
  const job = getRuntimeJob(id);
  if (!job) return undefined;
  return updateRuntimeJob(id, {
    state: 'failed',
    payload: {
      ...job.payload,
      failureReason: reason,
    },
  });
}

export function approveRuntimeJob(id: string, grantedBy: string): RuntimeJob | undefined {
  const job = getRuntimeJob(id);
  if (!job) return undefined;
  return updateRuntimeJob(id, {
    state: 'queued',
    approval: {
      ...job.approval,
      granted: true,
      grantedBy,
      grantedAt: new Date().toISOString(),
    },
  });
}

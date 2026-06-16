import type { RuntimeJob, RuntimeResult, RuntimeProvider, RuntimeMode, RuntimeEvidence } from './types';
import { createRuntimeJob, updateRuntimeJob } from './queue';
import { evaluateRuntimeGovernance } from './governance';

function newReceiptId(): string {
  return `receipt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

export interface RunRuntimeJobInput<TPayload = Record<string, unknown>> {
  type: string;
  provider: RuntimeProvider;
  action: string;
  mode?: RuntimeMode;
  payload?: TPayload;
  priority?: number;
  approvalPhrase?: string;
  evidence?: RuntimeEvidence[];
}

export async function runRuntimeJob<TPayload = Record<string, unknown>, TOutput = Record<string, unknown>>(
  input: RunRuntimeJobInput<TPayload>,
): Promise<RuntimeResult<TOutput>> {
  const mode = input.mode ?? 'dry_run';
  const governance = evaluateRuntimeGovernance({
    provider: input.provider,
    mode,
    action: input.action,
    approvalPhrase: input.approvalPhrase,
  });

  const job: RuntimeJob<TPayload> = createRuntimeJob<TPayload>({
    type: input.type,
    provider: input.provider,
    payload: input.payload,
    mode,
    priority: input.priority,
    risk: governance.risk,
    approvalRequired: !governance.allowed || Boolean(governance.requiredApproval),
    approvalPhrase: governance.requiredApproval,
  });

  const receipt = {
    id: newReceiptId(),
    action: input.action,
    provider: input.provider,
    mode,
    status: governance.allowed ? 'queued' as const : 'waiting_approval' as const,
    timestamp: now(),
    evidence: input.evidence ?? [],
    blockers: governance.blockers,
    nextActions: governance.allowed
      ? ['Route job to provider adapter or keep dry-run receipt.']
      : ['Collect explicit approval phrase before execution.'],
    rollbackAvailable: mode !== 'dry_run',
  };

  updateRuntimeJob(job.id, {
    receiptId: receipt.id,
    state: receipt.status,
  });

  if (!governance.allowed) {
    return { ok: false, receipt, job };
  }

  if (mode === 'dry_run' || mode === 'queue_only') {
    return {
      ok: true,
      output: {
        planned: true,
        message: 'Runtime Orchestrator accepted job in non-mutating mode.',
        jobId: job.id,
      } as TOutput,
      receipt,
      job,
    };
  }

  return {
    ok: true,
    output: {
      queued: true,
      message: 'Execution adapter dispatch is intentionally stubbed until provider adapters are validated.',
      jobId: job.id,
    } as TOutput,
    receipt,
    job,
  };
}

export async function runReadinessCycle(): Promise<RuntimeResult> {
  return runRuntimeJob({
    type: 'runtime_readiness',
    provider: 'workflow',
    action: 'readiness_check',
    mode: 'dry_run',
    payload: {
      checks: ['governance', 'queue', 'browser_worker', 'vercel_adapter', 'github_adapter'],
    },
  });
}

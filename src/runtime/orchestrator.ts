import type { RuntimeJob, RuntimeResult, RuntimeProvider, RuntimeMode, RuntimeEvidence } from './types';
import { createRuntimeJob, updateRuntimeJob } from './queue';
import { evaluateRuntimeGovernance } from './governance';
import { n8nAdapter, getN8nAdapterReadiness } from '../providers/n8n-adapter';

function newReceiptId(): string {
  return `receipt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

/**
 * Provider adapter registry.
 * Add adapters here as they are validated and onboarded per
 * STAGED_ADAPTER_EXPANSION_PLAN.md.
 */
const ADAPTER_REGISTRY: Record<string, { execute: (action: unknown) => Promise<unknown> }> = {
  workflow: n8nAdapter,
  n8n:      n8nAdapter,
  // github:    githubAdapter,   // Wave 0 — pending
  // vercel:    vercelAdapter,   // Wave 0 — pending
  // supabase:  supabaseAdapter, // Wave 1 — pending
};

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
): Promise<RuntimeResult<TOutput, TPayload>> {
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

  // Dry-run / queue-only: return receipt without executing
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

  // Live execution: route to registered provider adapter
  const adapter = ADAPTER_REGISTRY[input.provider];
  if (adapter) {
    try {
      const adapterResult = await adapter.execute({
        provider: input.provider,
        action: input.action,
        riskClass: governance.risk as string,
        payload: input.payload ?? {},
        approved: governance.allowed,
      });
      return {
        ok: true,
        output: adapterResult as TOutput,
        receipt,
        job,
      };
    } catch (err) {
      return {
        ok: false,
        output: {
          error: err instanceof Error ? err.message : String(err),
          jobId: job.id,
        } as TOutput,
        receipt,
        job,
      };
    }
  }

  // No adapter registered — return manual receipt (not an error, just not yet implemented)
  return {
    ok: true,
    output: {
      queued: true,
      adapterStatus: 'not_yet_registered',
      message: `Provider "${input.provider}" is not yet in the adapter registry. Job queued as manual receipt per STAGED_ADAPTER_EXPANSION_PLAN.md. N8N adapter is live for workflow/n8n providers.`,
      jobId: job.id,
      registeredAdapters: Object.keys(ADAPTER_REGISTRY),
    } as TOutput,
    receipt,
    job,
  };
}

export async function runReadinessCycle(): Promise<RuntimeResult> {
  const n8nStatus = getN8nAdapterReadiness();
  const base = await runRuntimeJob({
    type: 'runtime_readiness',
    provider: 'workflow',
    action: 'readiness_check',
    mode: 'dry_run',
    payload: {
      checks: ['governance', 'queue', 'browser_worker', 'vercel_adapter', 'github_adapter', 'n8n_adapter'],
      n8nAdapter: n8nStatus,
    },
  });
  return base;
}

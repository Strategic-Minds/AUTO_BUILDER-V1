import { runReadinessCycle } from '../runtime/orchestrator';

export interface RuntimeReadinessWorkflowResult {
  ok: boolean;
  workflow: 'runtime-readiness';
  mode: 'dry_run';
  checkedAt: string;
  receiptId?: string;
  blockers: string[];
  nextActions: string[];
}

export async function runtimeReadinessWorkflow(): Promise<RuntimeReadinessWorkflowResult> {
  const result = await runReadinessCycle();

  return {
    ok: result.ok,
    workflow: 'runtime-readiness',
    mode: 'dry_run',
    checkedAt: new Date().toISOString(),
    receiptId: result.receipt.id,
    blockers: result.receipt.blockers,
    nextActions: [
      'Verify GET /api/runtime/browser returns HTTP 200 after deployment.',
      'Verify GET /api/runtime/vercel returns HTTP 200 after deployment.',
      'Verify GET /api/runtime/readiness returns HTTP 200 after deployment.',
      'Register BROWSER_WORKER_URL only after live route verification.',
    ],
  };
}

export default runtimeReadinessWorkflow;

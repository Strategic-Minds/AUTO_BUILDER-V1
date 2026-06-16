import type { BrowserTaskInput, BrowserTaskOutput, RuntimeResult } from '../types';
import { runRuntimeJob } from '../orchestrator';

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    return null;
  }
}

export async function runBrowserWorkerTask(input: BrowserTaskInput): Promise<RuntimeResult<BrowserTaskOutput>> {
  const planned = await runRuntimeJob<BrowserTaskInput, BrowserTaskOutput>({
    type: 'browser_worker_task',
    provider: 'browser',
    action: input.action,
    mode: 'dry_run',
    payload: input,
    evidence: [
      {
        type: 'url',
        label: 'target_url',
        value: input.url,
        collectedAt: new Date().toISOString(),
      },
    ],
  });

  return planned;
}

export async function captureBrowserEvidence(input: BrowserTaskInput): Promise<RuntimeResult<BrowserTaskOutput>> {
  if (!input.url) {
    return runRuntimeJob<BrowserTaskInput, BrowserTaskOutput>({
      type: 'browser_worker_validation',
      provider: 'browser',
      action: 'blocked_missing_url',
      mode: 'dry_run',
      payload: input,
      evidence: [],
    });
  }

  return runBrowserWorkerTask({ ...input, action: input.action ?? 'capture_evidence' });
}

export async function browserWorkerHealth() {
  const playwright = await loadPlaywright();
  return {
    ok: Boolean(playwright),
    provider: 'playwright',
    mode: 'dry_run',
    message: playwright
      ? 'Playwright dependency is importable. Live execution remains gated.'
      : 'Playwright dependency could not be imported in this runtime.',
    routes: ['/api/runtime/browser'],
    requiredEnv: ['BROWSER_WORKER_TOKEN optional for protected route access'],
  };
}

export async function executePlaywrightUnsafeDisabled(_input: BrowserTaskInput): Promise<BrowserTaskOutput> {
  throw new Error('Live Playwright execution is disabled until approved execution mode and route authentication are implemented.');
}

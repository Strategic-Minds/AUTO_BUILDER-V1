import { NextResponse } from 'next/server';
import { browserWorkerHealth } from '@/runtime/browser/playwright-worker';
import { getVercelRedeployReadiness } from '@/runtime/vercel/redeploy-adapter';
import { listRuntimeJobs } from '@/runtime/queue';
import { runReadinessCycle } from '@/runtime/orchestrator';

export async function GET() {
  const browser = await browserWorkerHealth();
  const vercel = getVercelRedeployReadiness();
  const jobs = listRuntimeJobs();
  const readiness = await runReadinessCycle();

  return NextResponse.json({
    ok: true,
    runtime: 'auto_builder_execution_layer',
    mode: 'dry_run',
    routes: {
      browser: '/api/runtime/browser',
      vercel: '/api/runtime/vercel',
      readiness: '/api/runtime/readiness',
      jobs: '/api/runtime/jobs',
    },
    modules: {
      governance: true,
      queue: true,
      orchestrator: true,
      browserWorker: browser.ok,
      vercelRedeployAdapter: vercel.ok,
    },
    blockers: [
      ...vercel.missingEnv.map((key) => `Missing Vercel env: ${key}`),
      ...(browser.ok ? [] : ['Playwright dependency not importable in this runtime']),
    ],
    jobs: {
      queued: jobs.length,
    },
    receipt: readiness.receipt,
  });
}

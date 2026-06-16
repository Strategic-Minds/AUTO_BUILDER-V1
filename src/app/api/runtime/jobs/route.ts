import { NextResponse } from 'next/server';
import { createRuntimeJob, listRuntimeJobs, getRuntimeJob, approveRuntimeJob } from '@/runtime/queue';
import { evaluateRuntimeGovernance } from '@/runtime/governance';
import type { RuntimeProvider, RuntimeMode } from '@/runtime/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const job = getRuntimeJob(id);
    return NextResponse.json({ ok: Boolean(job), job: job ?? null }, { status: job ? 200 : 404 });
  }

  return NextResponse.json({
    ok: true,
    runtime: 'runtime_jobs',
    mode: 'dry_run',
    jobs: listRuntimeJobs(),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const provider = String(body.provider ?? 'workflow') as RuntimeProvider;
  const mode = String(body.mode ?? 'dry_run') as RuntimeMode;
  const action = String(body.action ?? body.type ?? 'runtime_job');
  const approvalPhrase = body.approvalPhrase ? String(body.approvalPhrase) : undefined;

  if (body.approveJobId) {
    const approved = approveRuntimeJob(String(body.approveJobId), String(body.grantedBy ?? 'operator'));
    return NextResponse.json({ ok: Boolean(approved), job: approved ?? null }, { status: approved ? 200 : 404 });
  }

  const governance = evaluateRuntimeGovernance({ provider, mode, action, approvalPhrase });

  const job = createRuntimeJob({
    type: String(body.type ?? action),
    provider,
    payload: body.payload ?? {},
    mode,
    priority: Number(body.priority ?? 50),
    risk: governance.risk,
    approvalRequired: !governance.allowed || Boolean(governance.requiredApproval),
    approvalPhrase: governance.requiredApproval,
  });

  return NextResponse.json({
    ok: governance.allowed,
    job,
    governance,
    nextActions: governance.allowed
      ? ['Job created in governed queue.']
      : ['Provide required approval phrase before execution.'],
  }, { status: governance.allowed ? 200 : 202 });
}

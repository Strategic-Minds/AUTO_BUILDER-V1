import { NextRequest, NextResponse } from 'next/server';
import {
  getGitHubWorkflowBridgeReadiness,
  handleGitHubWorkflowBridge,
  type GitHubWorkflowBridgeRequest
} from '@/lib/bridges/githubWorkflowBridge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetSystem = searchParams.get('targetSystem') as GitHubWorkflowBridgeRequest['targetSystem'];
  const operation = searchParams.get('operation') as GitHubWorkflowBridgeRequest['operation'];
  const workflowId = searchParams.get('workflowId') ?? undefined;
  const runId = searchParams.get('runId') ?? undefined;
  const jobId = searchParams.get('jobId') ?? undefined;
  const perPage = searchParams.get('perPage') ? Number(searchParams.get('perPage')) : undefined;

  if (!operation) {
    return NextResponse.json({
      name: 'Auto Builder GitHub Workflow Bridge',
      mode: 'governed_workflow_executor_and_reader',
      readiness: getGitHubWorkflowBridgeReadiness(),
      operations: ['list_workflows', 'list_runs', 'list_jobs', 'read_job_logs', 'dispatch'],
      defaultTargets: ['auto_builder', 'eden_skye_studios'],
      dispatchApprovalGate: 'Risky workflow dispatches require APPROVE GITHUB WORKFLOW RUN.'
    });
  }

  const result = await handleGitHubWorkflowBridge({
    operation,
    targetSystem,
    workflowId,
    runId,
    jobId,
    perPage
  });

  return NextResponse.json(result, { status: result.ok ? 200 : result.status || 500 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as GitHubWorkflowBridgeRequest;
  const result = await handleGitHubWorkflowBridge(body);
  const status = result.blocked ? 423 : result.ok ? 200 : result.status || 500;
  return NextResponse.json(result, { status });
}

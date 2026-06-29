import { NextRequest, NextResponse } from "next/server";
import { getRun } from "workflow/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { runId } = await params;

  let run;
  try {
    run = await getRun(runId);
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "RUN_NOT_FOUND", message: `Workflow run ${runId} was not found.` } },
      { status: 404 },
    );
  }

  const [status, workflowName, createdAt, startedAt, completedAt] = await Promise.all([
    run.status,
    run.workflowName,
    run.createdAt,
    run.startedAt,
    run.completedAt,
  ]);

  return NextResponse.json({
    ok: true,
    runId,
    status,
    workflowName,
    createdAt: createdAt.toISOString(),
    startedAt: startedAt?.toISOString() ?? null,
    completedAt: completedAt?.toISOString() ?? null,
    eventsUrl: `/api/workflows/auto-builder-handoff/readable/${runId}`,
  });
}

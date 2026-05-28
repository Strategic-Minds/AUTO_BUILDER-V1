import { NextRequest, NextResponse } from "next/server";
import { getAwosHandoffPack, getAwosSourceTruthChecklist, materializeAwosQueue } from "@/lib/awos-handoff";
import { readRecentTelemetry } from "@/lib/telemetry-store";

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_API_TOKEN;
  if (!expected) {
    return true;
  }
  const header = request.headers.get("x-cron-token") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === expected;
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    message: typeof error === "string" ? error : JSON.stringify(error)
  };
}

async function buildPreview(requestedAt: string) {
  const awosHandoffPack = getAwosHandoffPack();
  const sourceTruthChecklist = getAwosSourceTruthChecklist();
  const latestTraces = await readRecentTelemetry("execution_traces", "started_at", 10);
  const lastRecursiveTrace = latestTraces.ok
    ? latestTraces.rows.find((row: unknown) => {
        const typed = row as Record<string, unknown>;
        return typed.operation === "recursive-control-loop";
      })
    : null;

  const blocker = String(lastRecursiveTrace?.status ?? "no_blocker_detected");

  return {
    awosHandoffPack,
    sourceTruthChecklist,
    queueMaterialization: materializeAwosQueue({
      timestamp: requestedAt,
      blocker,
      approvalEscalationNeeded: blocker !== "success" && blocker !== "no_blocker_detected"
    })
  };
}

async function triggerWorkflow(source: string) {
  const requestedAt = new Date().toISOString();

  try {
    const [{ start }, { awosRecursiveControlWorkflow }, preview] = await Promise.all([
      import("workflow/api"),
      import("../../../../../workflows/awos-recursive-control"),
      buildPreview(requestedAt)
    ]);

    const run = await start(awosRecursiveControlWorkflow, [{ requestedAt, source }]);

    return NextResponse.json({
      ok: true,
      workflowTriggered: true,
      workflowRunId: run.runId,
      source,
      requestedAt,
      ...preview
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        workflowTriggered: false,
        source,
        requestedAt,
        error: "manual_awos_workflow_failed",
        details: serializeError(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return triggerWorkflow("manual-route-get");
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return triggerWorkflow("manual-route-post");
}

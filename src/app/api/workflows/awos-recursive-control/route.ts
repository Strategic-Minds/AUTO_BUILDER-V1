import { NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";
import { getAwosHandoffPack, getAwosSourceTruthChecklist, materializeAwosQueue } from "@/lib/awos-handoff";
import { readRecentTelemetry } from "@/lib/telemetry-store";
import { awosRecursiveControlWorkflow } from "@/workflows/awos-recursive-control";

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_API_TOKEN;
  if (!expected) {
    return true;
  }
  const header = request.headers.get("x-cron-token") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === expected;
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

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestedAt = new Date().toISOString();
  const [preview, run] = await Promise.all([
    buildPreview(requestedAt),
    start(awosRecursiveControlWorkflow, [{ requestedAt, source: "manual-route" }])
  ]);

  return NextResponse.json({
    ok: true,
    workflowTriggered: true,
    workflowRunId: run.runId,
    source: "manual-route",
    requestedAt,
    ...preview
  });
}

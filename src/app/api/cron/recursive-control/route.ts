import { NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";
import { getAwosHandoffPack, getAwosSourceTruthChecklist, materializeAwosQueue } from "@/lib/awos-handoff";
import { classifyBlocker, compressMemory, rankNextTask } from "@/lib/recursive-intelligence";
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

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const awosHandoffPack = getAwosHandoffPack();
  const sourceTruthChecklist = getAwosSourceTruthChecklist();
  const latestTraces = await readRecentTelemetry("execution_traces", "started_at", 25);

  const lastRecursiveTrace = latestTraces.ok
    ? latestTraces.rows.find((row: unknown) => {
        const typed = row as Record<string, unknown>;
        return typed.operation === "recursive-control-loop";
      })
    : null;

  const blocker = String(lastRecursiveTrace?.status ?? "no_blocker_detected");
  const blockerClass = classifyBlocker(blocker);
  const queueMaterialization = materializeAwosQueue({
    timestamp: now,
    blocker,
    approvalEscalationNeeded: blockerClass.severity === "high"
  });

  const memory = compressMemory([
    blocker,
    String(lastRecursiveTrace?.started_at ?? ""),
    awosHandoffPack.docsRoot,
    sourceTruthChecklist.join(","),
    queueMaterialization.items.map((item) => item.type).join(",")
  ]);

  const profitability = blockerClass.severity === "low" ? 82 : blockerClass.severity === "medium" ? 61 : 38;
  const blockerReduction = blockerClass.severity === "high" ? 91 : blockerClass.severity === "medium" ? 72 : 54;
  const capabilityGain = 81;
  const runtimeStability = blockerClass.severity === "high" ? 44 : 76;
  const telemetryHealth = 81;
  const totalScore = rankNextTask({ profitability, blockerReduction, capabilityGain, runtimeStability, telemetryHealth });

  const run = await start(awosRecursiveControlWorkflow, [{ requestedAt: now, source: "vercel-cron" }]);

  return NextResponse.json({
    ok: true,
    workflowTriggered: true,
    workflowRunId: run.runId,
    boundedLoop: true,
    productionActionAllowed: false,
    externalPublishingAllowed: false,
    paidActionsAllowed: false,
    destructiveDbActionsAllowed: false,
    timestamp: now,
    blockerContext: blocker,
    blockerClassification: blockerClass,
    nextInstruction: `Durable workflow queued for ${queueMaterialization.queueName}. Memory seed: ${memory}`,
    governedTask: {
      task: "recursive-governed-next-step",
      mode: "durable_workflow_run",
      allowProductionMutations: false,
      allowExternalPublishing: false,
      allowPaidActions: false,
      allowDestructiveDbActions: false,
      doctrinePack: awosHandoffPack.name,
      queueName: queueMaterialization.queueName,
      timestamp: now
    },
    awosHandoffPack,
    sourceTruthChecklist,
    queueMaterialization,
    taskRanking: {
      profitability,
      blockerReduction,
      capabilityGain,
      runtimeStability,
      telemetryHealth,
      totalScore
    }
  });
}

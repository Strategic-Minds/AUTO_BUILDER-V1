import { NextRequest, NextResponse } from "next/server";
import { getAwosHandoffPack, getAwosSourceTruthChecklist, materializeAwosQueue } from "@/lib/awos-handoff";
import { authorizeCronRequest } from "@/lib/cron-auth";
import { buildRecursiveAgentPlan } from "@/lib/recursive-agents";
import { claimRecursiveBucket, getFiveMinuteBucketKey } from "@/lib/recursive-control-ledger";
import { classifyBlocker, compressMemory, rankNextTask } from "@/lib/recursive-intelligence";
import { readRecentTelemetry } from "@/lib/telemetry-store";
import { sandboxRuntimeStatus } from "@/lib/vercel-sandbox";

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

export async function GET(request: NextRequest) {
  const authorization = authorizeCronRequest(request);
  if (!authorization.ok) {
    return NextResponse.json(
      {
        error: authorization.reason,
        mode: authorization.mode,
        acceptedHeaderNames: authorization.acceptedHeaderNames
      },
      { status: authorization.status }
    );
  }

  try {
    const now = new Date();
    const timestamp = now.toISOString();
    const bucketKey = getFiveMinuteBucketKey(now);
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
      timestamp,
      blocker,
      approvalEscalationNeeded: blockerClass.severity === "high"
    });
    const sandboxStatus = sandboxRuntimeStatus();

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

    const agentPlan = buildRecursiveAgentPlan({
      generatedAt: timestamp,
      bucketKey,
      queueName: queueMaterialization.queueName,
      blocker,
      blockerSeverity: blockerClass.severity,
      needsEscalation: blockerClass.severity === "high",
      items: queueMaterialization.items,
      workerStale: false,
      sandboxAvailable: sandboxStatus.enabled
    });

    const bucketClaim = await claimRecursiveBucket({
      bucketKey,
      route: "/api/cron/recursive-control",
      source: "vercel-cron",
      claimedAt: timestamp
    });

    if (!bucketClaim.claimed) {
      return NextResponse.json({
        ok: true,
        workflowTriggered: false,
        duplicateBucket: true,
        authorization,
        bucketKey,
        timestamp,
        blockerContext: blocker,
        blockerClassification: blockerClass,
        awosHandoffPack,
        sourceTruthChecklist,
        queueMaterialization,
        sandboxStatus,
        agentPlan,
        bucketClaim,
        taskRanking: {
          profitability,
          blockerReduction,
          capabilityGain,
          runtimeStability,
          telemetryHealth,
          totalScore
        },
        nextInstruction: `Bucket ${bucketKey} was already claimed. Preserve the existing durable run and continue with the next safe cycle.`
      });
    }

    const [{ start }, { awosRecursiveControlWorkflow }] = await Promise.all([
      import("workflow/api"),
      import("@/workflows/awos-recursive-control")
    ]);

    const run = await start(awosRecursiveControlWorkflow, [
      {
        requestedAt: timestamp,
        source: "vercel-cron",
        bucketKey
      }
    ]);

    return NextResponse.json({
      ok: true,
      workflowTriggered: true,
      workflowRunId: run.runId,
      boundedLoop: true,
      productionActionAllowed: false,
      externalPublishingAllowed: false,
      paidActionsAllowed: false,
      destructiveDbActionsAllowed: false,
      authorization,
      bucketKey,
      timestamp,
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
        bucketKey,
        timestamp
      },
      awosHandoffPack,
      sourceTruthChecklist,
      queueMaterialization,
      sandboxStatus,
      agentPlan,
      bucketClaim,
      taskRanking: {
        profitability,
        blockerReduction,
        capabilityGain,
        runtimeStability,
        telemetryHealth,
        totalScore
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        workflowTriggered: false,
        error: "recursive_control_workflow_failed",
        details: serializeError(error)
      },
      { status: 500 }
    );
  }
}

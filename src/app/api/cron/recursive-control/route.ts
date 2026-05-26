import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry, readRecentTelemetry } from "@/lib/telemetry-store";

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_API_TOKEN;
  if (!expected) {
    return true;
  }
  const header = request.headers.get("x-cron-token") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === expected;
}

function buildNextPrompt(blocker: string, priorPrompt: string) {
  return `Resolve blocker: ${blocker}. Then execute next bounded recursive step. Prior guidance: ${priorPrompt}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const latestTraces = await readRecentTelemetry("execution_traces", "started_at", 25);

  const lastRecursiveTrace = latestTraces.ok
    ? latestTraces.rows.find((row: unknown) => {
        const typed = row as Record<string, unknown>;
        return typed.operation === "recursive-control-loop";
      })
    : null;

  const blocker = String(lastRecursiveTrace?.status ?? "no_blocker_detected");
  const priorPrompt = String(lastRecursiveTrace?.evidence ?? "stabilize telemetry and governance evidence");
  const nextPrompt = buildNextPrompt(blocker, priorPrompt);

  const governedTask = {
    task: "recursive-governed-next-step",
    mode: "bounded_single_loop",
    allowProductionMutations: false,
    allowExternalPublishing: false,
    allowPaidActions: false,
    allowDestructiveDbActions: false,
    timestamp: now
  };

  const queueMetric = await insertTelemetry("queue_metrics", {
    queue: "recursive_control_queue",
    depth: 1,
    processing: 1,
    failed: 0,
    oldest_job_age_seconds: 0,
    status: "watch",
    observed_at: now
  });

  const heartbeat = await insertTelemetry("agent_heartbeats", {
    agent: "gpt-recursive-orchestrator",
    status: "online",
    surface: "vercel-cron",
    current_task: governedTask.task,
    latency_ms: 0,
    last_seen_at: now,
    created_at: now
  });

  const trace = await insertTelemetry("execution_traces", {
    agent: "gpt-recursive-orchestrator",
    operation: "recursive-control-loop",
    status: "success",
    evidence: nextPrompt,
    rollback_ref: "none",
    started_at: now,
    completed_at: now
  });

  return NextResponse.json({
    ok: true,
    boundedLoop: true,
    productionActionAllowed: false,
    externalPublishingAllowed: false,
    paidActionsAllowed: false,
    destructiveDbActionsAllowed: false,
    timestamp: now,
    blockerContext: blocker,
    nextInstruction: nextPrompt,
    governedTask,
    evidence: {
      queueMetric,
      heartbeat,
      trace
    }
  });
}

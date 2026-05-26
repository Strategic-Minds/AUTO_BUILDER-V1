import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry, readRecentTelemetry } from "@/lib/telemetry-store";
import { classifyBlocker, compressMemory, hashText, rankNextTask } from "@/lib/recursive-intelligence";

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
  const memory = compressMemory([
    priorPrompt,
    String(lastRecursiveTrace?.status ?? ""),
    String(lastRecursiveTrace?.started_at ?? "")
  ]);
  const nextPromptDraft = buildNextPrompt(blocker, memory);
  const currentHash = hashText(nextPromptDraft);
  const priorHash = hashText(priorPrompt);
  const deduped = currentHash === priorHash;
  const nextPrompt = deduped
    ? `Execute ranked workaround to reduce blocker pressure. Memory: ${memory}`
    : nextPromptDraft;

  const blockerClass = classifyBlocker(blocker);
  const profitability = blockerClass.severity === "low" ? 82 : blockerClass.severity === "medium" ? 61 : 38;
  const blockerReduction = blockerClass.severity === "high" ? 91 : blockerClass.severity === "medium" ? 72 : 54;
  const capabilityGain = 77;
  const runtimeStability = blockerClass.severity === "high" ? 44 : 73;
  const telemetryHealth = 79;
  const totalScore = rankNextTask({ profitability, blockerReduction, capabilityGain, runtimeStability, telemetryHealth });

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

  const watchdogAge = Math.max(0, Math.floor((Date.now() - Date.parse(String(lastRecursiveTrace?.completed_at ?? now))) / 1000));
  const workerStale = watchdogAge > 300;
  const codexBudgetLimit = Number(process.env.CODEX_BUDGET_MAX_CLAIMS ?? "300");
  const playwrightBudgetLimit = Number(process.env.PLAYWRIGHT_BUDGET_MAX_RUNS ?? "300");
  const recentClaims = await readRecentTelemetry("bridge_claims", "claimed_at", 500);
  const codexUsage = recentClaims.ok ? recentClaims.rows.length : 0;
  const playwrightUsage = await readRecentTelemetry("playwright_sessions", "last_action_at", 500);
  const playwrightCount = playwrightUsage.ok ? playwrightUsage.rows.length : 0;
  const codexBlocked = codexUsage > codexBudgetLimit;
  const playwrightBlocked = playwrightCount > playwrightBudgetLimit;
  const needsEscalation = codexBlocked || playwrightBlocked || blockerClass.severity === "high";

  const inserts = await Promise.all([
    insertTelemetry("recursive_memory_compression", {
      memory_key: "recursive-control",
      compressed_summary: memory,
      trace_ref: trace.response?.[0]?.id ?? null,
      created_at: now
    }),
    insertTelemetry("recursive_loop_deduper", {
      loop_hash: currentHash,
      deduped,
      reason: deduped ? "echo_prevented" : "unique_prompt",
      created_at: now
    }),
    insertTelemetry("blocker_classifier", {
      blocker_text: blocker,
      severity: blockerClass.severity,
      category: blockerClass.category,
      created_at: now
    }),
    insertTelemetry("next_task_ranker", {
      task_name: governedTask.task,
      profitability,
      blocker_reduction: blockerReduction,
      capability_gain: capabilityGain,
      runtime_stability: runtimeStability,
      telemetry_health: telemetryHealth,
      total_score: totalScore,
      created_at: now
    }),
    insertTelemetry("capability_gap_registry", {
      capability: "recursive_autonomy",
      gap_score: 100 - capabilityGain,
      evidence: nextPrompt,
      created_at: now
    }),
    insertTelemetry("profit_score_registry", {
      workflow: "recursive_control_loop",
      profit_score: profitability,
      rationale: "Ranked from blocker severity, stability, and telemetry health.",
      created_at: now
    }),
    insertTelemetry("worker_watchdog", {
      worker: "codex-prod-worker",
      stale: workerStale,
      heartbeat_age_seconds: watchdogAge,
      action: workerStale ? "enqueue_watchdog_recovery" : "healthy",
      created_at: now
    }),
    insertTelemetry("budget_governor", {
      surface: "codex",
      budget_limit: codexBudgetLimit,
      usage_count: codexUsage,
      blocked: codexBlocked,
      created_at: now
    }),
    insertTelemetry("budget_governor", {
      surface: "playwright",
      budget_limit: playwrightBudgetLimit,
      usage_count: playwrightCount,
      blocked: playwrightBlocked,
      created_at: now
    }),
    insertTelemetry("scheduler_verification", {
      scheduler_name: "vercel_cron",
      route: "/api/cron/recursive-control",
      status: "executed",
      proof: trace.response?.[0]?.id ?? "no-trace-id",
      created_at: now
    })
  ]);

  let approvalEscalation = null;
  if (needsEscalation) {
    approvalEscalation = await insertTelemetry("approval_gate_escalation_queue", {
      task_ref: governedTask.task,
      reason: codexBlocked || playwrightBlocked ? "budget_limit_reached" : `high_severity_${blockerClass.category}`,
      risk: "high",
      status: "open",
      created_at: now
    });
  }

  return NextResponse.json({
    ok: true,
    boundedLoop: true,
    productionActionAllowed: false,
    externalPublishingAllowed: false,
    paidActionsAllowed: false,
    destructiveDbActionsAllowed: false,
    timestamp: now,
    blockerContext: blocker,
    blockerClassification: blockerClass,
    deduped,
    nextInstruction: nextPrompt,
    governedTask,
    taskRanking: {
      profitability,
      blockerReduction,
      capabilityGain,
      runtimeStability,
      telemetryHealth,
      totalScore
    },
    budget: {
      codexUsage,
      codexBudgetLimit,
      codexBlocked,
      playwrightCount,
      playwrightBudgetLimit,
      playwrightBlocked
    },
    evidence: {
      queueMetric,
      heartbeat,
      trace,
      registries: inserts,
      approvalEscalation
    }
  });
}

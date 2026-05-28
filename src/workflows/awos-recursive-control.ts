import { getAwosHandoffPack, getAwosSourceTruthChecklist, materializeAwosQueue } from "@/lib/awos-handoff";
import { buildRecursiveAgentPlan } from "@/lib/recursive-agents";
import { getFiveMinuteBucketKey } from "@/lib/recursive-control-ledger";
import { classifyBlocker, compressMemory, hashText, rankNextTask } from "@/lib/recursive-intelligence";
import { insertTelemetry, readRecentTelemetry, readTelemetryByQuery, updateTelemetry } from "@/lib/telemetry-store";
import { runSandboxTask, sandboxRuntimeStatus, type SandboxTaskResult } from "@/lib/vercel-sandbox";

type WorkflowTrigger = {
  requestedAt?: string;
  source?: string;
  bucketKey?: string;
};

type QueueJobResult = {
  ok: boolean;
  mode: string;
  table: string;
  skipped?: boolean;
  idempotencyKey?: string;
  response?: unknown;
  status?: number;
};

type WorkflowState = Awaited<ReturnType<typeof collectState>>;

type QueueJobsSummary = {
  total: number;
  inserted: number;
  skippedExisting: number;
  failed: number;
};

type SandboxExecutionSummary = SandboxTaskResult & {
  tasksRequested: number;
  taskIds: string[];
};

function sandboxRunnerSource() {
  return [
    'import { readFileSync, writeFileSync } from "node:fs";',
    'const plan = JSON.parse(readFileSync("plan.json", "utf8"));',
    'const artifact = {',
    '  bucketKey: plan.bucketKey,',
    '  queueName: plan.queueName,',
    '  generatedAt: new Date().toISOString(),',
    '  tasksExecuted: plan.tasks.map((task) => ({ taskId: task.taskId, agentId: task.agentId, action: task.action }))',
    '};',
    'writeFileSync("artifact.json", JSON.stringify(artifact, null, 2));',
    'console.log(JSON.stringify({ bucketKey: artifact.bucketKey, tasksExecuted: artifact.tasksExecuted.length }));'
  ].join("\n");
}

function normalizeTelemetryPayload<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildAgentPlanTelemetryPayload(state: WorkflowState) {
  return normalizeTelemetryPayload({
    bucketKey: state.bucketKey,
    summary: state.agentPlan.summary,
    queueName: state.agentPlan.queueName,
    generatedAt: state.agentPlan.generatedAt,
    agents: state.agentPlan.agents.map((agent) => ({
      agentId: agent.agentId,
      label: agent.label,
      role: agent.role,
      autonomy: agent.autonomy,
      sandboxCapable: agent.sandboxCapable,
      approvalRequiredFor: agent.approvalRequiredFor
    })),
    tasks: state.agentPlan.tasks.map((task) => ({
      taskId: task.taskId,
      agentId: task.agentId,
      queueItemId: task.queueItemId,
      action: task.action,
      priority: task.priority,
      approvalRequired: task.approvalRequired,
      requiresSandbox: task.requiresSandbox,
      instructions: task.instructions
    }))
  });
}

function buildSandboxTelemetryPayload(state: WorkflowState, sandboxExecution: SandboxExecutionSummary) {
  return normalizeTelemetryPayload({
    bucketKey: state.bucketKey,
    queueName: state.queueMaterialization.queueName,
    ok: sandboxExecution.ok,
    skipped: sandboxExecution.skipped ?? false,
    mode: sandboxExecution.mode,
    jobId: sandboxExecution.jobId,
    label: sandboxExecution.label,
    reason: sandboxExecution.reason ?? null,
    runtime: sandboxExecution.runtime,
    networkPolicy: sandboxExecution.networkPolicy,
    sandboxId: sandboxExecution.sandboxId ?? null,
    exitCode: sandboxExecution.exitCode ?? null,
    tasksRequested: sandboxExecution.tasksRequested,
    taskIds: sandboxExecution.taskIds,
    stdout: sandboxExecution.stdout ?? null,
    stderr: sandboxExecution.stderr ?? null,
    artifact: sandboxExecution.artifact ?? null
  });
}

async function collectState(trigger: WorkflowTrigger) {
  "use step";

  const now = trigger.requestedAt ?? new Date().toISOString();
  const bucketKey = trigger.bucketKey ?? getFiveMinuteBucketKey(now);
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
  const codexBudgetLimit = Number(process.env.CODEX_BUDGET_MAX_CLAIMS ?? "300");
  const playwrightBudgetLimit = Number(process.env.PLAYWRIGHT_BUDGET_MAX_RUNS ?? "300");
  const recentClaims = await readRecentTelemetry("bridge_claims", "claimed_at", 500);
  const codexUsage = recentClaims.ok ? recentClaims.rows.length : 0;
  const playwrightUsage = await readRecentTelemetry("playwright_sessions", "last_action_at", 500);
  const playwrightCount = playwrightUsage.ok ? playwrightUsage.rows.length : 0;
  const codexBlocked = codexUsage > codexBudgetLimit;
  const playwrightBlocked = playwrightCount > playwrightBudgetLimit;
  const needsEscalation = codexBlocked || playwrightBlocked || blockerClass.severity === "high";

  const queueMaterialization = materializeAwosQueue({
    timestamp: now,
    blocker,
    approvalEscalationNeeded: needsEscalation
  });

  const guidanceSeed = compressMemory([
    blocker,
    String(lastRecursiveTrace?.started_at ?? ""),
    awosHandoffPack.docsRoot,
    sourceTruthChecklist.join(","),
    queueMaterialization.items.map((item) => item.type).join(",")
  ]);
  const nextPromptDraft = `Resolve blocker: ${blocker}. Then execute next bounded recursive step. Prior guidance: ${guidanceSeed}`;
  const currentHash = hashText(nextPromptDraft);
  const priorHash = hashText(String(lastRecursiveTrace?.evidence ?? guidanceSeed));
  const deduped = currentHash === priorHash;
  const nextPrompt = deduped
    ? `Execute ranked workaround to reduce blocker pressure, then reconcile against ${awosHandoffPack.sourceOfTruthMap}. Queue: ${queueMaterialization.queueName}. Memory: ${guidanceSeed}`
    : `${nextPromptDraft} Reconcile actions against ${awosHandoffPack.sourceOfTruthMap} and materialize ${queueMaterialization.queueName}.`;

  const profitability = blockerClass.severity === "low" ? 82 : blockerClass.severity === "medium" ? 61 : 38;
  const blockerReduction = blockerClass.severity === "high" ? 91 : blockerClass.severity === "medium" ? 72 : 54;
  const capabilityGain = 81;
  const runtimeStability = blockerClass.severity === "high" ? 44 : 76;
  const telemetryHealth = 81;
  const totalScore = rankNextTask({ profitability, blockerReduction, capabilityGain, runtimeStability, telemetryHealth });
  const watchdogAge = Math.max(0, Math.floor((Date.now() - Date.parse(String(lastRecursiveTrace?.completed_at ?? now))) / 1000));
  const workerStale = watchdogAge > 300;
  const queueFingerprint = hashText([
    awosHandoffPack.name,
    blockerClass.severity,
    String(needsEscalation),
    queueMaterialization.items.map((item) => item.type).join(",")
  ].join("|"));
  const sandboxStatus = sandboxRuntimeStatus();
  const agentPlan = buildRecursiveAgentPlan({
    generatedAt: now,
    bucketKey,
    queueName: queueMaterialization.queueName,
    blocker,
    blockerSeverity: blockerClass.severity,
    needsEscalation,
    items: queueMaterialization.items,
    workerStale,
    sandboxAvailable: sandboxStatus.enabled
  });

  return {
    now,
    source: trigger.source ?? "vercel-cron",
    bucketKey,
    awosHandoffPack,
    sourceTruthChecklist,
    blocker,
    blockerClass,
    nextPrompt,
    deduped,
    profitability,
    blockerReduction,
    capabilityGain,
    runtimeStability,
    telemetryHealth,
    totalScore,
    codexBudgetLimit,
    codexUsage,
    codexBlocked,
    playwrightBudgetLimit,
    playwrightCount,
    playwrightBlocked,
    needsEscalation,
    queueMaterialization,
    guidanceSeed,
    workerStale,
    watchdogAge,
    queueFingerprint,
    sandboxStatus,
    agentPlan,
    governedTask: {
      task: "recursive-governed-next-step",
      mode: "bounded_single_loop",
      allowProductionMutations: false,
      allowExternalPublishing: false,
      allowPaidActions: false,
      allowDestructiveDbActions: false,
      doctrinePack: awosHandoffPack.name,
      queueName: queueMaterialization.queueName,
      bucketKey,
      timestamp: now
    }
  };
}

async function materializeQueueJobs(state: WorkflowState) {
  "use step";

  const queueJobs = await Promise.all(
    state.queueMaterialization.items.map(async (item): Promise<QueueJobResult> => {
      const idempotencyKey = `${state.queueFingerprint}-${item.type}`;
      const existingQueueJob = await readTelemetryByQuery("queue_jobs", {
        select: "id,idempotency_key,job_status,created_at",
        idempotency_key: `eq.${idempotencyKey}`,
        limit: "1"
      });

      if (existingQueueJob.ok && existingQueueJob.rows.length > 0) {
        return {
          ok: true,
          mode: "deduped_existing_queue_job",
          table: "queue_jobs",
          skipped: true,
          idempotencyKey,
          response: existingQueueJob.rows
        };
      }

      const inserted = await insertTelemetry("queue_jobs", {
        source_key: state.awosHandoffPack.name,
        runtime_object_type: "awos_handoff_pack",
        runtime_object_id: state.awosHandoffPack.docsRoot,
        connector_name: item.approvalRequired ? "approval-gate" : "recursive-control",
        job_type: item.type,
        job_status: item.approvalRequired ? "awaiting_approval" : "queued",
        priority: item.priority,
        idempotency_key: idempotencyKey,
        input_payload: item,
        scheduled_at: state.now
      });

      return {
        ok: inserted.ok,
        mode: inserted.mode,
        table: inserted.table,
        status: inserted.status,
        idempotencyKey,
        response: inserted.response
      };
    })
  );

  return {
    queueJobs,
    queueJobsSummary: {
      total: queueJobs.length,
      inserted: queueJobs.filter((result) => result.ok && !result.skipped).length,
      skippedExisting: queueJobs.filter((result) => result.skipped).length,
      failed: queueJobs.filter((result) => !result.ok).length
    }
  };
}

async function executeSandboxValidation(state: WorkflowState): Promise<SandboxExecutionSummary> {
  "use step";

  const sandboxTasks = state.agentPlan.tasks.filter((task) => task.requiresSandbox);
  if (sandboxTasks.length === 0) {
    return {
      ok: true,
      skipped: true,
      mode: "disabled",
      jobId: `awos-sandbox-${state.bucketKey}`,
      label: "awos-recursive-control",
      reason: "No sandbox-tagged tasks were generated for this bucket.",
      runtime: "node24",
      networkPolicy: "deny-all",
      tasksRequested: 0,
      taskIds: []
    };
  }

  const planPayload = {
    bucketKey: state.bucketKey,
    queueName: state.queueMaterialization.queueName,
    generatedAt: state.now,
    tasks: sandboxTasks.map((task) => ({
      taskId: task.taskId,
      agentId: task.agentId,
      action: task.action,
      instructions: task.instructions,
      priority: task.priority
    }))
  };

  const result = await runSandboxTask({
    jobId: `awos-sandbox-${state.bucketKey}`,
    label: "awos-recursive-control",
    runtime: "node24",
    timeoutMs: 300_000,
    allowNetwork: false,
    files: [
      {
        path: "plan.json",
        content: JSON.stringify(planPayload, null, 2)
      },
      {
        path: "runner.mjs",
        content: sandboxRunnerSource(),
        mode: 0o755
      }
    ],
    command: {
      cmd: "node",
      args: ["runner.mjs"]
    },
    artifactPath: "artifact.json"
  });

  return {
    ...result,
    tasksRequested: sandboxTasks.length,
    taskIds: sandboxTasks.map((task) => task.taskId)
  };
}

async function persistWorkflowTelemetry(
  state: WorkflowState,
  queueJobs: QueueJobResult[],
  queueJobsSummary: QueueJobsSummary,
  sandboxExecution: SandboxExecutionSummary
) {
  "use step";

  const queueMetric = await insertTelemetry("queue_metrics", {
    queue: state.queueMaterialization.queueName,
    depth: state.queueMaterialization.items.length,
    processing: state.queueMaterialization.items.filter((item) => !item.approvalRequired).length,
    failed: queueJobsSummary.failed,
    oldest_job_age_seconds: 0,
    status: queueJobsSummary.failed > 0 ? "degraded" : "watch",
    observed_at: state.now
  });

  const heartbeat = await insertTelemetry("agent_heartbeats", {
    agent: "gpt-recursive-orchestrator",
    status: "online",
    surface: "vercel-workflow",
    current_task: state.governedTask.task,
    latency_ms: 0,
    last_seen_at: state.now,
    created_at: state.now
  });

  const trace = await insertTelemetry("execution_traces", {
    agent: "gpt-recursive-orchestrator",
    operation: "recursive-control-loop",
    status: sandboxExecution.ok || sandboxExecution.skipped ? "success" : "sandbox_error",
    evidence: `bucket:${state.bucketKey} ${state.nextPrompt}`,
    rollback_ref: state.awosHandoffPack.buildPacket,
    started_at: state.now,
    completed_at: state.now
  });

  const schedulerStatus = await updateTelemetry(
    "scheduler_verification",
    {
      status: sandboxExecution.ok ? "executed" : sandboxExecution.skipped ? "executed_without_sandbox" : "executed_with_sandbox_error"
    },
    {
      scheduler_name: "eq.awos_recursive_control",
      proof: `eq.${state.bucketKey}`
    }
  );

  const registries = await Promise.allSettled([
    insertTelemetry("recursive_memory_compression", {
      memory_key: "recursive-control",
      compressed_summary: state.guidanceSeed,
      trace_ref: trace.response?.[0]?.id ?? null,
      created_at: state.now
    }),
    insertTelemetry("recursive_loop_deduper", {
      loop_hash: state.queueFingerprint,
      deduped: state.deduped,
      reason: state.deduped ? "echo_prevented" : "unique_prompt",
      created_at: state.now
    }),
    insertTelemetry("blocker_classifier", {
      blocker_text: state.blocker,
      severity: state.blockerClass.severity,
      category: state.blockerClass.category,
      created_at: state.now
    }),
    insertTelemetry("next_task_ranker", {
      task_name: state.governedTask.task,
      profitability: state.profitability,
      blocker_reduction: state.blockerReduction,
      capability_gain: state.capabilityGain,
      runtime_stability: state.runtimeStability,
      telemetry_health: state.telemetryHealth,
      total_score: state.totalScore,
      created_at: state.now
    }),
    insertTelemetry("capability_gap_registry", {
      capability: "recursive_autonomy",
      gap_score: 100 - state.capabilityGain,
      evidence: state.nextPrompt,
      created_at: state.now
    }),
    insertTelemetry("profit_score_registry", {
      workflow: "recursive_control_loop",
      profit_score: state.profitability,
      rationale: "Ranked from blocker severity, stability, telemetry health, and AWOS queue readiness.",
      created_at: state.now
    }),
    insertTelemetry("worker_watchdog", {
      worker: "codex-prod-worker",
      stale: state.workerStale,
      heartbeat_age_seconds: state.watchdogAge,
      action: state.workerStale ? "enqueue_watchdog_recovery" : "healthy",
      created_at: state.now
    }),
    insertTelemetry("budget_governor", {
      surface: "codex",
      budget_limit: state.codexBudgetLimit,
      usage_count: state.codexUsage,
      blocked: state.codexBlocked,
      created_at: state.now
    }),
    insertTelemetry("budget_governor", {
      surface: "playwright",
      budget_limit: state.playwrightBudgetLimit,
      usage_count: state.playwrightCount,
      blocked: state.playwrightBlocked,
      created_at: state.now
    }),
    insertTelemetry("scheduler_verification", {
      scheduler_name: "vercel_workflow",
      route: "/api/cron/recursive-control",
      status: sandboxExecution.ok ? "executed" : sandboxExecution.skipped ? "executed_without_sandbox" : "executed_with_sandbox_error",
      proof: trace.response?.[0]?.id ?? "no-trace-id",
      created_at: state.now
    })
  ]);

  const runtimeTelemetry = await Promise.allSettled([
    insertTelemetry("runtime_telemetry_events", {
      telemetry_key: "awos_queue_materialization",
      event_status: queueJobsSummary.failed > 0 ? "partial_failure" : "captured",
      event_payload: normalizeTelemetryPayload({
        bucketKey: state.bucketKey,
        handoffPack: state.awosHandoffPack,
        sourceTruthChecklist: state.sourceTruthChecklist,
        queueMaterialization: state.queueMaterialization,
        queueJobsSummary,
        governedTask: state.governedTask,
        queueFingerprint: state.queueFingerprint,
        workflowSource: state.source
      }),
      created_at: state.now,
      updated_at: state.now
    }),
    insertTelemetry("runtime_telemetry_events", {
      telemetry_key: "awos_agent_plan",
      event_status: "planned",
      event_payload: buildAgentPlanTelemetryPayload(state),
      created_at: state.now,
      updated_at: state.now
    }),
    insertTelemetry("runtime_telemetry_events", {
      telemetry_key: "awos_sandbox_execution",
      event_status: sandboxExecution.ok ? "passed" : sandboxExecution.skipped ? "skipped" : "failed",
      event_payload: buildSandboxTelemetryPayload(state, sandboxExecution),
      created_at: state.now,
      updated_at: state.now
    })
  ]);

  const approvalEscalation = state.needsEscalation
    ? await insertTelemetry("approval_gate_escalation_queue", {
        task_ref: state.governedTask.task,
        reason: state.codexBlocked || state.playwrightBlocked
          ? "budget_limit_reached"
          : `high_severity_${state.blockerClass.category}`,
        risk: "high",
        status: "open",
        created_at: state.now
      })
    : null;

  return {
    queueMetric,
    heartbeat,
    trace,
    registries,
    runtimeTelemetry,
    approvalEscalation,
    queueJobs,
    schedulerStatus,
    sandboxExecution
  };
}

export async function awosRecursiveControlWorkflow(trigger: WorkflowTrigger = {}) {
  "use workflow";

  const state = await collectState(trigger);
  const { queueJobs, queueJobsSummary } = await materializeQueueJobs(state);
  const sandboxExecution = await executeSandboxValidation(state);
  const telemetry = await persistWorkflowTelemetry(state, queueJobs, queueJobsSummary, sandboxExecution);

  return {
    ok: true,
    source: state.source,
    bucketKey: state.bucketKey,
    timestamp: state.now,
    governedTask: state.governedTask,
    awosHandoffPack: state.awosHandoffPack,
    sourceTruthChecklist: state.sourceTruthChecklist,
    queueMaterialization: state.queueMaterialization,
    queueFingerprint: state.queueFingerprint,
    agentPlan: state.agentPlan,
    sandboxStatus: state.sandboxStatus,
    sandboxExecution,
    queueJobsSummary,
    taskRanking: {
      profitability: state.profitability,
      blockerReduction: state.blockerReduction,
      capabilityGain: state.capabilityGain,
      runtimeStability: state.runtimeStability,
      telemetryHealth: state.telemetryHealth,
      totalScore: state.totalScore
    },
    budget: {
      codexUsage: state.codexUsage,
      codexBudgetLimit: state.codexBudgetLimit,
      codexBlocked: state.codexBlocked,
      playwrightCount: state.playwrightCount,
      playwrightBudgetLimit: state.playwrightBudgetLimit,
      playwrightBlocked: state.playwrightBlocked
    },
    telemetry
  };
}

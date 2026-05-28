export type RecursiveQueueItem = {
  id: string;
  type: string;
  priority: number;
  approvalRequired: boolean;
  status: string;
  source: string;
};

export type RecursiveAgentDefinition = {
  agentId: string;
  label: string;
  role: string;
  autonomy: "high" | "medium" | "low";
  sandboxCapable: boolean;
  approvalRequiredFor: string[];
};

export type RecursiveAgentTask = {
  taskId: string;
  agentId: string;
  queueItemId: string;
  action: string;
  priority: number;
  approvalRequired: boolean;
  requiresSandbox: boolean;
  instructions: string;
};

export type RecursiveAgentPlan = {
  generatedAt: string;
  bucketKey: string;
  queueName: string;
  agents: RecursiveAgentDefinition[];
  tasks: RecursiveAgentTask[];
  summary: {
    agentCount: number;
    taskCount: number;
    sandboxTaskCount: number;
    approvalTaskCount: number;
    highestPriority: number;
  };
};

const AGENTS: RecursiveAgentDefinition[] = [
  {
    agentId: "master-brain",
    label: "Master Brain Agent",
    role: "Own loop state, doctrine reconciliation, and final routing.",
    autonomy: "high",
    sandboxCapable: false,
    approvalRequiredFor: ["live deployment", "schema mutation", "billing mutation", "live publishing"]
  },
  {
    agentId: "planner",
    label: "Planner Agent",
    role: "Turn queue items into bounded executable work.",
    autonomy: "high",
    sandboxCapable: false,
    approvalRequiredFor: []
  },
  {
    agentId: "governance",
    label: "Governance Agent",
    role: "Stop protected work and package approval decisions.",
    autonomy: "high",
    sandboxCapable: false,
    approvalRequiredFor: ["protected actions", "elevated risk actions"]
  },
  {
    agentId: "memory",
    label: "Memory Agent",
    role: "Preserve continuity summaries and run evidence.",
    autonomy: "medium",
    sandboxCapable: false,
    approvalRequiredFor: []
  },
  {
    agentId: "sandbox-qa",
    label: "Sandbox QA Agent",
    role: "Execute isolated validation in Vercel Sandbox.",
    autonomy: "medium",
    sandboxCapable: true,
    approvalRequiredFor: ["production promotion"]
  },
  {
    agentId: "recovery",
    label: "Recovery Agent",
    role: "Respond to stale workers, retries, and degraded runtime conditions.",
    autonomy: "medium",
    sandboxCapable: true,
    approvalRequiredFor: ["persistent incident escalation"]
  }
];

const SANDBOX_TASK_TYPES = new Set(["workflow-loop-refresh", "queue-materialization"]);

function toTaskId(bucketKey: string, agentId: string, action: string) {
  const actionKey = action.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return `${bucketKey}-${agentId}-${actionKey}`;
}

function routeAgentId(item: RecursiveQueueItem) {
  switch (item.type) {
    case "source-truth-reconciliation":
      return "master-brain";
    case "workflow-loop-refresh":
      return "planner";
    case "queue-materialization":
      return "memory";
    case "supabase-queue-activation":
    case "approval-escalation-review":
      return "governance";
    default:
      return item.approvalRequired ? "governance" : "planner";
  }
}

function buildQueueTask(bucketKey: string, item: RecursiveQueueItem): RecursiveAgentTask {
  const agentId = routeAgentId(item);
  return {
    taskId: toTaskId(bucketKey, agentId, item.type),
    agentId,
    queueItemId: item.id,
    action: item.type,
    priority: item.priority,
    approvalRequired: item.approvalRequired,
    requiresSandbox: SANDBOX_TASK_TYPES.has(item.type),
    instructions: item.approvalRequired
      ? `Prepare governed approval packet for ${item.type} using ${item.source}.`
      : `Advance ${item.type} using ${item.source} without crossing protected mutation boundaries.`
  };
}

export function recursiveAgentInventory() {
  return AGENTS;
}

export function buildRecursiveAgentPlan(input: {
  generatedAt: string;
  bucketKey: string;
  queueName: string;
  blocker: string;
  blockerSeverity: string;
  needsEscalation: boolean;
  items: RecursiveQueueItem[];
  workerStale: boolean;
  sandboxAvailable: boolean;
}): RecursiveAgentPlan {
  const tasks = input.items.map((item) => buildQueueTask(input.bucketKey, item));

  tasks.unshift({
    taskId: toTaskId(input.bucketKey, "master-brain", "bounded-loop-reconciliation"),
    agentId: "master-brain",
    queueItemId: "system",
    action: "bounded-loop-reconciliation",
    priority: 99,
    approvalRequired: false,
    requiresSandbox: false,
    instructions: `Reconcile doctrine, blocker state, and queue readiness for ${input.queueName}. Current blocker: ${input.blocker}.`
  });

  tasks.push({
    taskId: toTaskId(input.bucketKey, "memory", "continuity-snapshot"),
    agentId: "memory",
    queueItemId: "system",
    action: "continuity-snapshot",
    priority: 67,
    approvalRequired: false,
    requiresSandbox: false,
    instructions: "Compress the run summary, keep the next prompt durable, and preserve evidence for the next loop."
  });

  const sandboxCandidateCount = tasks.filter((task) => task.requiresSandbox).length;
  if (sandboxCandidateCount > 0 && input.sandboxAvailable) {
    tasks.push({
      taskId: toTaskId(input.bucketKey, "sandbox-qa", "isolated-runtime-validation"),
      agentId: "sandbox-qa",
      queueItemId: "system",
      action: "isolated-runtime-validation",
      priority: 83,
      approvalRequired: false,
      requiresSandbox: true,
      instructions: "Run an isolated validation pass for workflow refresh and queue materialization artifacts before any promotion decision."
    });
  }

  if (input.workerStale) {
    tasks.push({
      taskId: toTaskId(input.bucketKey, "recovery", "worker-watchdog-recovery"),
      agentId: "recovery",
      queueItemId: "system",
      action: "worker-watchdog-recovery",
      priority: 90,
      approvalRequired: false,
      requiresSandbox: input.sandboxAvailable,
      instructions: "Investigate the stale worker condition and prepare a bounded recovery lane without mutating protected systems."
    });
  }

  if (input.needsEscalation) {
    tasks.push({
      taskId: toTaskId(input.bucketKey, "governance", "approval-escalation"),
      agentId: "governance",
      queueItemId: "system",
      action: "approval-escalation",
      priority: 97,
      approvalRequired: true,
      requiresSandbox: false,
      instructions: `Open a governed review because blocker severity is ${input.blockerSeverity} or a runtime budget guard tripped.`
    });
  }

  return {
    generatedAt: input.generatedAt,
    bucketKey: input.bucketKey,
    queueName: input.queueName,
    agents: AGENTS,
    tasks,
    summary: {
      agentCount: AGENTS.length,
      taskCount: tasks.length,
      sandboxTaskCount: tasks.filter((task) => task.requiresSandbox).length,
      approvalTaskCount: tasks.filter((task) => task.approvalRequired).length,
      highestPriority: tasks.reduce((highest, task) => Math.max(highest, task.priority), 0)
    }
  };
}

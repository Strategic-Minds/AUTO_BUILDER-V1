export function getAwosHandoffPack() {
  return {
    name: "awos-max-autonomy",
    docsRoot: "docs/awos-max-autonomy",
    sourceOfTruthMap: "docs/awos-max-autonomy/00_SOURCE_OF_TRUTH_MAP.md",
    endGoal: "docs/awos-max-autonomy/01_END_GOAL_SYSTEM.md",
    reverseEngineeredExecutionMap: "docs/awos-max-autonomy/02_REVERSE_ENGINEERED_EXECUTION_MAP.md",
    fullAutomationWorkflow: "docs/awos-max-autonomy/03_FULL_AUTOMATION_WORKFLOW.md",
    agentRegistry: "docs/awos-max-autonomy/04_AGENT_REGISTRY.md",
    queueSchemaDraft: "docs/awos-max-autonomy/05_SUPABASE_QUEUE_SCHEMA.sql",
    workflowAndCronPlan: "docs/awos-max-autonomy/06_VERCEL_WORKFLOW_AND_CRON_PLAN.md",
    buildPacket: "docs/awos-max-autonomy/09_BUILD_PACKET.md",
    governedMigrationStep: "docs/awos-max-autonomy/10_SUPABASE_MIGRATION_GOVERNED_STEP.md",
    stagedMigrationFile: "supabase/migrations/20260528_awos_live_queue.sql"
  };
}

export function getAwosEndGoal() {
  return {
    mission: "Governed autonomous wealth operating system",
    loop: [
      "rehydrate source truth",
      "discover and score opportunities",
      "reverse engineer winning patterns",
      "generate offers, funnels, and content systems",
      "route governed work",
      "materialize execution queues",
      "trigger recurring runtime automation",
      "stop at approval gates",
      "measure signal and optimize",
      "replicate winners"
    ]
  };
}

export function getAwosSourceTruthChecklist() {
  const pack = getAwosHandoffPack();
  return [
    pack.sourceOfTruthMap,
    pack.endGoal,
    pack.reverseEngineeredExecutionMap,
    pack.fullAutomationWorkflow,
    pack.agentRegistry,
    pack.queueSchemaDraft,
    pack.workflowAndCronPlan,
    pack.buildPacket,
    pack.governedMigrationStep,
    pack.stagedMigrationFile
  ];
}

export function materializeAwosQueue(input: { timestamp: string; blocker: string; approvalEscalationNeeded: boolean }) {
  const pack = getAwosHandoffPack();

  const items = [
    {
      id: `source-truth-${input.timestamp}`,
      type: "source-truth-reconciliation",
      priority: 95,
      approvalRequired: false,
      status: "ready",
      source: pack.sourceOfTruthMap
    },
    {
      id: `workflow-${input.timestamp}`,
      type: "workflow-loop-refresh",
      priority: 88,
      approvalRequired: false,
      status: "ready",
      source: pack.fullAutomationWorkflow
    },
    {
      id: `queue-${input.timestamp}`,
      type: "queue-materialization",
      priority: 84,
      approvalRequired: false,
      status: "ready",
      source: pack.queueSchemaDraft
    },
    {
      id: `migration-${input.timestamp}`,
      type: "supabase-queue-activation",
      priority: 70,
      approvalRequired: true,
      status: "staged",
      source: pack.stagedMigrationFile
    }
  ];

  if (input.approvalEscalationNeeded) {
    items.push({
      id: `approval-${input.timestamp}`,
      type: "approval-escalation-review",
      priority: 98,
      approvalRequired: true,
      status: "awaiting-approval",
      source: pack.governedMigrationStep
    });
  }

  return {
    queueName: "awos_recursive_control_queue",
    blocker: input.blocker,
    generatedAt: input.timestamp,
    items
  };
}

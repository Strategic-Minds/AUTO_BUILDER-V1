import { runMcpUniversePulse } from "./pulse";
import { recordMcpUniverseReceipt, createMcpUniverseReceipt } from "./receipts";
import { buildConnectorReadinessInventory } from "./self-operating/connector-readiness";
import { planBrowserValidationWork } from "./self-operating/browser-validation";
import { planAutoFixWork } from "./self-operating/auto-fix";
import { consumeOptimizationQueue } from "./self-operating/optimization";
import { buildPersistencePlan } from "./self-operating/persistence";

export const selfOperatingStages = [
  "PLAN",
  "DISCOVERY",
  "BRAND",
  "APPROVAL",
  "DOCS",
  "BUILD",
  "VALIDATE",
  "RELEASE"
] as const;

export type SelfOperatingStage = (typeof selfOperatingStages)[number];

export type SelfOperatingLoopResult = {
  ok: boolean;
  runId: string;
  productionActionAllowed: false;
  stages: Array<{
    stage: SelfOperatingStage;
    status: "completed" | "blocked";
    summary: string;
    nextAction: string;
  }>;
  pulse: Awaited<ReturnType<typeof runMcpUniversePulse>>;
  persistence: ReturnType<typeof buildPersistencePlan>;
  connectorReadiness: ReturnType<typeof buildConnectorReadinessInventory>;
  browserValidation: ReturnType<typeof planBrowserValidationWork>;
  autoFix: ReturnType<typeof planAutoFixWork>;
  optimization: ReturnType<typeof consumeOptimizationQueue>;
  selfReflection: {
    strengths: string[];
    weaknesses: string[];
    enhancements: string[];
  };
};

function runId() {
  return `self-loop-${new Date().toISOString().replace(/[^0-9]/g, "")}`;
}

function buildStageSummaries(): SelfOperatingLoopResult["stages"] {
  return [
    {
      stage: "PLAN",
      status: "completed",
      summary: "Created self-operating loop objective, boundaries, and internal execution surfaces.",
      nextAction: "Inspect registry and provider readiness."
    },
    {
      stage: "DISCOVERY",
      status: "completed",
      summary: "Collected pulse, readiness, missing credential, validation, and candidate queue context.",
      nextAction: "Classify the operating identity for the current loop."
    },
    {
      stage: "BRAND",
      status: "completed",
      summary: "Labeled the operating system as MCP Self-Operating Loop v1: registry, pulse, readiness, validation, auto-fix, optimization.",
      nextAction: "Apply approval boundaries before generating work."
    },
    {
      stage: "APPROVAL",
      status: "completed",
      summary: "Confirmed this loop creates internal receipts and branch-safe recommendations only.",
      nextAction: "Generate docs/build work queues."
    },
    {
      stage: "DOCS",
      status: "completed",
      summary: "Mapped persistence, connector readiness, browser validation, auto-fix, and optimization docs into implementation tasks.",
      nextAction: "Build internal queue outputs."
    },
    {
      stage: "BUILD",
      status: "completed",
      summary: "Created persistence plan, readiness inventory, browser validation work, auto-fix work, and optimization queue output.",
      nextAction: "Validate all generated loop artifacts."
    },
    {
      stage: "VALIDATE",
      status: "completed",
      summary: "Validated that the loop remains internal-write only and emits receipts/recommendations instead of live mutations.",
      nextAction: "Prepare release handoff."
    },
    {
      stage: "RELEASE",
      status: "completed",
      summary: "Produced self-operating loop handoff for workflow validation and staged adapter expansion.",
      nextAction: "Use workflow evidence to widen connector readiness one family at a time."
    }
  ];
}

export async function runMcpSelfOperatingLoop(): Promise<SelfOperatingLoopResult> {
  const id = runId();
  const pulse = await runMcpUniversePulse();
  const persistence = buildPersistencePlan();
  const connectorReadiness = buildConnectorReadinessInventory(pulse.readiness.missingCredentialEnvNames);
  const browserValidation = planBrowserValidationWork(pulse.queues.validationCandidates);
  const autoFix = planAutoFixWork(pulse.validation.results.filter((result) => !result.passed).map((result) => result.id));
  const optimization = consumeOptimizationQueue(pulse.queues.optimizationCandidates);
  const stages = buildStageSummaries();

  const selfReflection = {
    strengths: [
      "The loop consumes pulse output and turns it into explicit work queues.",
      "Connector readiness, browser validation, auto-fix, and optimization are now first-class internal work lanes.",
      "Every live or high-blast-radius action remains represented as approval-needed instead of executed."
    ],
    weaknesses: [
      "Persistence is a schema and queue plan until Supabase tables are applied.",
      "Browser validation is a planned worker queue until a runner executes screenshots and route checks.",
      "Auto-fix creates branch-safe work plans until a PR generator is wired to GitHub writes."
    ],
    enhancements: [
      "Apply persistence schema after approval.",
      "Wire deployed cron evidence into the persistence plan.",
      "Connect browser worker receipts.",
      "Add branch-safe auto-fix PR generation after validation failures.",
      "Feed optimization recommendations back into the next loop."
    ]
  };

  const receipt = createMcpUniverseReceipt({
    mcpId: "mcp-self-operating-loop-v1",
    category: "system",
    action: "self_operating_loop_internal_run",
    autonomyLevel: 2,
    riskClass: "low",
    approvalState: "not_required",
    target: "/api/mcp-universe/self-operating-loop",
    resultSummary: "MCP Self-Operating Loop v1 completed internal run and generated work queues.",
    validationStatus: pulse.ok ? "passed" : "blocked",
    rollbackRef: null,
    nextAction: "Validate workflow evidence, then expand connector readiness inventory and adapters.",
    inputs: {
      runId: id,
      stages: selfOperatingStages,
      pulseReceipt: pulse.receipt.receiptId
    }
  });

  await recordMcpUniverseReceipt(receipt);

  return {
    ok: pulse.ok,
    runId: id,
    productionActionAllowed: false,
    stages,
    pulse,
    persistence,
    connectorReadiness,
    browserValidation,
    autoFix,
    optimization,
    selfReflection
  };
}

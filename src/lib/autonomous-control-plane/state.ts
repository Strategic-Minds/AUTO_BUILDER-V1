export type ControlPlaneTask = {
  id: string;
  lane: "BUILD" | "VALIDATE" | "DEPLOY" | "MONETIZE" | "DISTRIBUTE" | "OPERATE";
  title: string;
  status: "ready" | "done" | "blocked";
  riskClass: 1 | 2 | 3 | 4 | 5;
  mutation: boolean;
  approvalRequired: boolean;
  nextAction: string;
};

export const awosLoop = [
  "DISCOVER",
  "VALIDATE",
  "BRAND",
  "BUILD",
  "DEPLOY",
  "DISTRIBUTE",
  "MONETIZE",
  "ANALYZE",
  "OPTIMIZE",
  "SCALE",
  "REPLICATE",
  "REPEAT"
] as const;

export const clientJourneySteps = [
  "Choose Package",
  "Secure Payment",
  "Schedule Call",
  "Share Your Idea",
  "We Plan Your System",
  "MVP Development",
  "Review & Feedback",
  "Launch Your System",
  "Automated Updates",
  "Scale & Optimize"
] as const;

export function getAutonomousControlPlaneState() {
  return {
    system: {
      name: "Strategic Minds AWOS Autonomous Control Plane",
      mode: "preview_sandbox_autonomous",
      productionActionAllowed: false,
      readinessScore: 70,
      loop: awosLoop
    },
    clientJourney: {
      clientName: "John",
      package: "MVP System Build Package",
      amountPaid: 2997,
      currentStep: 4,
      steps: clientJourneySteps,
      documents: ["Project Brief", "Strategy Blueprint", "MVP Roadmap"]
    },
    queues: [
      {
        id: "q-001",
        lane: "BUILD",
        title: "Strategic Minds client dashboard preview",
        status: "done",
        riskClass: 1,
        mutation: false,
        approvalRequired: false,
        nextAction: "Preview route renders packages, journey, approvals, and receipts."
      },
      {
        id: "q-002",
        lane: "VALIDATE",
        title: "Autonomous loop dry-run receipt",
        status: "done",
        riskClass: 1,
        mutation: false,
        approvalRequired: false,
        nextAction: "Dry-run route can execute without live mutation."
      },
      {
        id: "q-003",
        lane: "DEPLOY",
        title: "Production deploy or protected branch merge",
        status: "blocked",
        riskClass: 4,
        mutation: true,
        approvalRequired: true,
        nextAction: "Requires preview evidence and explicit production approval."
      },
      {
        id: "q-004",
        lane: "MONETIZE",
        title: "Live checkout, billing, or pricing mutation",
        status: "blocked",
        riskClass: 4,
        mutation: true,
        approvalRequired: true,
        nextAction: "Requires pricing approval and live billing approval."
      },
      {
        id: "q-005",
        lane: "DISTRIBUTE",
        title: "External publishing or outreach",
        status: "blocked",
        riskClass: 3,
        mutation: true,
        approvalRequired: true,
        nextAction: "Requires content/channel approval before publishing."
      }
    ] satisfies ControlPlaneTask[],
    approvals: [
      { id: "approval-production-deploy", label: "Production deploy / merge", status: "required", riskClass: 4 },
      { id: "approval-live-billing", label: "Live billing or payment mutation", status: "required", riskClass: 4 },
      { id: "approval-external-publishing", label: "External publishing or outreach", status: "required", riskClass: 3 }
    ]
  };
}

export function buildAutonomousDryRunReceipt() {
  const state = getAutonomousControlPlaneState();
  return {
    ok: true,
    receiptId: `autonomous-control-plane-${new Date().toISOString().replace(/[^0-9]/g, "")}`,
    mode: state.system.mode,
    productionActionAllowed: false,
    stages: awosLoop.map((stage) => ({ stage, status: "checked", mutation: false })),
    completedTasks: state.queues.filter((task) => task.status === "done" && !task.mutation),
    blockedTasks: state.queues.filter((task) => task.approvalRequired || task.status === "blocked"),
    nextAction: "Collect preview/browser evidence, then request explicit production approval only if validation passes."
  };
}

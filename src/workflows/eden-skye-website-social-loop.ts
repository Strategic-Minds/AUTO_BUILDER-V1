import { buildEdenSkyeLoopDryRun } from "@/lib/eden-skye/website-social-loop";

type EdenSkyeLoopTrigger = {
  requestedAt?: string;
  source?: string;
  bucketKey?: string;
};

async function collectEdenLoopState(trigger: EdenSkyeLoopTrigger) {
  "use step";

  const now = trigger.requestedAt ?? new Date().toISOString();
  const dryRun = buildEdenSkyeLoopDryRun();

  return {
    now,
    source: trigger.source ?? "vercel-workflow",
    bucketKey: trigger.bucketKey ?? now.slice(0, 16),
    dryRun,
    gates: {
      allowDriveWrite: false,
      allowPaymentActivation: false,
      allowPublicPosting: false,
      allowAdultContentPublishing: false,
      allowPaidGeneration: false,
      allowProductionDeploy: false
    }
  };
}

async function planWebsiteBackend(state: Awaited<ReturnType<typeof collectEdenLoopState>>) {
  "use step";

  return {
    queue: "website_build_queue",
    status: "planned",
    targetDomain: state.dryRun.readiness.targetDomain,
    frontend: [
      "homepage built to feed social content capture and model discovery",
      "model and faceless account directory pages",
      "Eden's Closet landing page",
      "Black Card membership information page",
      "age gate and sign-in surfaces",
      "approval-gated premium content UX states"
    ],
    backend: [
      "model registry API",
      "content queue API",
      "Metricool draft queue API",
      "Shopify/Xyla draft packet API",
      "membership draft checkout API",
      "age-gate receipt API",
      "quarantine and validation APIs",
      "agent memory/reflection API"
    ],
    noProductionDeploy: true
  };
}

async function planAutomationQueues(state: Awaited<ReturnType<typeof collectEdenLoopState>>) {
  "use step";

  return {
    queue: "eden_automation_queues",
    status: "planned",
    queues: state.dryRun.queuesToMaterialize.map((name) => ({
      name,
      mode: name.includes("approval") || name.includes("membership") ? "approval_required" : "draft_only"
    })),
    noPosting: true,
    noPayment: true
  };
}

async function planValidationAndRecovery() {
  "use step";

  return {
    queue: "eden_validation_recovery",
    status: "planned",
    validators: [
      "website route health",
      "age gate and compliance copy presence",
      "model/persona registry completeness",
      "asset safety class and quarantine routing",
      "Metricool draft schema",
      "Shopify/Xyla draft schema",
      "membership product/entitlement schema",
      "approval gate status",
      "receipt and memory write health"
    ],
    autoHealAllowed: [
      "retry dry-run validation",
      "regenerate draft copy",
      "repair metadata",
      "queue missing manifest rows",
      "open fix tasks or PRs"
    ],
    blockedAutoHeal: [
      "public posting",
      "billing activation",
      "adult content publishing",
      "Drive writes",
      "production deploys"
    ]
  };
}

export async function edenSkyeWebsiteSocialLoopWorkflow(trigger: EdenSkyeLoopTrigger = {}) {
  "use workflow";

  const state = await collectEdenLoopState(trigger);
  const websiteBackendPlan = await planWebsiteBackend(state);
  const automationQueues = await planAutomationQueues(state);
  const validationAndRecovery = await planValidationAndRecovery();

  return {
    ok: true,
    productionActionAllowed: false,
    timestamp: state.now,
    source: state.source,
    bucketKey: state.bucketKey,
    gates: state.gates,
    readiness: state.dryRun.readiness,
    agents: state.dryRun.agents,
    workflow: state.dryRun.workflow,
    websiteBackendPlan,
    automationQueues,
    validationAndRecovery,
    noMutationPerformed: true,
    nextAction: "Deploy preview, run /api/eden-skye/loop?dryRun=full, then request explicit approval for any Drive write, payment activation, public posting, or paid generation."
  };
}

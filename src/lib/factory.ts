export type FastPathRoute = {
  ideaType: string;
  classificationSignal: string;
  defaultStackRoute: string;
  requiredModules: string[];
  riskClass: "low" | "medium" | "high" | "critical";
  validationProfile: string[];
  speedPath: "Fast Path" | "Sandbox First";
  humanApprovalTrigger: string;
};

export type TemplatePack = {
  id: string;
  name: string;
  useCase: string;
  frontendModules: string[];
  backendModules: string[];
  queueModules: string[];
  status: "Ready" | "Draft" | "Blocked";
  reuseScore: number;
  hardeningRequired: string;
};

export type ConnectorOps = {
  connector: string;
  purpose: string;
  requiredSecrets: string[];
  mutationSurface: string;
  fallbackReceiptMode: string;
  readiness: "Ready" | "Partial" | "Blocked";
  approvalGate: string;
  testCommand: string;
};

export type HardeningTest = {
  id: string;
  layer: string;
  test: string;
  passCondition: string;
  failureAction: string;
  required: boolean;
  automationSurface: string;
  evidenceArtifact: string;
};

export type CapabilityTest = {
  id: string;
  surface: string;
  objective: string;
  successSignal: string;
  fallback: string;
};

export type ReverseEngineeringLane = {
  id: string;
  lane: string;
  sourceClass: string;
  passiveCadence: string;
  output: string[];
  approvalNeeded: string;
};

export const factoryReadiness = {
  factoryReadinessScore: 47,
  templateCoverage: 68,
  connectorReadiness: 4,
  hardeningCoverage: 68,
  oneHourEligibility: 18,
  operatingStandard:
    "50 ideas/day triage, one-hour build packets for standard modules, governed releases, reusable assets, and rollback-first execution.",
  blockers: [
    "Canonical repo still needs the one-hour factory installed end to end",
    "Connector mutations are still uneven across GitHub, Vercel, Supabase, Shopify, Xyla, Opus, and Slack",
    "Secrets and sandbox mutation surfaces are not fully connected",
    "Template packs exist conceptually but not yet as installed repo modules"
  ],
  nextActions: [
    "Install core factory schema and queue runner",
    "Add the first reusable template packs and build-packet router",
    "Wire capability tests and passive reverse-engineering crons",
    "Promote hardening and rollback evidence into release gates"
  ]
} as const;

export const fastPathRoutes: FastPathRoute[] = [
  {
    ideaType: "Lead magnet funnel",
    classificationSignal: "Offer plus audience plus capture need",
    defaultStackRoute: "Next.js landing + Supabase leads + email webhook",
    requiredModules: ["landing", "form", "lead-table", "thank-you", "analytics"],
    riskClass: "medium",
    validationProfile: ["form smoke", "attribution event"],
    speedPath: "Fast Path",
    humanApprovalTrigger: "External send or spend"
  },
  {
    ideaType: "Client dashboard",
    classificationSignal: "Metrics or control surface requirement",
    defaultStackRoute: "Next.js dashboard + Supabase views",
    requiredModules: ["auth", "kpi-cards", "tables", "exports"],
    riskClass: "medium",
    validationProfile: ["auth test", "RLS test", "route smoke"],
    speedPath: "Fast Path",
    humanApprovalTrigger: "Live client data exposure"
  },
  {
    ideaType: "Shopify growth app",
    classificationSignal: "Commerce or store optimization",
    defaultStackRoute: "Shopify API + Next.js admin + Supabase logs",
    requiredModules: ["product-sync", "recommendations", "events", "audit-log"],
    riskClass: "high",
    validationProfile: ["API sandbox", "webhook replay"],
    speedPath: "Sandbox First",
    humanApprovalTrigger: "Store write actions"
  },
  {
    ideaType: "AI voice workflow",
    classificationSignal: "Inbound or outbound call automation",
    defaultStackRoute: "Voice provider + Supabase calls + agent scripts",
    requiredModules: ["call-logs", "prompts", "escalation", "crm-sync"],
    riskClass: "high",
    validationProfile: ["consent review", "call safety eval"],
    speedPath: "Sandbox First",
    humanApprovalTrigger: "Outbound calls"
  },
  {
    ideaType: "Content engine",
    classificationSignal: "Generate, repurpose, or publish assets",
    defaultStackRoute: "Xyla or Opus + queue + approval UI",
    requiredModules: ["asset-queue", "prompt-pack", "publishing-gate"],
    riskClass: "high",
    validationProfile: ["approval test", "platform compliance"],
    speedPath: "Sandbox First",
    humanApprovalTrigger: "Auto-publish"
  },
  {
    ideaType: "Internal agent",
    classificationSignal: "Back-office reasoning or ops task",
    defaultStackRoute: "OpenAI routing + Supabase state + Slack approval",
    requiredModules: ["agent-config", "tools", "logs", "evals"],
    riskClass: "medium",
    validationProfile: ["tool-permission eval"],
    speedPath: "Fast Path",
    humanApprovalTrigger: "Irreversible tools"
  },
  {
    ideaType: "SaaS MVP",
    classificationSignal: "Reusable product with users",
    defaultStackRoute: "Next.js + Supabase + billing + Vercel",
    requiredModules: ["auth", "billing", "dashboard", "crud", "logs"],
    riskClass: "high",
    validationProfile: ["auth tests", "billing tests", "rollback tests"],
    speedPath: "Sandbox First",
    humanApprovalTrigger: "Payments or live users"
  },
  {
    ideaType: "Attribution ledger",
    classificationSignal: "Track source to revenue",
    defaultStackRoute: "Supabase events + dashboard + UTM mapping",
    requiredModules: ["events", "mapping", "revenue-tables", "reports"],
    riskClass: "medium",
    validationProfile: ["data integrity tests"],
    speedPath: "Fast Path",
    humanApprovalTrigger: "Revenue system writes"
  },
  {
    ideaType: "Automation bridge",
    classificationSignal: "Connect tools, APIs, or workflows",
    defaultStackRoute: "Queue runner + webhooks + receipts",
    requiredModules: ["connector", "retries", "receipts", "dead-letter"],
    riskClass: "high",
    validationProfile: ["replay test", "idempotency"],
    speedPath: "Sandbox First",
    humanApprovalTrigger: "Live API mutation"
  },
  {
    ideaType: "Research or intelligence system",
    classificationSignal: "Market scan or scoring need",
    defaultStackRoute: "Crawler or search + scoring + dashboard",
    requiredModules: ["research-queue", "scoring", "decision-log"],
    riskClass: "medium",
    validationProfile: ["source separation", "citation check"],
    speedPath: "Fast Path",
    humanApprovalTrigger: "External publishing"
  }
];

export const templateLibrary: TemplatePack[] = [
  {
    id: "TPL-001",
    name: "Landing + Lead Capture",
    useCase: "Offers, waitlists, lead magnets",
    frontendModules: ["hero", "cta", "form", "proof", "faq"],
    backendModules: ["leads", "attribution_events"],
    queueModules: ["lead_enrichment_queue"],
    status: "Ready",
    reuseScore: 95,
    hardeningRequired: "Standard"
  },
  {
    id: "TPL-002",
    name: "Auth Dashboard",
    useCase: "Client or admin control planes",
    frontendModules: ["auth", "kpi-cards", "data-grid"],
    backendModules: ["profiles", "roles", "audit_logs"],
    queueModules: ["approval_queue"],
    status: "Ready",
    reuseScore: 92,
    hardeningRequired: "Strict RLS"
  },
  {
    id: "TPL-004",
    name: "AI Agent Console",
    useCase: "Governed agents and tools",
    frontendModules: ["agent-cards", "run-logs", "eval-tabs"],
    backendModules: ["agents", "runs", "tool_receipts"],
    queueModules: ["agent_run_queue"],
    status: "Ready",
    reuseScore: 96,
    hardeningRequired: "Tool permission tests"
  },
  {
    id: "TPL-005",
    name: "Workflow Queue Runner",
    useCase: "Background jobs and retries",
    frontendModules: ["queue-monitor", "dead-letter-view"],
    backendModules: ["queues", "jobs", "receipts"],
    queueModules: ["worker_queue"],
    status: "Ready",
    reuseScore: 98,
    hardeningRequired: "Idempotency"
  },
  {
    id: "TPL-010",
    name: "Financial Forecast Panel",
    useCase: "Revenue and cash-flow models",
    frontendModules: ["forecast-table", "scenario-cards"],
    backendModules: ["forecasts", "assumptions"],
    queueModules: ["forecast_queue"],
    status: "Ready",
    reuseScore: 91,
    hardeningRequired: "Assumption audit"
  }
];

export const connectorOps: ConnectorOps[] = [
  {
    connector: "GitHub",
    purpose: "Repo, branches, PRs, code reviews",
    requiredSecrets: ["GITHUB_TOKEN"],
    mutationSurface: "Create branch, PR, and file updates",
    fallbackReceiptMode: "Patch file export + manual PR",
    readiness: "Blocked",
    approvalGate: "Live repo writes",
    testCommand: "Create sandbox branch"
  },
  {
    connector: "Vercel",
    purpose: "Preview and production deploys",
    requiredSecrets: ["VERCEL_TOKEN", "VERCEL_PROJECT_ID"],
    mutationSurface: "Deploy, rollback, env vars",
    fallbackReceiptMode: "Manual dashboard deploy",
    readiness: "Blocked",
    approvalGate: "Production deploy",
    testCommand: "Preview deploy smoke"
  },
  {
    connector: "Supabase",
    purpose: "DB, auth, storage, queues, and logs",
    requiredSecrets: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY"],
    mutationSurface: "Migrations, RLS, and functions",
    fallbackReceiptMode: "SQL file handoff",
    readiness: "Blocked",
    approvalGate: "Service role writes",
    testCommand: "Run migration dry run"
  },
  {
    connector: "Shopify",
    purpose: "Commerce source truth",
    requiredSecrets: ["SHOPIFY_ADMIN_TOKEN", "SHOPIFY_SHOP"],
    mutationSurface: "Products, orders, and webhooks",
    fallbackReceiptMode: "CSV or export import",
    readiness: "Blocked",
    approvalGate: "Store mutations",
    testCommand: "Webhook sandbox event"
  },
  {
    connector: "OpenAI Platform",
    purpose: "Models, orchestration, and evals",
    requiredSecrets: ["OPENAI_API_KEY"],
    mutationSurface: "Responses, evals, and files",
    fallbackReceiptMode: "Prompt-only fallback",
    readiness: "Partial",
    approvalGate: "Spend or model changes",
    testCommand: "Eval smoke test"
  },
  {
    connector: "Codex",
    purpose: "Code generation and patching",
    requiredSecrets: ["OPENAI_API_KEY"],
    mutationSurface: "Code patches and tests",
    fallbackReceiptMode: "Manual patch export",
    readiness: "Partial",
    approvalGate: "Merge or deploy",
    testCommand: "Patch dry run"
  },
  {
    connector: "Playwright",
    purpose: "Browser automation and tests",
    requiredSecrets: [],
    mutationSurface: "Smoke tests and actions",
    fallbackReceiptMode: "Screenshot receipts",
    readiness: "Ready",
    approvalGate: "External submissions",
    testCommand: "Run e2e smoke"
  },
  {
    connector: "Xyla",
    purpose: "Creative and publishing engine",
    requiredSecrets: ["XYLA_API_KEY"],
    mutationSurface: "Assets and publish jobs",
    fallbackReceiptMode: "Manual upload",
    readiness: "Blocked",
    approvalGate: "Auto-publish",
    testCommand: "Generate sandbox asset"
  },
  {
    connector: "Opus",
    purpose: "Video repurposing",
    requiredSecrets: ["OPUS_CREDS"],
    mutationSurface: "Import and export video assets",
    fallbackReceiptMode: "Manual export",
    readiness: "Blocked",
    approvalGate: "Publishing",
    testCommand: "Repurpose test asset"
  },
  {
    connector: "Slack",
    purpose: "Approvals and escalation",
    requiredSecrets: ["SLACK_BOT_TOKEN"],
    mutationSurface: "Send and receive approvals",
    fallbackReceiptMode: "Email or manual approval",
    readiness: "Blocked",
    approvalGate: "External messages",
    testCommand: "Send sandbox approval"
  }
];

export const hardeningPipeline: HardeningTest[] = [
  {
    id: "H-001",
    layer: "Schema",
    test: "Migration dry run",
    passCondition: "No SQL errors",
    failureAction: "Block build",
    required: true,
    automationSurface: "Supabase CLI",
    evidenceArtifact: "migration log"
  },
  {
    id: "H-002",
    layer: "Schema",
    test: "RLS policy audit",
    passCondition: "All user tables protected",
    failureAction: "Block release",
    required: true,
    automationSurface: "SQL test",
    evidenceArtifact: "RLS report"
  },
  {
    id: "H-003",
    layer: "Backend",
    test: "API route smoke",
    passCondition: "200 or expected errors only",
    failureAction: "Patch route",
    required: true,
    automationSurface: "API smoke",
    evidenceArtifact: "route report"
  },
  {
    id: "H-004",
    layer: "Frontend",
    test: "Page render smoke",
    passCondition: "No runtime crash",
    failureAction: "Patch UI",
    required: true,
    automationSurface: "Playwright",
    evidenceArtifact: "screenshots"
  },
  {
    id: "H-005",
    layer: "Queue",
    test: "Job replay test",
    passCondition: "Idempotent success",
    failureAction: "Block worker",
    required: true,
    automationSurface: "Queue runner",
    evidenceArtifact: "receipt log"
  },
  {
    id: "H-006",
    layer: "Queue",
    test: "Dead-letter handling",
    passCondition: "Failed jobs captured",
    failureAction: "Patch worker",
    required: true,
    automationSurface: "Queue runner",
    evidenceArtifact: "DLQ log"
  },
  {
    id: "H-007",
    layer: "Governance",
    test: "Approval gate test",
    passCondition: "High risk blocked",
    failureAction: "Patch policy",
    required: true,
    automationSurface: "Unit or e2e",
    evidenceArtifact: "approval record"
  },
  {
    id: "H-008",
    layer: "Deploy",
    test: "Vercel preview smoke",
    passCondition: "Preview URL healthy",
    failureAction: "Block deploy",
    required: true,
    automationSurface: "Vercel + Playwright",
    evidenceArtifact: "preview receipt"
  },
  {
    id: "H-009",
    layer: "Rollback",
    test: "Rollback ref exists",
    passCondition: "Rollback path documented",
    failureAction: "Block production",
    required: true,
    automationSurface: "Git or Vercel",
    evidenceArtifact: "rollback runbook"
  },
  {
    id: "H-010",
    layer: "Security",
    test: "Secrets scan",
    passCondition: "No secrets committed",
    failureAction: "Rotate or remove",
    required: true,
    automationSurface: "GitHub action",
    evidenceArtifact: "scan report"
  }
];

export const capabilityTests: CapabilityTest[] = [
  {
    id: "CAP-001",
    surface: "Idea Router",
    objective: "Classify 10 sample ideas into valid one-hour routes",
    successSignal: "Route confidence >= 80 or clean escalation",
    fallback: "Human route review"
  },
  {
    id: "CAP-002",
    surface: "Template Factory",
    objective: "Assemble build packets from template bundles",
    successSignal: "Required modules mapped with no missing core pack",
    fallback: "Generic scaffold packet"
  },
  {
    id: "CAP-003",
    surface: "Connector Ops",
    objective: "Measure direct mutation vs fallback receipt for every connector",
    successSignal: "Readiness state and workaround logged",
    fallback: "Manual bridge packet"
  },
  {
    id: "CAP-004",
    surface: "Reverse Engineering",
    objective: "Capture public architecture, workflows, offers, assets, and signals from target systems",
    successSignal: "Evidence pack, diff log, template extraction, and risk classification created",
    fallback: "Research-only mode"
  },
  {
    id: "CAP-005",
    surface: "Hardening",
    objective: "Run universal hardening profile before release recommendation",
    successSignal: "Required tests all pass or exact patch list produced",
    fallback: "Hold release"
  }
];

export const reverseEngineeringLanes: ReverseEngineeringLane[] = [
  {
    id: "RE-001",
    lane: "Public surface capture",
    sourceClass: "Public sites, landing pages, docs, social, pricing, and product surfaces",
    passiveCadence: "Nightly",
    output: ["surface inventory", "UI snapshots", "offer map"],
    approvalNeeded: "None for public read-only capture"
  },
  {
    id: "RE-002",
    lane: "Workflow trace extraction",
    sourceClass: "Public demos, onboarding flows, help centers, and visible automation traces",
    passiveCadence: "Nightly",
    output: ["workflow map", "queue map", "risk map"],
    approvalNeeded: "None for public read-only capture"
  },
  {
    id: "RE-003",
    lane: "Capability diffing",
    sourceClass: "Competitor and benchmark systems",
    passiveCadence: "Daily",
    output: ["capability diff", "copy or counter recommendation", "template candidates"],
    approvalNeeded: "None"
  },
  {
    id: "RE-004",
    lane: "Asset and prompt extraction",
    sourceClass: "Visible assets, public messaging, public case studies, and connected internal artifacts",
    passiveCadence: "Nightly",
    output: ["asset ledger candidates", "prompt patterns", "case-study structure"],
    approvalNeeded: "Approval for non-public connected sources"
  },
  {
    id: "RE-005",
    lane: "Passive capability tests",
    sourceClass: "Internal repo, connector receipts, browser flows, and bridge state",
    passiveCadence: "Hourly",
    output: ["readiness delta", "blocked surface list", "workaround queue"],
    approvalNeeded: "None unless a live mutation test is requested"
  }
];

const keywordRoutes = [
  { route: "Shopify growth app", terms: ["shopify", "store", "revenue recovery", "product page", "cart"] },
  { route: "Lead magnet funnel", terms: ["lead magnet", "waitlist", "opt-in", "landing page", "funnel"] },
  { route: "Client dashboard", terms: ["dashboard", "portal", "kpi", "analytics", "control plane"] },
  { route: "AI voice workflow", terms: ["voice", "call", "sms", "phone", "speed-to-lead"] },
  { route: "Content engine", terms: ["content", "social", "video", "repurpose", "publish"] },
  { route: "Internal agent", terms: ["agent", "assistant", "automation", "copilot"] },
  { route: "SaaS MVP", terms: ["saas", "app", "platform", "mvp", "subscription"] },
  { route: "Attribution ledger", terms: ["attribution", "utm", "campaign", "revenue"] },
  { route: "Automation bridge", terms: ["bridge", "webhook", "integration", "queue", "workflow"] },
  { route: "Research or intelligence system", terms: ["research", "intelligence", "competitor", "benchmark", "prediction", "simulation"] }
] as const;

export function classifyIdea(idea: string) {
  const normalized = idea.toLowerCase();
  const match = keywordRoutes.find((candidate) =>
    candidate.terms.some((term) => normalized.includes(term))
  );
  const selected = fastPathRoutes.find((route) => route.ideaType === (match?.route ?? "Internal agent")) ?? fastPathRoutes[5];
  const confidence = match ? 86 : 72;

  return {
    route: selected,
    confidence,
    escalationRequired: confidence < 80 || selected.riskClass === "high"
  };
}

export function buildPacketFromIdea(idea: string) {
  const { route, confidence, escalationRequired } = classifyIdea(idea);
  const matchingTemplates = templateLibrary.filter((template) => {
    const haystack = `${template.name} ${template.useCase}`.toLowerCase();
    return route.requiredModules.some((module) => haystack.includes(module.replace(/-/g, " ")));
  });

  return {
    ideaBrief: {
      rawText: idea,
      desiredOutcome: route.ideaType,
      speedTarget: route.speedPath
    },
    classification: {
      route: route.ideaType,
      riskClass: route.riskClass,
      confidence,
      escalationRequired
    },
    economicCase: {
      revenueHypothesis: "To be scored by commercial engine",
      marginHypothesis: "To be scored by commercial engine",
      speedToCash: route.speedPath === "Fast Path" ? "high" : "medium"
    },
    architecture: {
      stack: route.defaultStackRoute,
      requiredModules: route.requiredModules,
      validationProfile: route.validationProfile
    },
    templateBundle: matchingTemplates.map((template) => ({
      id: template.id,
      name: template.name,
      status: template.status
    })),
    workflowPlan: {
      queues: ["idea_intake_queue", "build_router_queue", "template_pull_queue", "hardening_queue"],
      approvalTrigger: route.humanApprovalTrigger
    },
    releasePlan: {
      mode: route.speedPath,
      rollbackRequired: true,
      approvalRequired: route.riskClass === "high" || route.humanApprovalTrigger !== "None"
    }
  };
}

export function buildPassiveReverseEngineeringPlan(target: string) {
  return {
    target,
    coverageGoal:
      "Maximum lawful public and connected-source coverage. Hidden private internals cannot be guaranteed, but structure, offers, workflows, assets, and visible capability can be reverse engineered to the highest grounded level.",
    lanes: reverseEngineeringLanes,
    cadence: {
      nightly: ["public surface capture", "workflow trace extraction", "asset and prompt extraction"],
      daily: ["capability diffing"],
      hourly: ["passive capability tests"]
    },
    outputs: [
      "evidence ledger",
      "architecture map",
      "offer map",
      "queue and workflow map",
      "template extraction candidates",
      "capability delta report",
      "workaround queue"
    ],
    safeExecutionRule:
      "Read-only by default while offline. Any live mutation, login-required action, or external message requires explicit approval and a governed execution surface."
  };
}

export function buildCapabilityTestMatrix() {
  return {
    readiness: factoryReadiness,
    connectors: connectorOps,
    tests: capabilityTests,
    hardening: hardeningPipeline
  };
}

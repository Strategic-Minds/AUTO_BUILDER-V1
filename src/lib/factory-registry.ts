export type FactorySchemaEntry = {
  object: string;
  purpose: string;
  keyFields: string[];
  governance: string;
  queueLink: string;
  priority: number;
};

export type QueueAgentEntry = {
  queue: string;
  trigger: string;
  agentOwner: string;
  input: string;
  output: string;
  retryPolicy: string;
  deadLetterRule: string;
  approvalRequirement: string;
  slaTarget: string;
};

export type AssetFactoryEntry = {
  assetType: string;
  examples: string[];
  storageLocation: string;
  reuseRule: string;
  versioning: string;
  qualityGate: string;
  compoundingBenefit: string;
};

export type BuildPacketSection = {
  section: string;
  requiredFields: string[];
  purpose: string;
  generatedBy: string;
  validation: string;
};

export const factorySchema: FactorySchemaEntry[] = [
  {
    object: "ideas",
    purpose: "Raw inbound ideas",
    keyFields: ["id", "source", "raw_text", "user", "created_at"],
    governance: "owner or admin",
    queueLink: "idea_intake_queue",
    priority: 1
  },
  {
    object: "build_cards",
    purpose: "Normalized build requests",
    keyFields: ["id", "idea_id", "route", "risk", "status", "estimate"],
    governance: "owner or admin",
    queueLink: "build_router_queue",
    priority: 1
  },
  {
    object: "templates",
    purpose: "Reusable modules",
    keyFields: ["id", "pack", "version", "status", "reuse_score"],
    governance: "read all, write admin",
    queueLink: "template_pull_queue",
    priority: 1
  },
  {
    object: "template_assets",
    purpose: "Prompts, code, UI, workflows",
    keyFields: ["id", "template_id", "asset_type", "path", "checksum"],
    governance: "read all, write admin",
    queueLink: "asset_factory_queue",
    priority: 1
  },
  {
    object: "agents",
    purpose: "Agent manifests",
    keyFields: ["id", "name", "tools", "autonomy", "approval_rules"],
    governance: "read all, write admin",
    queueLink: "agent_run_queue",
    priority: 1
  },
  {
    object: "agent_runs",
    purpose: "Agent execution logs",
    keyFields: ["id", "agent_id", "input", "output", "status", "cost"],
    governance: "owner or admin",
    queueLink: "eval_queue",
    priority: 1
  },
  {
    object: "queues",
    purpose: "Queue definitions",
    keyFields: ["id", "name", "purpose", "retry_policy"],
    governance: "admin",
    queueLink: "worker_queue",
    priority: 1
  },
  {
    object: "jobs",
    purpose: "Queued work items",
    keyFields: ["id", "queue", "payload", "status", "attempts", "run_after"],
    governance: "owner or admin",
    queueLink: "all queues",
    priority: 1
  },
  {
    object: "blockers",
    purpose: "Captured runtime blockers from UI, queues, and hardening lanes",
    keyFields: ["id", "source", "queue", "code", "summary", "severity", "status"],
    governance: "owner or admin",
    queueLink: "blocker_remediation_queue",
    priority: 1
  },
  {
    object: "remediation_runs",
    purpose: "Auto-fix plans, fallback actions, and governed holds",
    keyFields: ["id", "blocker_id", "next_queue", "auto_dispatch", "hard_gate", "created_at"],
    governance: "owner or admin",
    queueLink: "connector_recovery_queue",
    priority: 1
  },
  {
    object: "tool_receipts",
    purpose: "Connector action receipts",
    keyFields: ["id", "job_id", "connector", "action", "response_hash"],
    governance: "owner or admin",
    queueLink: "governance_queue",
    priority: 1
  },
  {
    object: "approval_requests",
    purpose: "Human gates",
    keyFields: ["id", "object_type", "object_id", "risk", "status", "approver"],
    governance: "approver or admin",
    queueLink: "approval_queue",
    priority: 1
  }
];

export const queueAgentMap: QueueAgentEntry[] = [
  {
    queue: "idea_intake_queue",
    trigger: "New message or idea",
    agentOwner: "Intake Agent",
    input: "raw idea",
    output: "classified idea",
    retryPolicy: "3 tries exponential",
    deadLetterRule: "invalid idea to archive",
    approvalRequirement: "None",
    slaTarget: "2 min"
  },
  {
    queue: "build_router_queue",
    trigger: "Classified idea",
    agentOwner: "Router Agent",
    input: "idea plus context",
    output: "build card",
    retryPolicy: "3 tries",
    deadLetterRule: "low confidence to human",
    approvalRequirement: "Risk high",
    slaTarget: "5 min"
  },
  {
    queue: "template_pull_queue",
    trigger: "Build card",
    agentOwner: "Factory Agent",
    input: "route plus module needs",
    output: "template bundle",
    retryPolicy: "2 tries",
    deadLetterRule: "missing template to blocker remediation",
    approvalRequirement: "None",
    slaTarget: "5 min"
  },
  {
    queue: "repo_patch_queue",
    trigger: "Template bundle ready",
    agentOwner: "Builder Agent",
    input: "files plus instructions",
    output: "branch or patch",
    retryPolicy: "2 tries",
    deadLetterRule: "patch conflict to blocker remediation",
    approvalRequirement: "Live repo write",
    slaTarget: "15 min"
  },
  {
    queue: "supabase_migration_queue",
    trigger: "Schema change",
    agentOwner: "DB Agent",
    input: "SQL migration",
    output: "sandbox migration",
    retryPolicy: "2 tries",
    deadLetterRule: "migration failure to blocker remediation",
    approvalRequirement: "Service role",
    slaTarget: "10 min"
  },
  {
    queue: "vercel_preview_queue",
    trigger: "Branch ready",
    agentOwner: "Deploy Agent",
    input: "branch and env",
    output: "preview URL",
    retryPolicy: "2 tries",
    deadLetterRule: "deploy fail to blocker remediation",
    approvalRequirement: "Production deploy",
    slaTarget: "10 min"
  },
  {
    queue: "hardening_queue",
    trigger: "Preview ready",
    agentOwner: "QA Agent",
    input: "URL, schema, jobs",
    output: "eval results",
    retryPolicy: "3 tries",
    deadLetterRule: "fail to blocker remediation",
    approvalRequirement: "None",
    slaTarget: "15 min"
  },
  {
    queue: "blocker_remediation_queue",
    trigger: "UI blocker card, failed queue, or hardening failure",
    agentOwner: "Remediation Agent",
    input: "blocker event plus evidence",
    output: "repair plan, next queue, and hard gate state",
    retryPolicy: "2 tries",
    deadLetterRule: "governed review when remediation itself exhausts",
    approvalRequirement: "Only when protected surfaces are touched",
    slaTarget: "2 min"
  },
  {
    queue: "connector_recovery_queue",
    trigger: "Blocked mutation surface or connector outage",
    agentOwner: "Connector Recovery Agent",
    input: "connector blocker and fallback mode",
    output: "bridge path, receipt path, or restored queue handoff",
    retryPolicy: "2 tries",
    deadLetterRule: "release hold if no safe bridge exists",
    approvalRequirement: "Production-impacting or protected writes",
    slaTarget: "5 min"
  },
  {
    queue: "workaround_queue",
    trigger: "Template gap, patch conflict, or unknown blocker",
    agentOwner: "Workaround Agent",
    input: "blocker plus surviving build path",
    output: "generic scaffold, fallback plan, and hardening handoff",
    retryPolicy: "2 tries",
    deadLetterRule: "governed review if no safe workaround exists",
    approvalRequirement: "Only for protected live actions",
    slaTarget: "5 min"
  },
  {
    queue: "asset_factory_queue",
    trigger: "Build complete",
    agentOwner: "Asset Agent",
    input: "code, prompts, results",
    output: "reusable asset",
    retryPolicy: "2 tries",
    deadLetterRule: "dedupe fail to review",
    approvalRequirement: "None",
    slaTarget: "10 min"
  }
];

export const assetFactory: AssetFactoryEntry[] = [
  {
    assetType: "Prompt Pack",
    examples: ["intake", "router", "agent", "eval prompts"],
    storageLocation: "/prompts/{domain}/{version}",
    reuseRule: "Reuse when route matches",
    versioning: "semver + changelog",
    qualityGate: "Eval pass rate",
    compoundingBenefit: "Improves speed and consistency"
  },
  {
    assetType: "UI Block",
    examples: ["forms", "dashboards", "cards", "tables"],
    storageLocation: "/apps/web/components/factory",
    reuseRule: "Reuse if design and risk class are compatible",
    versioning: "component version",
    qualityGate: "Story or smoke test",
    compoundingBenefit: "Reduces frontend time"
  },
  {
    assetType: "Schema Module",
    examples: ["leads", "attribution", "approvals", "queues"],
    storageLocation: "/supabase/migrations/modules",
    reuseRule: "Reuse if entities match",
    versioning: "migration version",
    qualityGate: "RLS tests",
    compoundingBenefit: "Reduces backend time"
  },
  {
    assetType: "Queue Worker",
    examples: ["sync", "enrichment", "publish", "deploy"],
    storageLocation: "/packages/workers",
    reuseRule: "Reuse by queue pattern",
    versioning: "package version",
    qualityGate: "Replay and idempotency",
    compoundingBenefit: "Reduces automation fragility"
  },
  {
    assetType: "Case Study Template",
    examples: ["problem", "system", "result", "proof"],
    storageLocation: "/assets/sales",
    reuseRule: "Reuse after measured impact",
    versioning: "dated version",
    qualityGate: "Attribution evidence",
    compoundingBenefit: "Turns builds into sales assets"
  }
];

export const buildPacketContract: BuildPacketSection[] = [
  {
    section: "Idea Brief",
    requiredFields: ["raw_text", "target_user", "pain", "desired_outcome"],
    purpose: "Preserve original intent",
    generatedBy: "Intake Agent",
    validation: "not empty"
  },
  {
    section: "Classification",
    requiredFields: ["idea_type", "route", "risk_class", "confidence"],
    purpose: "Select build path",
    generatedBy: "Router Agent",
    validation: "confidence >= 80 or human review"
  },
  {
    section: "Economic Case",
    requiredFields: ["revenue_hypothesis", "margin", "speed_to_cash"],
    purpose: "Prioritize profitable ideas",
    generatedBy: "Commercial Agent",
    validation: "profit score exists"
  },
  {
    section: "Architecture",
    requiredFields: ["frontend", "backend", "schema", "queues", "agents", "connectors"],
    purpose: "Build plan",
    generatedBy: "Architect Agent",
    validation: "all components mapped"
  },
  {
    section: "Template Bundle",
    requiredFields: ["template_ids", "modules", "assets", "prompts"],
    purpose: "Accelerate assembly",
    generatedBy: "Factory Agent",
    validation: "templates available"
  },
  {
    section: "Repo Plan",
    requiredFields: ["branch", "files", "packages", "env_vars"],
    purpose: "Implement code",
    generatedBy: "Builder Agent",
    validation: "no missing paths"
  },
  {
    section: "Supabase Plan",
    requiredFields: ["tables", "rls", "seed_data", "migrations"],
    purpose: "Implement backend",
    generatedBy: "DB Agent",
    validation: "migration dry run"
  },
  {
    section: "Workflow Plan",
    requiredFields: ["queues", "workers", "retries", "dead_letter"],
    purpose: "Run automations",
    generatedBy: "Workflow Agent",
    validation: "replay test"
  },
  {
    section: "QA Plan",
    requiredFields: ["tests", "acceptance_criteria"],
    purpose: "Harden output",
    generatedBy: "QA Agent",
    validation: "all required pass"
  },
  {
    section: "Release Plan",
    requiredFields: ["approval", "deploy_target", "rollback"],
    purpose: "Govern go-live",
    generatedBy: "Governance Agent",
    validation: "approval exists"
  }
];

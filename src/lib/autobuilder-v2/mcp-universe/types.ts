export type McpUniverseCategory =
  | "foundation"
  | "intelligence"
  | "discovery"
  | "build"
  | "validation"
  | "auto_heal"
  | "auto_fix"
  | "optimization"
  | "social"
  | "content"
  | "commerce"
  | "sales_crm"
  | "customer_service"
  | "operations"
  | "finance"
  | "legal_compliance"
  | "hr_training"
  | "knowledge"
  | "industry_specific"
  | "governance";

export type McpUniverseTier = "core" | "expansion" | "enterprise" | "experimental" | "industry_specific";

export type IndustryFit =
  | "universal"
  | "construction"
  | "ecommerce"
  | "local_services"
  | "education"
  | "healthcare"
  | "legal"
  | "finance"
  | "real_estate"
  | "manufacturing"
  | "logistics"
  | "restaurants"
  | "agencies"
  | "nonprofits"
  | "creator_monetization";

export type BlastRadius = "low" | "medium" | "high" | "critical";
export type DefaultMode = "read_only" | "draft" | "supervised_write" | "autonomous_safe_write" | "approval_required";
export type MaxAutonomyAllowed = "none" | "read" | "draft" | "sandboxless_safe_write" | "production_write_with_gate" | "never_autonomous";
export type ReceiptType = "discovery" | "validation" | "build" | "social" | "commerce" | "finance" | "legal" | "customer" | "system";
export type ApprovalState = "not_required" | "pending" | "approved" | "rejected" | "blocked";

export type RequiredCredential = {
  envName: string;
  secret: boolean;
  required: boolean;
  minimumScope: string;
  storageLocation: string;
  rotation: "30d" | "60d" | "90d" | "on_change";
};

export type McpUniverseEntry = {
  id: string;
  name: string;
  category: McpUniverseCategory;
  tier: McpUniverseTier;
  industryFit: IndustryFit[];
  priorityScore: number;
  businessValueScore: number;
  automationScore: number;
  autonomyScore: number;
  discoveryScore: number;
  validationScore: number;
  autoHealScore: number;
  autoFixScore: number;
  optimizationScore: number;
  socialScore: number;
  securityRiskScore: number;
  blastRadius: BlastRadius;
  defaultMode: DefaultMode;
  maxAutonomyAllowed: MaxAutonomyAllowed;
  requiredCredentials: RequiredCredential[];
  connectedSystems: string[];
  useCases: string[];
  allowedAutonomousActions: string[];
  requiresApprovalActions: string[];
  forbiddenActions: string[];
  validationTests: string[];
  autoHealActions: string[];
  autoFixActions: string[];
  optimizationActions: string[];
  socialActions: string[];
  loggingRequired: boolean;
  receiptType: ReceiptType;
  rollbackRequired: boolean;
  rollbackStrategy: string;
  costControls: string[];
  rateLimits: string[];
  complianceNotes: string[];
  operatorNotes: string[];
};

export type McpUniverseReceipt = {
  receiptId: string;
  timestamp: string;
  mcpId: string;
  category: McpUniverseCategory | "system";
  action: string;
  autonomyLevel: 0 | 1 | 2 | 3 | 4 | 5;
  riskClass: BlastRadius;
  approvalState: ApprovalState;
  target: string;
  inputsHash: string;
  resultSummary: string;
  validationStatus: "not_run" | "passed" | "failed" | "blocked";
  rollbackRef: string | null;
  nextAction: string;
};

export type McpPulseResult = {
  ok: boolean;
  job: "auto-builder-mcp-pulse";
  productionActionAllowed: false;
  timestamp: string;
  registry: {
    totalEntries: number;
    coreEntries: number;
    ceilingCandidateGroups: number;
    approvalRequiredEntries: number;
  };
  readiness: {
    configuredProviders: string[];
    blockedProviders: string[];
    missingCredentialEnvNames: string[];
  };
  queues: {
    discoveryCandidates: string[];
    validationCandidates: string[];
    autoHealCandidates: string[];
    autoFixCandidates: string[];
    optimizationCandidates: string[];
    approvalNeeded: string[];
  };
  receipt: McpUniverseReceipt;
};

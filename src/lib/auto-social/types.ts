export type AutoSocialStatus =
  | "draft"
  | "queued"
  | "qa_ready"
  | "approved"
  | "blocked"
  | "quarantined"
  | "healed"
  | "receipt_ready";

export type AutoSocialRisk = "low" | "medium" | "high" | "critical";

export type AutoSocialOperation =
  | "discover"
  | "analyze"
  | "create"
  | "quarantine"
  | "approve"
  | "schedule"
  | "validate"
  | "heal"
  | "n8n-approved-dispatch";

export type ApprovalGate =
  | "autonomous"
  | "draft_only"
  | "read_only"
  | "owner_approval_required"
  | "blocked";

export type CohortKey =
  | "male_18_25"
  | "female_18_25"
  | "male_25_50"
  | "female_25_50"
  | "male_50_plus"
  | "female_50_plus"
  | "international"
  | "faceless";

export type AutoSocialModel = {
  id: string;
  name: string;
  cohort: CohortKey;
  ageBand: string;
  persona: string;
  platforms: string[];
  status: AutoSocialStatus;
  risk: AutoSocialRisk;
};

export type AutoSocialQueueItem = {
  id: string;
  operation: AutoSocialOperation;
  lane: string;
  target: string;
  status: AutoSocialStatus;
  gate: ApprovalGate;
  risk: AutoSocialRisk;
  receiptRequired: boolean;
  notes: string;
};

export type AutoSocialReceipt = {
  id: string;
  action: string;
  ok: boolean;
  gate: ApprovalGate;
  productionActionAllowed: false;
  timestamp: string;
  evidence: string[];
  nextActions: string[];
};

export type ReflectionEntry = {
  scope: string;
  trigger: string;
  findings: string[];
  improvements: string[];
  remember: string[];
};

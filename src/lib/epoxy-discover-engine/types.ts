import type { StateCode } from "./states";

export type EpoxyRunMode = "dry_run" | "observe_only" | "live_gated";

export type EpoxyQueueStatus = "NEW" | "RUNNING" | "COMPLETE" | "FAILED" | "RETRY" | "DEADLETTER" | "DRY_RUN";

export type EpoxyCompetitorCandidate = {
  competitorKey: string;
  name: string;
  stateCode: StateCode;
  city: string | null;
  website: string | null;
  categories: string[];
  services: string[];
  source: string;
  evidence: Record<string, string>;
  verificationStatus: "NEEDS_REVIEW" | "SEEDED" | "VERIFIED";
  confidenceScore: number;
  notes: string;
};

export type EpoxyQueueJob = {
  jobKey: string;
  jobType: "discover_state_competitors";
  stateCode: StateCode;
  status: EpoxyQueueStatus;
  priority: number;
  targetCompetitorCount: number;
  createdAt: string;
  source: string;
  attempts?: number;
};

export type EpoxyWorkerInput = {
  dryRun: boolean;
  state?: string | null;
  source: string;
  requestedAt?: string;
  requestId?: string;
  maxCandidates?: number;
};

export type EpoxyGateStatus = {
  productionActionAllowed: boolean;
  releaseApprovalRequired: boolean;
  supabasePersistenceEnabled: boolean;
  sheetSyncEnabled: boolean;
  liveDiscoveryEnabled: boolean;
};

export type EpoxyWriteResultStatus = "dry_run" | "disabled" | "missing_env" | "persisted" | "failed" | "skipped";

export type EpoxyWriteResult = {
  attempted: boolean;
  ok: boolean;
  status: EpoxyWriteResultStatus;
  reason: string;
  tables?: string[];
  rowCount?: number;
  errors?: string[];
};

export type EpoxySheetRow = {
  tab: string;
  operation: "append" | "upsert";
  key: string;
  values: Record<string, string | number | boolean | null>;
};

export type EpoxySheetSyncResult = EpoxyWriteResult & {
  tabs?: string[];
  webhookStatus?: number;
};

export type EpoxyReceipt = {
  receiptId: string;
  generatedAt: string;
  route: "/api/cron/epoxy-competitor-queue";
  mode: EpoxyRunMode;
  stateCode: StateCode;
  productionActionAllowed: boolean;
  queueJob: EpoxyQueueJob;
  candidateCount: number;
  candidates: EpoxyCompetitorCandidate[];
  gates: EpoxyGateStatus;
  queueClaim: EpoxyWriteResult;
  persistence: EpoxyWriteResult;
  sheetSync: EpoxySheetSyncResult;
};

export type EpoxyWorkerResult = {
  ok: boolean;
  mode: EpoxyRunMode;
  route: "/api/cron/epoxy-competitor-queue";
  stateCode: StateCode;
  timestamp: string;
  productionActionAllowed: boolean;
  queueJob: EpoxyQueueJob;
  candidates: EpoxyCompetitorCandidate[];
  gates: EpoxyGateStatus;
  queueClaim: EpoxyWriteResult;
  persistence: EpoxyWriteResult;
  sheetSync: EpoxySheetSyncResult;
  receiptWrite: EpoxyWriteResult;
  receipt: EpoxyReceipt;
  nextInstruction: string;
};

// ─── PATCH: Queue claim result type ──────────────────────────────────────────
// Defines the shape returned by claimNextEpoxyQueueJob so worker.ts can
// access claimedJob.jobKey, .jobType, .stateCode, .priority, .createdAt, .attempts

export type EpoxyClaimedJob = {
  jobKey: string;
  jobType: string;
  stateCode: string;
  priority: number;
  createdAt: string;
  attempts: number;
};

export type EpoxyQueueClaimResult = {
  ok: boolean;
  mode: EpoxyRunMode;
  claimed: boolean;
  claimedJob?: EpoxyClaimedJob;
  error?: string;
};

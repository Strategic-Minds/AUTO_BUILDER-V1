export type AutoBuilderActionCategory =
  | "read"
  | "write"
  | "create"
  | "update"
  | "move"
  | "copy"
  | "delete"
  | "organize"
  | "execute"
  | "deploy"
  | "publish"
  | "sync"
  | "import"
  | "export"
  | "validate"
  | "monitor"
  | "report"
  | "rollback"
  | "operate"
  | "connect"
  | "auth_check"
  | "config"
  | "receipts"
  | "pipeline_state"
  | "future_app_adapters";

export type AutoBuilderExecutionMode = "api" | "mcp" | "browser" | "webhook" | "manual_receipt" | "blocked_until_auth" | "blocked_until_provider_support";

export type AutoBuilderReceipt = {
  ok: boolean;
  provider: string;
  action: string;
  category: AutoBuilderActionCategory;
  operation: string;
  requestedCapability: string;
  authStatus: "verified" | "missing" | "unknown" | "not_required";
  executionMode: AutoBuilderExecutionMode;
  status: "planned" | "queued" | "running" | "completed" | "blocked" | "failed";
  projectId?: string;
  accountId?: string;
  resourceId?: string;
  resourceUrl?: string;
  deploymentUrl?: string;
  logs: string[];
  artifacts: string[];
  receiptId: string;
  timestamp: string;
  blockers: string[];
  fallbackMode: string;
  nextActions: string[];
};

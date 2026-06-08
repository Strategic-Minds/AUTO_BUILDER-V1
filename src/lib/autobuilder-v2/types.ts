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

export type AutoBuilderProviderCategory =
  | "repo"
  | "hosting"
  | "commerce"
  | "workspace"
  | "cloud"
  | "creative"
  | "crm"
  | "payments"
  | "seo"
  | "database"
  | "ai"
  | "media"
  | "design"
  | "messaging"
  | "social"
  | "website"
  | "browser"
  | "future";

export type AutoBuilderExecutionMode = "api" | "mcp" | "browser" | "webhook" | "manual_receipt" | "blocked_until_auth" | "blocked_until_provider_support";

export type AutoBuilderReadiness = "ready" | "partial" | "blocked" | "planned";

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

export type AutoBuilderProvider = {
  providerId: string;
  displayName: string;
  category: AutoBuilderProviderCategory;
  authType: "oauth" | "api_key" | "service_account" | "webhook" | "mcp" | "browser" | "manual";
  requiredSecrets: string[];
  optionalSecrets: string[];
  oauthScopes: string[];
  envBindings: string[];
  apiBaseUrl?: string;
  docsUrl?: string;
  readActions: string[];
  writeActions: string[];
  createActions: string[];
  updateActions: string[];
  moveActions: string[];
  deleteActions: string[];
  executeActions: string[];
  deployActions: string[];
  publishActions: string[];
  syncActions: string[];
  importActions: string[];
  exportActions: string[];
  validationActions: string[];
  monitoringActions: string[];
  reportingActions: string[];
  rollbackActions: string[];
  browserFallbackAvailable: boolean;
  apiSupportLevel: "full" | "partial" | "unknown" | "browser_only";
  readiness: AutoBuilderReadiness;
  fallbackMode: string;
};

export type AutoBuilderAction = {
  name: string;
  providerId: string;
  category: AutoBuilderActionCategory;
  description: string;
  executionMode: AutoBuilderExecutionMode;
  requiredAuth: string[];
  returnsReceipt: true;
};

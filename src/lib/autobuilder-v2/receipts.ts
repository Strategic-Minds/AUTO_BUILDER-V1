import type { AutoBuilderActionCategory, AutoBuilderExecutionMode, AutoBuilderReceipt } from "./types";

export function createReceipt(input: {
  ok?: boolean;
  provider: string;
  action: string;
  category: AutoBuilderActionCategory;
  operation?: string;
  requestedCapability?: string;
  authStatus?: AutoBuilderReceipt["authStatus"];
  executionMode?: AutoBuilderExecutionMode;
  status?: AutoBuilderReceipt["status"];
  projectId?: string;
  accountId?: string;
  resourceId?: string;
  resourceUrl?: string;
  deploymentUrl?: string;
  logs?: string[];
  artifacts?: string[];
  blockers?: string[];
  fallbackMode?: string;
  nextActions?: string[];
}): AutoBuilderReceipt {
  const timestamp = new Date().toISOString();
  return {
    ok: input.ok ?? true,
    provider: input.provider,
    action: input.action,
    category: input.category,
    operation: input.operation ?? input.action,
    requestedCapability: input.requestedCapability ?? `${input.provider}.${input.action}`,
    authStatus: input.authStatus ?? "unknown",
    executionMode: input.executionMode ?? "manual_receipt",
    status: input.status ?? "planned",
    projectId: input.projectId,
    accountId: input.accountId,
    resourceId: input.resourceId,
    resourceUrl: input.resourceUrl,
    deploymentUrl: input.deploymentUrl,
    logs: input.logs ?? [],
    artifacts: input.artifacts ?? [],
    receiptId: `abr_${input.provider}_${input.action}_${Date.now()}`.replace(/[^a-zA-Z0-9_]/g, "_"),
    timestamp,
    blockers: input.blockers ?? [],
    fallbackMode: input.fallbackMode ?? "Capability exposed; runtime execution depends on provider adapter/auth availability.",
    nextActions: input.nextActions ?? []
  };
}

export function blockedUntilAuth(provider: string, action: string, category: AutoBuilderActionCategory, requiredAuth: string[]) {
  return createReceipt({
    ok: false,
    provider,
    action,
    category,
    authStatus: "missing",
    executionMode: "blocked_until_auth",
    status: "blocked",
    blockers: [`Missing verified auth binding(s): ${requiredAuth.join(", ") || "provider auth"}`],
    fallbackMode: "Return action metadata, required auth, and receipt until credentials are bound.",
    nextActions: ["Bind provider credentials", "Run auth check", "Retry action"]
  });
}

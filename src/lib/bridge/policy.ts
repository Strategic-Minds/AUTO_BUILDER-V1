export type RiskClass = 0 | 1 | 2 | 3 | 4 | 5;
export type ApprovalState = "not_required" | "pending" | "approved" | "rejected" | "expired" | "blocked";

export type BridgePolicyInput = {
  riskClass?: RiskClass;
  mutation?: boolean;
  system?: string;
  action?: string;
  approvalState?: ApprovalState;
};

export type BridgePolicyDecision = {
  allowed: boolean;
  approvalRequired: boolean;
  reason: string;
  normalized: Required<BridgePolicyInput>;
};

const protectedSystems = new Set([
  "vercel",
  "supabase",
  "shopify",
  "stripe",
  "google_chat",
  "social",
  "metricool",
  "heygen",
  "xyla",
  "n8n",
  "browser_credentialed"
]);

const protectedActions = new Set([
  "production_deploy",
  "production_migration",
  "secret_mutation",
  "live_publish",
  "customer_message",
  "payment_action",
  "destructive_action",
  "capital_spend",
  "shopify_live_write",
  "social_live_publish"
]);

function normalize(input: BridgePolicyInput): Required<BridgePolicyInput> {
  return {
    riskClass: input.riskClass ?? 0,
    mutation: input.mutation ?? false,
    system: input.system ?? "unknown",
    action: input.action ?? "read",
    approvalState: input.approvalState ?? "not_required"
  };
}

export function classifyBridgeAction(input: BridgePolicyInput): BridgePolicyDecision {
  const normalized = normalize(input);

  if (normalized.riskClass <= 1 && !normalized.mutation) {
    return { allowed: true, approvalRequired: false, reason: "read_or_dry_run_allowed", normalized };
  }

  if (protectedActions.has(normalized.action) && normalized.approvalState !== "approved") {
    return { allowed: false, approvalRequired: true, reason: "protected_action_requires_approval", normalized };
  }

  if (protectedSystems.has(normalized.system) && normalized.mutation && normalized.approvalState !== "approved") {
    return { allowed: false, approvalRequired: true, reason: "protected_system_mutation_requires_approval", normalized };
  }

  if (normalized.riskClass >= 2 && normalized.approvalState !== "approved") {
    return { allowed: false, approvalRequired: true, reason: "risk_class_requires_approval", normalized };
  }

  if (normalized.riskClass === 5) {
    return { allowed: false, approvalRequired: true, reason: "class_5_manual_gate", normalized };
  }

  return { allowed: true, approvalRequired: false, reason: "approved_by_policy", normalized };
}

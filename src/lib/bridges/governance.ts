export type RiskClass = 0 | 1 | 2 | 3 | 4 | 5;
export type ApprovalState = "not_required" | "pending" | "approved" | "rejected" | "expired" | "blocked";

export type BridgePolicyDecision = {
  allowed: boolean;
  approvalRequired: boolean;
  reason: string;
};

const productionMutationSystems = new Set(["vercel", "supabase", "shopify", "stripe", "google_chat", "social", "browser_credentialed"]);

export function classifyBridgeAction(input: { riskClass: RiskClass; mutation: boolean; system: string; approvalState?: ApprovalState }): BridgePolicyDecision {
  if (input.riskClass <= 1 && !input.mutation) return { allowed: true, approvalRequired: false, reason: "read_or_local_sandbox" };
  if (productionMutationSystems.has(input.system) && input.approvalState !== "approved") return { allowed: false, approvalRequired: true, reason: "production_or_external_mutation_requires_approval" };
  if (input.riskClass >= 2 && input.approvalState !== "approved") return { allowed: false, approvalRequired: true, reason: "risk_class_requires_approval" };
  if (input.riskClass === 5) return { allowed: false, approvalRequired: true, reason: "class_5_requires_manual_execution_gate" };
  return { allowed: true, approvalRequired: false, reason: "approved_by_policy" };
}

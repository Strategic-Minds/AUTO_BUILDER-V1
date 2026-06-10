export type RiskClass = 0 | 1 | 2 | 3 | 4 | 5;

export type ApprovalState =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "blocked";

export type PolicyDecision = {
  allowed: boolean;
  approvalRequired: boolean;
  reason: string;
};

const productionMutationSystems = new Set([
  "vercel",
  "supabase",
  "shopify",
  "stripe",
  "slack",
  "gmail",
  "calendar",
  "metricool",
  "twilio",
  "google_chat",
  "n8n",
  "social",
  "github_protected",
  "browser_credentialed",
  "playwright_credentialed"
]);

export function classifyCloudAction(input: {
  riskClass?: RiskClass;
  mutation?: boolean;
  system?: string;
  approvalState?: ApprovalState;
}): PolicyDecision {
  const riskClass = input.riskClass ?? 1;
  const mutation = Boolean(input.mutation);
  const system = input.system ?? "cloud_control_plane";
  const approvalState = input.approvalState ?? "not_required";

  if (riskClass <= 1 && !mutation) {
    return { allowed: true, approvalRequired: false, reason: "cloud_read_or_diagnostic" };
  }

  if (productionMutationSystems.has(system) && approvalState !== "approved") {
    return {
      allowed: false,
      approvalRequired: true,
      reason: "production_or_external_mutation_requires_approval"
    };
  }

  if (riskClass >= 2 && approvalState !== "approved") {
    return { allowed: false, approvalRequired: true, reason: "risk_class_requires_approval" };
  }

  if (riskClass === 5) {
    return { allowed: false, approvalRequired: true, reason: "class_5_requires_manual_execution_gate" };
  }

  return { allowed: true, approvalRequired: false, reason: "approved_by_policy" };
}

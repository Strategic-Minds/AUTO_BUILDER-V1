import type { ApprovalState, BlastRadius, McpUniverseEntry } from "./types";

export const neverAutonomousActions = [
  "payments",
  "refunds",
  "pricing",
  "legal commitments",
  "medical/legal/financial advice sent externally",
  "destructive deletion",
  "secrets/security changes",
  "customer data export",
  "regulated claims",
  "hiring/firing/payroll"
] as const;

export const guardedProductionActions = [
  "production deploy",
  "main branch merge",
  "live workflow activation",
  "customer email",
  "public social post",
  "Shopify live update",
  "CRM customer lifecycle update",
  "DNS change",
  "database migration"
] as const;

export function actionRequiresApproval(entry: McpUniverseEntry, action: string) {
  const normalized = action.toLowerCase();
  if (entry.defaultMode === "approval_required" || entry.maxAutonomyAllowed === "never_autonomous") {
    return true;
  }
  return entry.requiresApprovalActions.some((candidate) => normalized.includes(candidate.toLowerCase())) ||
    guardedProductionActions.some((candidate) => normalized.includes(candidate.toLowerCase())) ||
    neverAutonomousActions.some((candidate) => normalized.includes(candidate.toLowerCase()));
}

export function classifyApprovalState(entry: McpUniverseEntry, action: string): ApprovalState {
  return actionRequiresApproval(entry, action) ? "pending" : "not_required";
}

export function riskClassForAction(entry: McpUniverseEntry, action: string): BlastRadius {
  const normalized = action.toLowerCase();
  if (neverAutonomousActions.some((candidate) => normalized.includes(candidate.toLowerCase()))) {
    return "critical";
  }
  if (guardedProductionActions.some((candidate) => normalized.includes(candidate.toLowerCase()))) {
    return entry.blastRadius === "critical" ? "critical" : "high";
  }
  return entry.blastRadius;
}

export function buildApprovalQueue(entries: McpUniverseEntry[]) {
  return entries
    .filter((entry) => entry.requiresApprovalActions.length > 0 || entry.defaultMode === "approval_required")
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      blastRadius: entry.blastRadius,
      approvalActions: entry.requiresApprovalActions,
      forbiddenActions: entry.forbiddenActions,
      maxAutonomyAllowed: entry.maxAutonomyAllowed
    }));
}

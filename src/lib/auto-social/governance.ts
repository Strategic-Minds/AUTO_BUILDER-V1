import type { ApprovalGate, AutoSocialOperation, AutoSocialRisk } from "./types";

export const protectedLiveActions = [
  "live publishing",
  "outbound comments",
  "outbound replies",
  "direct messages",
  "browser login",
  "browser upload/download",
  "payment or Shopify mutation",
  "production migration",
  "n8n workflow activation"
] as const;

export function gateForOperation(operation: AutoSocialOperation): ApprovalGate {
  switch (operation) {
    case "discover":
    case "analyze":
    case "validate":
    case "heal":
      return "autonomous";
    case "create":
    case "quarantine":
      return "draft_only";
    case "approve":
    case "schedule":
    case "n8n-approved-dispatch":
      return "owner_approval_required";
    default:
      return "blocked";
  }
}

export function riskForOperation(operation: AutoSocialOperation): AutoSocialRisk {
  if (operation === "approve" || operation === "schedule" || operation === "n8n-approved-dispatch") {
    return "high";
  }
  if (operation === "create" || operation === "quarantine") {
    return "medium";
  }
  return "low";
}

export function productionActionAllowed() {
  return false as const;
}

export function assertSandboxGate(operation: AutoSocialOperation) {
  const gate = gateForOperation(operation);
  return {
    gate,
    productionActionAllowed: productionActionAllowed(),
    blockedLiveActions: protectedLiveActions,
    requiresOwnerApproval: gate === "owner_approval_required" || gate === "blocked"
  };
}

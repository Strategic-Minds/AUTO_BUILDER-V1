import { mcpUniverseCandidateGroups, mcpUniverseRegistry } from "../registry";

export function buildConnectorReadinessInventory(missingRequiredEnvNames: string[] = []) {
  const missingSet = new Set(missingRequiredEnvNames);
  const inventory = mcpUniverseRegistry.map((entry) => {
    const missingCredentials = entry.requiredCredentials
      .filter((credential) => credential.required && missingSet.has(credential.envName))
      .map((credential) => credential.envName);

    return {
      id: entry.id,
      name: entry.name,
      category: entry.category,
      tier: entry.tier,
      readinessState: missingCredentials.length > 0 ? "blocked_missing_secret" : "ready_internal_planning",
      missingCredentials,
      nextSafeStep: missingCredentials.length > 0
        ? "Record credential owner/scope and keep connector in read/draft mode."
        : "Run read-only readiness smoke and create receipt.",
      approvalRequiredActions: entry.requiresApprovalActions
    };
  });

  return {
    productionActionAllowed: false,
    inventory,
    candidateGroups: Object.entries(mcpUniverseCandidateGroups).map(([group, providers]) => ({
      group,
      providerCount: providers.length,
      nextSafeStep: "Classify official MCP/API/browser/n8n availability before activation."
    })),
    nextAction: "Persist readiness inventory and run one provider-family smoke at a time."
  };
}

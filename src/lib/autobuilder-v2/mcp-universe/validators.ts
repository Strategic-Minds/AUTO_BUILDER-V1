import { mcpUniverseLayers, mcpUniverseRegistry } from "./registry";
import type { McpUniverseEntry } from "./types";

export type McpUniverseValidationResult = {
  id: string;
  passed: boolean;
  message: string;
};

export function validateMcpEntry(entry: McpUniverseEntry): McpUniverseValidationResult[] {
  return [
    {
      id: `${entry.id}:required-fields`,
      passed: Boolean(entry.id && entry.name && entry.category && entry.tier),
      message: "Entry has required identity fields."
    },
    {
      id: `${entry.id}:scores`,
      passed: [entry.priorityScore, entry.businessValueScore, entry.automationScore, entry.autonomyScore, entry.securityRiskScore].every((score) => Number.isFinite(score) && score >= 0 && score <= 100),
      message: "Entry scores are numeric and within supported bounds."
    },
    {
      id: `${entry.id}:governance`,
      passed: entry.requiresApprovalActions.length > 0 || entry.maxAutonomyAllowed !== "production_write_with_gate",
      message: "Production-capable entries define approval-gated actions."
    },
    {
      id: `${entry.id}:receipts`,
      passed: entry.loggingRequired && Boolean(entry.receiptType),
      message: "Entry requires logging and a receipt type."
    },
    {
      id: `${entry.id}:rollback`,
      passed: !entry.rollbackRequired || entry.rollbackStrategy.length > 0,
      message: "Rollback-required entries define a rollback strategy."
    }
  ];
}

export function validateMcpUniverse(entries: McpUniverseEntry[] = mcpUniverseRegistry) {
  const layerCategories = new Set(mcpUniverseLayers.map((layer) => layer.category));
  const entryIds = new Set<string>();
  const entryResults = entries.flatMap(validateMcpEntry);
  const duplicateIds = entries.filter((entry) => {
    if (entryIds.has(entry.id)) return true;
    entryIds.add(entry.id);
    return false;
  });

  const structuralResults: McpUniverseValidationResult[] = [
    {
      id: "universe:has-20-layers",
      passed: mcpUniverseLayers.length === 20,
      message: "Registry defines the 20 AUTO_BUILDER operating layers."
    },
    {
      id: "universe:entry-categories-valid",
      passed: entries.every((entry) => layerCategories.has(entry.category)),
      message: "Every entry category maps to a defined operating layer."
    },
    {
      id: "universe:no-duplicate-ids",
      passed: duplicateIds.length === 0,
      message: duplicateIds.length === 0 ? "No duplicate entry ids." : `Duplicate entry ids: ${duplicateIds.map((entry) => entry.id).join(", ")}`
    },
    {
      id: "universe:no-secret-values",
      passed: entries.every((entry) => entry.requiredCredentials.every((credential) => !credential.envName.includes("=") && !credential.minimumScope.includes("sk-"))),
      message: "Credential metadata uses env names and scopes only, not secret values."
    }
  ];

  const results = [...structuralResults, ...entryResults];
  return {
    passed: results.every((result) => result.passed),
    results
  };
}

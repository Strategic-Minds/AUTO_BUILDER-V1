import { mcpUniverseRegistry } from "./registry";
import type { McpUniverseCategory, McpUniverseEntry } from "./types";

export function scoreMcpEntry(entry: McpUniverseEntry) {
  const valueScore = entry.businessValueScore * 2 + entry.automationScore + entry.autonomyScore;
  const operatingScore = entry.discoveryScore + entry.validationScore + entry.autoHealScore + entry.autoFixScore + entry.optimizationScore + entry.socialScore;
  const riskPenalty = entry.securityRiskScore + (entry.blastRadius === "critical" ? 8 : entry.blastRadius === "high" ? 5 : entry.blastRadius === "medium" ? 2 : 0);
  return Math.max(0, entry.priorityScore + valueScore + operatingScore - riskPenalty);
}

export function rankedMcpUniverse(entries: McpUniverseEntry[] = mcpUniverseRegistry) {
  return [...entries]
    .map((entry) => ({ ...entry, computedScore: scoreMcpEntry(entry) }))
    .sort((a, b) => b.computedScore - a.computedScore || b.priorityScore - a.priorityScore);
}

export function summarizeMcpUniverse(entries: McpUniverseEntry[] = mcpUniverseRegistry) {
  const categories = entries.reduce<Record<McpUniverseCategory, number>>((acc, entry) => {
    acc[entry.category] = (acc[entry.category] ?? 0) + 1;
    return acc;
  }, {} as Record<McpUniverseCategory, number>);

  return {
    totalEntries: entries.length,
    coreEntries: entries.filter((entry) => entry.tier === "core").length,
    expansionEntries: entries.filter((entry) => entry.tier === "expansion").length,
    enterpriseEntries: entries.filter((entry) => entry.tier === "enterprise").length,
    experimentalEntries: entries.filter((entry) => entry.tier === "experimental").length,
    industrySpecificEntries: entries.filter((entry) => entry.tier === "industry_specific").length,
    approvalRequiredEntries: entries.filter((entry) => entry.defaultMode === "approval_required" || entry.maxAutonomyAllowed === "never_autonomous").length,
    categories
  };
}

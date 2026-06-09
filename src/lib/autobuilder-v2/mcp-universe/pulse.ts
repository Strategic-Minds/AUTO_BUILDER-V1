import { getRuntimeProviderStatus } from "@/lib/providers/runtimeProviderStatus";
import { buildApprovalQueue } from "./governance";
import { mcpUniverseCandidateGroups, mcpUniverseRegistry } from "./registry";
import { createMcpUniverseReceipt, recordMcpUniverseReceipt } from "./receipts";
import { rankedMcpUniverse, summarizeMcpUniverse } from "./scoring";
import type { McpPulseResult } from "./types";
import { validateMcpUniverse } from "./validators";

function credentialEnvNames() {
  return [...new Set(mcpUniverseRegistry.flatMap((entry) => entry.requiredCredentials.filter((credential) => credential.required).map((credential) => credential.envName)))];
}

function configuredProviderSummary() {
  const runtimeStatus = getRuntimeProviderStatus();
  const missingCredentialEnvNames = credentialEnvNames().filter((envName) => !process.env[envName]);
  return {
    runtimeStatus,
    configuredProviders: runtimeStatus.readyProviders,
    blockedProviders: runtimeStatus.providers.filter((provider) => !provider.ready).map((provider) => provider.provider),
    missingCredentialEnvNames
  };
}

export async function runMcpUniversePulse(): Promise<McpPulseResult & { telemetry: unknown; validation: ReturnType<typeof validateMcpUniverse> }> {
  const summary = summarizeMcpUniverse();
  const ranked = rankedMcpUniverse();
  const readiness = configuredProviderSummary();
  const validation = validateMcpUniverse();
  const approvalQueue = buildApprovalQueue(mcpUniverseRegistry);

  const discoveryCandidates = ranked
    .filter((entry) => entry.discoveryScore >= 7)
    .slice(0, 8)
    .map((entry) => entry.id);
  const validationCandidates = ranked
    .filter((entry) => entry.validationScore >= 7)
    .slice(0, 8)
    .map((entry) => entry.id);
  const autoHealCandidates = ranked
    .filter((entry) => entry.autoHealScore >= 7)
    .slice(0, 8)
    .map((entry) => entry.id);
  const autoFixCandidates = ranked
    .filter((entry) => entry.autoFixScore >= 7)
    .slice(0, 8)
    .map((entry) => entry.id);
  const optimizationCandidates = ranked
    .filter((entry) => entry.optimizationScore >= 7)
    .slice(0, 8)
    .map((entry) => entry.id);
  const approvalNeeded = approvalQueue.slice(0, 12).map((entry) => entry.id);

  const receipt = createMcpUniverseReceipt({
    mcpId: "auto-builder-mcp-pulse",
    category: "system",
    action: "readiness_validation_queue_recommendation",
    autonomyLevel: 2,
    riskClass: "low",
    approvalState: "not_required",
    target: "/api/cron/auto-builder-mcp-pulse",
    resultSummary: validation.passed
      ? "MCP universe pulse completed in read-only/internal-write mode."
      : "MCP universe pulse completed with validation blockers.",
    validationStatus: validation.passed ? "passed" : "blocked",
    rollbackRef: null,
    nextAction: validation.passed
      ? "Review approval-needed queue before widening any connector."
      : "Fix registry validation blockers before BUILD release.",
    inputs: {
      registryEntries: mcpUniverseRegistry.length,
      candidateGroups: Object.keys(mcpUniverseCandidateGroups),
      missingCredentialEnvNames: readiness.missingCredentialEnvNames
    }
  });

  const telemetry = await recordMcpUniverseReceipt(receipt);

  return {
    ok: validation.passed,
    job: "auto-builder-mcp-pulse",
    productionActionAllowed: false,
    timestamp: receipt.timestamp,
    registry: {
      totalEntries: summary.totalEntries,
      coreEntries: summary.coreEntries,
      ceilingCandidateGroups: Object.keys(mcpUniverseCandidateGroups).length,
      approvalRequiredEntries: summary.approvalRequiredEntries
    },
    readiness: {
      configuredProviders: readiness.configuredProviders,
      blockedProviders: readiness.blockedProviders,
      missingCredentialEnvNames: readiness.missingCredentialEnvNames
    },
    queues: {
      discoveryCandidates,
      validationCandidates,
      autoHealCandidates,
      autoFixCandidates,
      optimizationCandidates,
      approvalNeeded
    },
    receipt,
    telemetry,
    validation
  };
}

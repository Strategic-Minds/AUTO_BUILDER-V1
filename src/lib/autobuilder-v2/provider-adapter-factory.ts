import { providerRegistry } from "./provider-registry";
import { buildProviderAdapterContract } from "./provider-adapter-contract";

export function buildProviderAdapterManifest() {
  return providerRegistry.map((provider) => buildProviderAdapterContract(provider));
}

export function getProviderAdapterContract(providerId: string) {
  return buildProviderAdapterManifest().find((contract) => contract.providerId === providerId);
}

export function getMissingProviderAdapterArtifacts(existingPaths: string[] = []) {
  const existing = new Set(existingPaths);
  return buildProviderAdapterManifest()
    .filter((contract) => !existing.has(contract.filePath))
    .map((contract) => ({
      providerId: contract.providerId,
      displayName: contract.displayName,
      filePath: contract.filePath,
      requiredEnv: contract.requiredEnv,
      status: "missing_adapter_artifact" as const,
      repairAction: "create_provider_adapter_artifact"
    }));
}

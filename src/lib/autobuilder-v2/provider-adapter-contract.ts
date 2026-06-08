import type { AutoBuilderActionCategory, AutoBuilderProvider } from "./types";

export type ProviderAdapterOperation = {
  providerId: string;
  action: string;
  category: AutoBuilderActionCategory;
  requiredEnv: string[];
  runtimeMode: "metadata_only" | "api" | "mcp" | "browser" | "webhook";
  status: "scaffolded" | "ready" | "blocked_until_auth" | "blocked_until_provider_support";
};

export type ProviderAdapterContract = {
  providerId: string;
  displayName: string;
  filePath: string;
  requiredEnv: string[];
  operations: ProviderAdapterOperation[];
};

export function buildProviderAdapterContract(provider: AutoBuilderProvider): ProviderAdapterContract {
  const actionGroups = [
    ["read", provider.readActions],
    ["write", provider.writeActions],
    ["create", provider.createActions],
    ["update", provider.updateActions],
    ["move", provider.moveActions],
    ["delete", provider.deleteActions],
    ["execute", provider.executeActions],
    ["deploy", provider.deployActions],
    ["publish", provider.publishActions],
    ["sync", provider.syncActions],
    ["validate", provider.validationActions],
    ["monitor", provider.monitoringActions],
    ["report", provider.reportingActions],
    ["rollback", provider.rollbackActions]
  ] as const;

  return {
    providerId: provider.providerId,
    displayName: provider.displayName,
    filePath: `src/lib/autobuilder-v2/providers/${provider.providerId.replace(/_/g, "-")}.ts`,
    requiredEnv: provider.requiredSecrets,
    operations: actionGroups.flatMap(([category, actions]) =>
      actions.map((action) => ({
        providerId: provider.providerId,
        action,
        category,
        requiredEnv: provider.requiredSecrets,
        runtimeMode: provider.authType === "browser" ? "browser" : provider.providerId === "n8n" ? "mcp" : "metadata_only",
        status: provider.requiredSecrets.length ? "blocked_until_auth" : "scaffolded"
      }))
    )
  };
}

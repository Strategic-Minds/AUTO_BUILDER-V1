import { findProvider } from "./provider-registry";
import { createReceipt } from "./receipts";
import type { AutoBuilderActionCategory } from "./types";

export function routeProviderAction(input: { providerId: string; action: string; category: AutoBuilderActionCategory; payload?: unknown }) {
  const provider = findProvider(input.providerId);
  if (!provider) {
    return createReceipt({
      ok: false,
      provider: input.providerId,
      action: input.action,
      category: input.category,
      status: "blocked",
      executionMode: "blocked_until_provider_support",
      blockers: [`Unknown provider: ${input.providerId}`],
      nextActions: ["Add provider to provider registry", "Re-run Auto Builder 2 workflow"]
    });
  }

  return createReceipt({
    ok: true,
    provider: provider.providerId,
    action: input.action,
    category: input.category,
    operation: "provider_route",
    requestedCapability: `${provider.providerId}.${input.action}`,
    authStatus: provider.requiredSecrets.length ? "unknown" : "not_required",
    executionMode: provider.authType === "browser" ? "browser" : "manual_receipt",
    status: "planned",
    logs: [`Provider route resolved: ${provider.displayName}`, `Auth type: ${provider.authType}`],
    artifacts: ["provider-registry", "action-catalog"],
    nextActions: ["Verify provider auth", "Execute provider adapter when available"]
  });
}

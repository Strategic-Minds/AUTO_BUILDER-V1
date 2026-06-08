import { findAction } from "./action-catalog";
import { routeProviderAction } from "./provider-router";
import { createReceipt } from "./receipts";
import type { AutoBuilderActionCategory } from "./types";

export function executeAutoBuilderV2Action(input: {
  action: string;
  providerId?: string;
  category?: AutoBuilderActionCategory;
  payload?: unknown;
}) {
  const action = findAction(input.action);
  const providerId = input.providerId ?? action?.providerId ?? "universal_app";
  const category = input.category ?? action?.category ?? "operate";

  if (!action) {
    return createReceipt({
      ok: false,
      provider: providerId,
      action: input.action,
      category,
      status: "blocked",
      executionMode: "blocked_until_provider_support",
      blockers: [`Unknown action: ${input.action}`],
      nextActions: ["Add action to action catalog", "Re-run Auto Builder 2 workflow"]
    });
  }

  return routeProviderAction({ providerId, action: action.name, category, payload: input.payload });
}

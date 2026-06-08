import { completionChecklist, getChecklistSummary } from "./completion-checklist";
import { providerRegistry } from "./provider-registry";
import { createReceipt } from "./receipts";

export type ValidationResult = {
  ok: boolean;
  summary: ReturnType<typeof getChecklistSummary>;
  providers: number;
  missing: string[];
  receipt: ReturnType<typeof createReceipt>;
};

export function runAutoBuilderV2Validation(): ValidationResult {
  const missing = completionChecklist
    .filter((item) => item.required && item.status !== "done")
    .map((item) => item.id);

  const summary = getChecklistSummary(completionChecklist);
  const ok = missing.length === 0 && providerRegistry.length > 0;

  const receipt = createReceipt({
    ok,
    provider: "autobuilder_v2",
    action: "run_validation",
    category: "validate",
    operation: "validate_universal_capability_bus",
    requestedCapability: "Validate AUTO BUILDER 2 completion checklist, provider registry, and required scaffold state.",
    authStatus: "not_required",
    executionMode: "api",
    status: ok ? "completed" : "blocked",
    logs: [
      `Checklist total: ${summary.total}`,
      `Checklist done: ${summary.done}`,
      `Checklist completion: ${summary.percent}%`,
      `Providers registered: ${providerRegistry.length}`
    ],
    blockers: missing,
    fallbackMode: "Create repair tasks for missing checklist entries.",
    nextActions: ok ? ["Prepare release packet."] : ["Run repair queue.", "Re-run validation."]
  });

  return { ok, summary, providers: providerRegistry.length, missing, receipt };
}

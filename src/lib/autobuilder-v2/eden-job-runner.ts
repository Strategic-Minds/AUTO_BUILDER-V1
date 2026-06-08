export type EdenJobPayload = {
  job_id: string;
  mode?: "status" | "readiness" | "dry_run" | "execute";
  objective?: string;
  actions?: string[];
  blocked_actions?: string[];
  approval_required?: boolean;
  payload?: Record<string, unknown>;
};

const defaultBlockedActions = [
  "publish",
  "deploy",
  "payment",
  "live_social",
  "external_message",
  "delete",
  "rename_existing",
  "schema_migration"
];

export function edenRuntimeStatus(input: Partial<EdenJobPayload> = {}) {
  return {
    ok: true,
    service: "eden",
    action: "eden.runtime.status",
    job_id: input.job_id ?? `eden-runtime-status-${Date.now()}`,
    mode: "status",
    status: "planned",
    readiness: "partial",
    automation_surface: ["trend_discovery", "readiness", "dry_run", "receipts", "fallback_routing"],
    blocked_actions: defaultBlockedActions,
    receipts: [
      {
        receiptId: `receipt_${Date.now()}`,
        timestamp: new Date().toISOString(),
        provider: "eden",
        action: "eden.runtime.status",
        status: "planned"
      }
    ],
    next_actions: [
      "Validate Eden secrets/runtime adapter.",
      "Run eden.trend_discovery.readiness.",
      "Run eden.trend_discovery.dry_run before execution."
    ]
  };
}

export function edenTrendDiscoveryReadiness(input: Partial<EdenJobPayload> = {}) {
  return {
    ok: true,
    service: "eden",
    action: "eden.trend_discovery.readiness",
    job_id: input.job_id ?? `eden-trend-readiness-${Date.now()}`,
    mode: "readiness",
    readiness: "partial",
    checks: [
      { name: "objective_present", ok: Boolean(input.objective || input.payload?.objective) },
      { name: "blocked_actions_policy", ok: true },
      { name: "receipt_contract", ok: true },
      { name: "runtime_adapter", ok: false, status: "adapter_not_verified" }
    ],
    blocked_actions: Array.from(new Set([...(input.blocked_actions ?? []), ...defaultBlockedActions])),
    next_actions: [
      "Confirm Eden runtime credentials or bridge route.",
      "Run dry_run with discovery objective.",
      "Persist readiness receipt."
    ]
  };
}

export function edenTrendDiscoveryDryRun(input: EdenJobPayload) {
  const blockedActions = Array.from(new Set([...(input.blocked_actions ?? []), ...defaultBlockedActions]));
  const actions = input.actions?.length ? input.actions : ["discover_trends", "score_opportunities", "write_receipts", "validate_outputs"];

  return {
    ok: true,
    service: "eden",
    action: "eden.trend_discovery.dry_run",
    job_id: input.job_id,
    mode: "dry_run",
    objective: input.objective ?? "Discover trend opportunities and return governed execution packet.",
    approval_required: input.approval_required ?? true,
    blocked_actions: blockedActions,
    planned_operations: actions.map((action) => ({
      provider: "eden",
      action,
      dry_run: true,
      status: blockedActions.some((blocked) => action === blocked || action.includes(blocked)) ? "blocked_by_policy" : "planned"
    })),
    receipts: [
      {
        receiptId: `receipt_${Date.now()}`,
        timestamp: new Date().toISOString(),
        provider: "eden",
        action: "eden.trend_discovery.dry_run",
        status: "planned",
        logs: ["Eden trend discovery dry-run planned. No external publishing, deployment, payment, or live social mutation performed."]
      }
    ],
    validation_status: "planned",
    rollback_plan: "No rollback required for dry-run. Executed Eden jobs require provider-specific receipt rollback details.",
    next_actions: [
      "Review planned operations.",
      "Approve only non-blocked actions.",
      "Route execution through verified Eden adapter or fallback."
    ]
  };
}

export function runEdenJob(input: EdenJobPayload) {
  const mode = input.mode ?? "dry_run";

  if (mode === "status") return edenRuntimeStatus(input);
  if (mode === "readiness") return edenTrendDiscoveryReadiness(input);
  if (mode === "dry_run") return edenTrendDiscoveryDryRun({ ...input, mode: "dry_run" });

  return {
    ok: false,
    service: "eden",
    action: "run_eden_job",
    job_id: input.job_id,
    mode,
    status: "blocked",
    reason: "Eden execute mode is blocked until runtime adapter is verified and approval is explicit.",
    blocked_actions: Array.from(new Set([...(input.blocked_actions ?? []), ...defaultBlockedActions])),
    fallbackMode: "Use dry_run, readiness, or route through verified n8n/browser/manual receipt fallback.",
    next_actions: ["Run readiness.", "Run dry_run.", "Verify Eden adapter."]
  };
}

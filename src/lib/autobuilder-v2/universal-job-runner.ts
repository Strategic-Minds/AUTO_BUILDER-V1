import { runDriveJob } from "./drive-job-runner";

export type UniversalJobPayload = {
  job_id: string;
  mode?: "dry_run" | "approval_gated" | "execute";
  provider: string;
  objective: string;
  root_resource_id?: string;
  actions?: string[];
  blocked_actions?: string[];
  approval_required?: boolean;
  fallbacks?: string[];
  payload?: Record<string, unknown>;
};

const defaultBlockedActions = [
  "delete",
  "rename_existing",
  "move_existing",
  "publish",
  "deploy",
  "payment",
  "live_social",
  "external_message",
  "schema_migration",
  "billing_change",
  "production_env_change"
];

const defaultFallbacks = [
  "n8n",
  "browser",
  "manual_receipt",
  "github_workflow",
  "vercel_route",
  "supabase_queue"
];

export function runUniversalJob(input: UniversalJobPayload) {
  const mode = input.mode ?? "dry_run";
  const provider = input.provider.toLowerCase();
  const actions = input.actions ?? [];
  const blockedActions = Array.from(new Set([...(input.blocked_actions ?? []), ...defaultBlockedActions]));
  const fallbacks = Array.from(new Set([...(input.fallbacks ?? []), ...defaultFallbacks]));
  const blockedOperations = actions
    .filter((action) => blockedActions.some((blocked) => action === blocked || action.includes(blocked)))
    .map((action) => ({ action, status: "blocked_by_policy" }));

  const base = {
    job_id: input.job_id,
    provider,
    objective: input.objective,
    mode,
    dry_run: mode === "dry_run",
    approval_required: input.approval_required ?? mode !== "dry_run",
    blocked_actions: blockedActions,
    fallbacks,
    validation_status: blockedOperations.length ? "blocked" : "planned",
    rollback_plan: "Dry-run jobs produce no external mutation. Executed jobs require provider-specific receipt rollback details.",
    blocked_operations: blockedOperations
  };

  if (provider === "drive" || provider === "google_workspace") {
    const driveResult = runDriveJob({
      job_id: input.job_id,
      mode: mode === "dry_run" ? "missing_only" : "full_sync",
      root_folder_id: input.root_resource_id ?? String(input.payload?.root_folder_id ?? "unknown"),
      dry_run: mode !== "execute",
      actions: actions.length ? actions : ["validate_tree", "write_receipts"],
      blocked_actions: blockedActions,
      folders: input.payload?.folders as never,
      files: input.payload?.files as never,
      images: input.payload?.images as never,
      moves: input.payload?.moves as never,
      receipt_folder_id: input.payload?.receipt_folder_id as string | undefined
    });

    return {
      ...base,
      routed_to: "run_drive_job",
      validation_status: driveResult.ok ? "planned" : "blocked",
      planned_operations: driveResult.planned_operations,
      receipts: driveResult.receipts,
      provider_result: driveResult
    };
  }

  return {
    ...base,
    routed_to: "manual_receipt",
    planned_operations: actions.map((action) => ({
      provider,
      action,
      dry_run: mode === "dry_run",
      execution_hint: "Provider adapter not yet implemented. Queue through selected fallback."
    })),
    receipts: [
      {
        receiptId: `receipt_${Date.now()}`,
        timestamp: new Date().toISOString(),
        provider,
        action: "run_universal_job",
        status: "planned",
        logs: ["Universal job planned in fallback receipt mode."],
        nextActions: [
          "Add provider-specific adapter.",
          "Route through selected fallback.",
          "Validate with dry-run before execute."
        ]
      }
    ]
  };
}

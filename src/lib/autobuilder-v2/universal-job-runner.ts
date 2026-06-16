import { triggerVercelRedeploy, type RedeployTarget } from "../bridges/vercelRedeployBridge";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function boolValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function targetSystem(value: unknown): RedeployTarget {
  return value === "eden_skye_studios" ? "eden_skye_studios" : "auto_builder";
}

function redeployTerms(objective: string, actions: string[]) {
  return [objective, ...actions].map((item) => item.toLowerCase());
}

function hasRedeployIntent(objective: string, actions: string[]) {
  return redeployTerms(objective, actions).some((term) => term.includes("redeploy"));
}

function normalizeProvider(provider: string, objective: string, actions: string[]) {
  const normalized = provider.toLowerCase();
  if ((normalized === "auto_builder" || normalized === "auto-builder") && hasRedeployIntent(objective, actions)) {
    return "vercel";
  }
  return normalized;
}

function isVercelRedeploy(provider: string, objective: string, actions: string[]) {
  return provider === "vercel" && hasRedeployIntent(objective, actions);
}

function productionApproved(payload: Record<string, unknown>) {
  return boolValue(payload.approvedProductionDeploy) === true && payload.approvalPhrase === "APPROVE PRODUCTION DEPLOY";
}

function receiptId(prefix: string) {
  return `${prefix}_${Date.now()}`;
}

async function runVercelRedeployJob(input: UniversalJobPayload, provider: string, actions: string[], blockedActions: string[], fallbacks: string[]) {
  const payload = isRecord(input.payload) ? input.payload : {};
  const mode = input.mode ?? "dry_run";
  const target = targetSystem(payload.targetSystem ?? payload.target_system ?? input.root_resource_id);
  const redeployMode = payload.mode === "production" || payload.target === "production" ? "production" : "preview";
  const productionBlocked = redeployMode === "production" && !productionApproved(payload);
  const blockedOperations = productionBlocked
    ? [{ action: "production_redeploy", status: "blocked_by_policy", reason: "Production redeploy requires APPROVE PRODUCTION DEPLOY." }]
    : [];
  const dryRun = mode !== "execute";

  const base = {
    job_id: input.job_id,
    provider,
    objective: input.objective,
    mode,
    dry_run: dryRun,
    approval_required: productionBlocked || (input.approval_required ?? false),
    blocked_actions: blockedActions,
    fallbacks,
    validation_status: productionBlocked ? "blocked" : dryRun ? "planned" : "queued",
    rollback_plan: "Preview redeploys can be rolled back by promoting or redeploying the prior Vercel deployment. Production redeploys remain approval-gated.",
    blocked_operations: blockedOperations,
    routed_to: "vercel_redeploy_bridge"
  };

  if (productionBlocked) {
    return {
      ...base,
      planned_operations: [
        {
          provider,
          action: "production_redeploy",
          dry_run: true,
          status: "blocked_by_policy",
          execution_hint: "Provide approvedProductionDeploy=true and approvalPhrase=APPROVE PRODUCTION DEPLOY only when production redeploy is explicitly approved."
        }
      ],
      receipts: [
        {
          receiptId: receiptId("vercel_redeploy_blocked"),
          timestamp: new Date().toISOString(),
          provider,
          action: "run_universal_job",
          status: "blocked",
          logs: ["Production redeploy blocked by governance policy."],
          nextActions: ["Use preview mode or provide explicit production approval phrase."]
        }
      ]
    };
  }

  if (dryRun) {
    return {
      ...base,
      planned_operations: [
        {
          provider,
          action: "preview_redeploy",
          target_system: target,
          dry_run: true,
          execution_hint: "Vercel preview redeploy adapter is wired. Run with mode=execute to call the governed bridge."
        }
      ],
      receipts: [
        {
          receiptId: receiptId("vercel_redeploy_plan"),
          timestamp: new Date().toISOString(),
          provider,
          action: "run_universal_job",
          status: "planned",
          logs: ["Vercel preview redeploy planned through governed bridge."],
          nextActions: ["Run mode=execute for preview redeploy.", "Verify deployment commit and routes after Vercel returns a deployment URL."]
        }
      ]
    };
  }

  const providerResult = await triggerVercelRedeploy({
    targetSystem: target,
    mode: redeployMode,
    ref: stringValue(payload.ref) ?? "main",
    sha: stringValue(payload.sha),
    requestedBy: stringValue(payload.requestedBy) ?? "AUTO BUILDER 2 Universal Runner",
    projectId: stringValue(payload.projectId) ?? stringValue(payload.project_id),
    repoId: stringValue(payload.repoId) ?? stringValue(payload.repo_id),
    approvedProductionDeploy: boolValue(payload.approvedProductionDeploy),
    approvalPhrase: stringValue(payload.approvalPhrase),
    metadata: isRecord(payload.metadata) ? Object.fromEntries(Object.entries(payload.metadata).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : undefined
  });

  return {
    ...base,
    validation_status: providerResult.ok ? "queued" : providerResult.blocked ? "blocked" : "failed",
    planned_operations: [
      {
        provider,
        action: "preview_redeploy",
        target_system: target,
        dry_run: false,
        status: providerResult.ok ? "submitted" : "failed"
      }
    ],
    receipts: [
      {
        receiptId: receiptId("vercel_redeploy_execute"),
        timestamp: new Date().toISOString(),
        provider,
        action: "run_universal_job",
        status: providerResult.ok ? "queued" : providerResult.blocked ? "blocked" : "failed",
        logs: [providerResult.ok ? "Vercel redeploy submitted through governed bridge." : "Vercel redeploy bridge returned a non-ready response."],
        nextActions: providerResult.ok
          ? ["Poll Vercel deployment until READY or ERROR.", "Verify deployment commit and required runtime routes."]
          : ["Inspect provider_result error/status.", "Fall back to browser worker only if BROWSER_WORKER_URL is configured."]
      }
    ],
    provider_result: providerResult
  };
}

export async function runUniversalJob(input: UniversalJobPayload) {
  const mode = input.mode ?? "dry_run";
  const actions = input.actions ?? [];
  const provider = normalizeProvider(input.provider, input.objective, actions);
  const blockedActions = Array.from(new Set([...(input.blocked_actions ?? []), ...defaultBlockedActions]));
  const fallbacks = Array.from(new Set([...(input.fallbacks ?? []), ...defaultFallbacks]));

  if (isVercelRedeploy(provider, input.objective, actions)) {
    return runVercelRedeployJob(input, provider, actions, blockedActions, fallbacks);
  }

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

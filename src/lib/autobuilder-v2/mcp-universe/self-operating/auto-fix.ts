export function planAutoFixWork(validationFailures: string[] = []) {
  const failures = validationFailures.length > 0 ? validationFailures : ["no_current_validation_failures"];
  return {
    productionActionAllowed: false,
    mode: "branch_safe_fix_planning",
    workItems: failures.map((failure) => ({
      id: `auto-fix-${failure}`,
      failure,
      status: failure === "no_current_validation_failures" ? "standby" : "queued_patch_plan",
      nextSafeStep: failure === "no_current_validation_failures"
        ? "Keep auto-fix worker ready for future failed checks."
        : "Draft patch, create branch-safe PR plan, and rerun validators."
    })),
    allowedActions: ["draft_issue", "draft_patch", "draft_pr", "recommend_dependency_update", "rerun_validation"],
    blockedWithoutApproval: ["merge_pr", "production_deploy", "secret_change", "database_write", "workflow_activation"],
    nextAction: "Connect GitHub branch-safe PR generator after validation failure receipts exist."
  };
}

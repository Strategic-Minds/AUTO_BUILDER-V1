export const expectedStrict20Tools = [
  "health_check",
  "get_repo_summary",
  "list_repo_files",
  "read_bootstrap_status",
  "read_text_file",
  "run_job",
  "run_universal_job",
  "run_drive_job",
  "drive_list_tree",
  "drive_create_folder",
  "drive_move_folder",
  "drive_move_file",
  "drive_write_receipt",
  "run_platform_provisioning_job",
  "create_github_repo",
  "create_vercel_project",
  "create_vercel_workflow",
  "create_vercel_agent",
  "create_ai_gateway",
  "rollback"
];

export const stableMinimumTools = [
  "health_check",
  "get_repo_summary",
  "list_repo_files",
  "read_text_file",
  "run_universal_job",
  "rollback"
];

function normalizeToolName(tool: unknown) {
  if (typeof tool === "string") return tool;
  if (!tool || typeof tool !== "object") return "";
  const candidate = tool as { name?: string; id?: string; tool?: string };
  return candidate.name || candidate.id || candidate.tool || "";
}

export function analyzeToolExposure(input: {
  exposedTools?: unknown[];
  expectedTools?: string[];
} = {}) {
  const exposedTools = [...new Set((input.exposedTools ?? []).map(normalizeToolName).filter(Boolean))].sort();
  const expectedTools = input.expectedTools ?? expectedStrict20Tools;
  const missingTools = expectedTools.filter((tool) => !exposedTools.includes(tool));
  const exposedExpectedTools = expectedTools.filter((tool) => exposedTools.includes(tool));
  const stableMissingTools = stableMinimumTools.filter((tool) => !exposedTools.includes(tool));
  const hasUniversalExecutor = exposedTools.includes("run_universal_job");
  const mode = missingTools.length === 0
    ? "strict_20_available"
    : hasUniversalExecutor
      ? "universal_executor_fallback"
      : "cloud_queue_fallback";

  return {
    status: missingTools.length === 0 ? "ready" : "degraded",
    mode,
    expected_count: expectedTools.length,
    exposed_count: exposedExpectedTools.length,
    exposed_tools: exposedTools,
    exposed_expected_tools: exposedExpectedTools,
    missing_tools: missingTools,
    stable_minimum_tools: stableMinimumTools,
    stable_missing_tools: stableMissingTools,
    fallback_required: missingTools.length > 0,
    can_execute_remote_jobs: hasUniversalExecutor,
    cloud_only: true,
    recommended_next_action: missingTools.length === 0
      ? "Use strict-20 MCP tool surface."
      : hasUniversalExecutor
        ? "Route execution through run_universal_job with explicit job types and governance."
        : "Use cloud queue fallback, emit missing-tool receipt, and continue without local dependency."
  };
}

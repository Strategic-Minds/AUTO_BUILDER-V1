export const autonomousBridgeRegistry = {
  version: "2026-06-06",
  system: "AWOS Autonomous Bridge Layer",
  bridgeIds: [
    "gpt_cloud_control_plane",
    "local_device_relay",
    "github_repo_bridge",
    "vercel_runtime_bridge",
    "supabase_state_bridge",
    "drive_sheets_source_truth_bridge",
    "shopify_commerce_bridge",
    "stripe_finance_bridge",
    "browser_qa_bridge",
    "social_distribution_bridge",
    "slack_operator_bridge",
    "audit_receipt_recovery_bridge"
  ],
  smokeOrder: ["heartbeat", "secret_names_only", "read_harmless_file", "write_harmless_file", "execute_harmless_command", "browser_screenshot", "git_status", "connector_by_connector_widening"]
} as const;

export type AutonomousBridgeId = (typeof autonomousBridgeRegistry.bridgeIds)[number];

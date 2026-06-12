type Step35Tuple = [string, string, string, string, string];

export const step35Rows: Step35Tuple[] = [
  ["openapi/eden-image-install-executor.openapi.yaml", "16_GITHUB_AUTOBUILDER_DOCS", "1Bk5Qtepu-wZiW6sJ96S1SJUvPIqOtCnw", "PHASE_3_STEP_35_IMAGE_INSTALL_EXECUTOR_ACTION_PACKAGE", "ready_for_upload"],
  ["custom-gpt/custom-gpt-action-configuration.md", "16_GITHUB_AUTOBUILDER_DOCS", "1Bk5Qtepu-wZiW6sJ96S1SJUvPIqOtCnw", "PHASE_3_STEP_35_IMAGE_INSTALL_EXECUTOR_ACTION_PACKAGE", "ready_for_upload"],
  ["custom-gpt/custom-gpt-instructions.md", "16_GITHUB_AUTOBUILDER_DOCS", "1Bk5Qtepu-wZiW6sJ96S1SJUvPIqOtCnw", "PHASE_3_STEP_35_IMAGE_INSTALL_EXECUTOR_ACTION_PACKAGE", "ready_for_upload"],
  ["executor/executor-contract.md", "16_GITHUB_AUTOBUILDER_DOCS", "1Bk5Qtepu-wZiW6sJ96S1SJUvPIqOtCnw", "PHASE_3_STEP_35_IMAGE_INSTALL_EXECUTOR_ACTION_PACKAGE", "ready_for_upload"],
  ["executor/reference-route-handler.ts", "21_EXECUTABLE_GITHUB_PACKAGE", "1BLI5Sn1WSYBvnKLZq71GKZzTSHiFsdmw", "PHASE_3_STEP_35_IMAGE_INSTALL_EXECUTOR_ACTION_PACKAGE", "ready_for_upload"],
  ["autobuilder/AUTO_BUILDER_IMAGE_INSTALL_EXECUTOR_PACKET.md", "16_GITHUB_AUTOBUILDER_DOCS", "1Bk5Qtepu-wZiW6sJ96S1SJUvPIqOtCnw", "PHASE_3_STEP_35_IMAGE_INSTALL_EXECUTOR_ACTION_PACKAGE", "ready_for_upload"],
  ["autobuilder/PHASE_3_STEP_35_BUILD_PACKET.md", "16_GITHUB_AUTOBUILDER_DOCS", "1Bk5Qtepu-wZiW6sJ96S1SJUvPIqOtCnw", "PHASE_3_STEP_35_IMAGE_INSTALL_EXECUTOR_ACTION_PACKAGE", "ready_for_upload"],
  ["supabase/0007_image_install_executor_tables.sql", "11_SUPABASE_OS", "1N05GRCgYMrIxFIq1nVbD3M3CkstSecti", "PHASE_3_STEP_35_IMAGE_INSTALL_EXECUTOR_ACTION_PACKAGE", "ready_for_upload"],
  ["canonical_ultralife_image_manifest.csv", "08_STOCK_IMAGE_MODEL_ASSETS", "1V8MNsOdvLNSd04JQrnyvH1ECnj3nOF8P", "PHASE_3_STEP_35_CANONICAL_IMAGES_PENDING_REVIEW", "ready_for_upload"],
  ["canonical_ultralife_image_manifest.json", "08_STOCK_IMAGE_MODEL_ASSETS", "1V8MNsOdvLNSd04JQrnyvH1ECnj3nOF8P", "PHASE_3_STEP_35_CANONICAL_IMAGES_PENDING_REVIEW", "ready_for_upload"],
  ["approval_and_usage_rules.md", "08_STOCK_IMAGE_MODEL_ASSETS", "1V8MNsOdvLNSd04JQrnyvH1ECnj3nOF8P", "PHASE_3_STEP_35_CANONICAL_IMAGES_PENDING_REVIEW", "ready_for_upload"],
  ["images/*.png", "08_STOCK_IMAGE_MODEL_ASSETS", "1V8MNsOdvLNSd04JQrnyvH1ECnj3nOF8P", "PHASE_3_STEP_35_CANONICAL_IMAGES_PENDING_REVIEW", "ready_for_upload"],
  ["VALIDATION_CHECKLIST.md", "23_VALIDATION_REPORTS", "1dVZN_Fp-iZdwB6a4DbzNFyHPUZQNujFS", "PHASE_3_STEP_35_VALIDATION_RECEIPTS", "ready_for_upload"],
  ["FINAL_BLOCKER_FIX_REPORT.md", "23_VALIDATION_REPORTS", "1dVZN_Fp-iZdwB6a4DbzNFyHPUZQNujFS", "PHASE_3_STEP_35_VALIDATION_RECEIPTS", "ready_for_upload"],
];

const imageFiles = [
  "eden-canonical-01-flagship-hero.png",
  "eden-canonical-02-founder-profile.png",
  "eden-canonical-03-international-female.png",
  "eden-canonical-04-international-male.png",
  "eden-canonical-05-mature-male.png",
  "eden-canonical-06-mature-female.png",
  "eden-canonical-07-production-campaign.png",
];

export type Step35Row = {
  local_path: string;
  drive_parent_folder_title: string;
  drive_parent_folder_id: string;
  recommended_drive_subfolder: string;
  status_after_upload: string;
  wildcard_source?: string;
};

export function expandedStep35Rows(): Step35Row[] {
  return step35Rows.flatMap(([
    local_path,
    drive_parent_folder_title,
    drive_parent_folder_id,
    recommended_drive_subfolder,
    status_after_upload,
  ]): Step35Row[] => {
    if (local_path !== "images/*.png") {
      return [{ local_path, drive_parent_folder_title, drive_parent_folder_id, recommended_drive_subfolder, status_after_upload }];
    }

    return imageFiles.map((file): Step35Row => ({
      local_path: `images/${file}`,
      wildcard_source: local_path,
      drive_parent_folder_title,
      drive_parent_folder_id,
      recommended_drive_subfolder,
      status_after_upload,
    }));
  });
}

export function validateRows(rows: Step35Row[]) {
  const errors: string[] = [];
  for (const row of rows) {
    if (row.status_after_upload === "approved_public") errors.push(`${row.local_path} attempts approved_public promotion`);
    if (!row.drive_parent_folder_id) errors.push(`${row.local_path} missing Drive parent folder id`);
    if (!row.recommended_drive_subfolder) errors.push(`${row.local_path} missing Step 35 subfolder`);
  }
  return errors;
}

export function hostedRunnerStatus() {
  return {
    status: "ok",
    service: "eden-step35-hosted-recovery-runner",
    mode: "preview_only",
    row_count: expandedStep35Rows().length,
    env: {
      has_google_client_email: Boolean(process.env.GOOGLE_CLIENT_EMAIL),
      has_google_private_key: Boolean(process.env.GOOGLE_PRIVATE_KEY),
      has_step35_package_base_url: Boolean(process.env.STEP35_PACKAGE_BASE_URL),
    },
    forbidden: [
      "production_deploy",
      "drive_delete",
      "drive_overwrite",
      "drive_move_existing",
      "shopify_mutation",
      "payment_activation",
      "social_publish",
      "heygen_activation",
      "live_database_migration",
      "mark_approved_public",
    ],
  };
}

export type Step35Status =
  | "reference_board"
  | "temporary_preview"
  | "generated_pending_review"
  | "approved_public"
  | "rejected"
  | "quarantined"
  | "missing_asset"
  | "ready_for_upload";

export type Step35PlacementRow = {
  localPath: string;
  driveParentFolderTitle: string;
  driveParentFolderId: string;
  recommendedDriveSubfolder: string;
  statusAfterUpload: Step35Status;
  note: string;
};

const DRIVE_ROOT_ID = "1oCEjD6kUm9FiYDh1w-dNE9PPiggj65MQ";

const seedImagePaths = [
  "generated-assets/eden-skye-mvp-seed-01.png",
  "generated-assets/eden-skye-mvp-seed-02.png",
  "generated-assets/eden-skye-mvp-seed-03.png",
  "generated-assets/eden-skye-mvp-seed-04.png",
  "generated-assets/eden-skye-mvp-seed-05.png",
  "generated-assets/eden-skye-mvp-seed-06.png",
  "generated-assets/eden-skye-mvp-seed-07.png",
];

export const step35Statuses = [
  "reference_board",
  "temporary_preview",
  "generated_pending_review",
  "approved_public",
  "rejected",
  "quarantined",
  "missing_asset",
] as const;

export const forbiddenStep35Actions = [
  "delete_drive_file",
  "overwrite_drive_file",
  "move_drive_file",
  "mark_approved_public",
  "publish_social_content",
  "activate_heygen",
  "mutate_shopify",
  "activate_payments",
  "deploy_production",
  "run_live_database_migration",
];

export function expandedStep35Rows(): Step35PlacementRow[] {
  const packageFiles: Step35PlacementRow[] = [
    row("openapi/eden-step35-image-install-executor.openapi.yaml", "99_STEP_35_OPENAPI_ACTION_PACKAGE", "ready_for_upload", "Custom GPT action schema."),
    row("auth/EDEN_STEP35_AUTHENTICATION_SPEC.md", "99_STEP_35_OPENAPI_ACTION_PACKAGE", "ready_for_upload", "Authentication specification."),
    row("custom-gpt/EDEN_STEP35_CUSTOM_GPT_ACTION_CONFIG.md", "99_STEP_35_OPENAPI_ACTION_PACKAGE", "ready_for_upload", "Custom GPT Action setup."),
    row("auto-builder/EDEN_STEP35_AUTO_BUILDER_INTEGRATION_PACKET.md", "99_STEP_35_OPENAPI_ACTION_PACKAGE", "ready_for_upload", "Auto Builder integration packet."),
    row("drive-placement/PLACEMENT_MANIFEST.csv", "99_STEP_35_OPENAPI_ACTION_PACKAGE", "ready_for_upload", "Drive placement manifest."),
    row("drive-placement/DRIVE_PLACEMENT_PLAN.md", "99_STEP_35_OPENAPI_ACTION_PACKAGE", "ready_for_upload", "Drive placement plan."),
    row("supabase/EDEN_STEP35_SUPABASE_IMAGE_INSTALL_DRAFT.sql", "99_STEP_35_OPENAPI_ACTION_PACKAGE", "ready_for_upload", "Supabase draft only; not executed."),
  ];

  const imageFiles = seedImagePaths.map((localPath) =>
    row(localPath, "03_GENERATED_PENDING_REVIEW", "generated_pending_review", "Generated seed image awaiting human approval.")
  );

  return [...packageFiles, ...imageFiles];
}

function row(
  localPath: string,
  recommendedDriveSubfolder: string,
  statusAfterUpload: Step35Status,
  note: string
): Step35PlacementRow {
  return {
    localPath,
    driveParentFolderTitle: "Eden Skye Studios Canonical Image System Root",
    driveParentFolderId: DRIVE_ROOT_ID,
    recommendedDriveSubfolder,
    statusAfterUpload,
    note,
  };
}

export function validateStep35Rows(rows = expandedStep35Rows()): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const rowItem of rows) {
    if (!rowItem.localPath) errors.push("A placement row is missing localPath.");
    if (!rowItem.driveParentFolderId) errors.push(`${rowItem.localPath} is missing driveParentFolderId.`);
    if (!rowItem.recommendedDriveSubfolder) errors.push(`${rowItem.localPath} is missing recommendedDriveSubfolder.`);
    if (rowItem.statusAfterUpload === "approved_public") {
      errors.push(`${rowItem.localPath} cannot be marked approved_public by Step 35.`);
    }
    if (seen.has(rowItem.localPath)) errors.push(`${rowItem.localPath} appears more than once.`);
    seen.add(rowItem.localPath);
  }

  return errors;
}

export function statusSummary(rows = expandedStep35Rows()) {
  return rows.reduce<Record<string, number>>((summary, rowItem) => {
    summary[rowItem.statusAfterUpload] = (summary[rowItem.statusAfterUpload] ?? 0) + 1;
    return summary;
  }, {});
}

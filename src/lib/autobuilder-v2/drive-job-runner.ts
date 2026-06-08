import { createReceipt } from "./receipts";

export type DriveJobAction =
  | "list_tree"
  | "create_missing_folders"
  | "upload_file"
  | "upload_image"
  | "upload_model_images"
  | "move_file"
  | "move_folder"
  | "write_receipts"
  | "validate_tree";

export type DriveJobRequest = {
  job_id: string;
  mode?: "missing_only" | "full_sync" | "validate_only";
  root_folder_id: string;
  dry_run?: boolean;
  actions: DriveJobAction[] | string[];
  blocked_actions?: string[];
  folders?: Array<{
    name: string;
    parent_folder_id?: string;
    path?: string;
  }>;
  files?: Array<{
    name: string;
    source_path?: string;
    mime_type?: string;
    parent_folder_id?: string;
  }>;
  images?: Array<{
    name: string;
    source_path?: string;
    mime_type?: string;
    parent_folder_id?: string;
  }>;
  moves?: Array<{
    item_id: string;
    from_folder_id?: string;
    to_folder_id: string;
    item_type: "file" | "folder";
  }>;
  receipt_folder_id?: string;
};

export type DriveJobResult = {
  ok: boolean;
  job_id: string;
  mode: string;
  root_folder_id: string;
  dry_run: boolean;
  accepted_actions: string[];
  blocked_actions: string[];
  planned_operations: Array<Record<string, unknown>>;
  blocked_operations: Array<Record<string, unknown>>;
  receipts: unknown[];
  next_actions: string[];
};

const defaultBlockedActions = [
  "delete",
  "rename_existing",
  "move_existing",
  "publish",
  "deploy",
  "payment",
  "live_social"
];

function isBlocked(action: string, blockedActions: string[]) {
  return blockedActions.some((blocked) => action === blocked || action.includes(blocked));
}

export function runDriveJob(request: DriveJobRequest): DriveJobResult {
  const blockedActions = Array.from(new Set([...(request.blocked_actions ?? []), ...defaultBlockedActions]));
  const dryRun = request.dry_run ?? true;
  const acceptedActions = request.actions.filter((action) => !isBlocked(String(action), blockedActions)).map(String);
  const blockedActionList = request.actions.filter((action) => isBlocked(String(action), blockedActions)).map(String);

  const planned_operations: Array<Record<string, unknown>> = [];
  const blocked_operations: Array<Record<string, unknown>> = blockedActionList.map((action) => ({
    action,
    status: "blocked_by_policy",
    reason: "Action matched blocked_actions policy."
  }));

  for (const action of acceptedActions) {
    if (action === "create_missing_folders") {
      for (const folder of request.folders ?? []) {
        planned_operations.push({
          action,
          provider: "google_workspace",
          target: "drive",
          mode: request.mode ?? "missing_only",
          dry_run: dryRun,
          folder,
          execution_hint: "Use Google Drive files.create with mimeType application/vnd.google-apps.folder."
        });
      }
    }

    if (action === "upload_file") {
      for (const file of request.files ?? []) {
        planned_operations.push({
          action,
          provider: "google_workspace",
          target: "drive",
          dry_run: dryRun,
          file,
          execution_hint: "Use Google Drive files.create multipart upload."
        });
      }
    }

    if (action === "upload_image" || action === "upload_model_images") {
      for (const image of request.images ?? []) {
        planned_operations.push({
          action,
          provider: "google_workspace",
          target: "drive",
          dry_run: dryRun,
          image,
          execution_hint: "Use Google Drive files.create multipart upload with image MIME type."
        });
      }
    }

    if (action === "move_file" || action === "move_folder") {
      for (const move of request.moves ?? []) {
        planned_operations.push({
          action,
          provider: "google_workspace",
          target: "drive",
          dry_run: dryRun,
          move,
          execution_hint: "Use Google Drive files.update with addParents/removeParents."
        });
      }
    }

    if (action === "list_tree" || action === "validate_tree" || action === "write_receipts") {
      planned_operations.push({
        action,
        provider: "google_workspace",
        target: "drive",
        dry_run: dryRun,
        root_folder_id: request.root_folder_id,
        execution_hint:
          action === "list_tree"
            ? "Use Google Drive files.list scoped to folder parents."
            : action === "validate_tree"
              ? "Compare expected folders/files against Drive metadata."
              : "Write JSON receipt into receipt folder or configured Drive receipts location."
      });
    }
  }

  const receipt = createReceipt({
    ok: blocked_operations.length === 0,
    provider: "google_workspace",
    action: "run_drive_job",
    category: "execute",
    operation: "drive_job_plan",
    requestedCapability: "Run Google Drive job through AUTO BUILDER 2 MCP.",
    authStatus: "unknown",
    executionMode: dryRun ? "manual_receipt" : "provider_routed",
    status: dryRun ? "planned" : "queued",
    projectId: request.root_folder_id,
    logs: [
      `Drive job ${request.job_id} accepted ${acceptedActions.length} actions.`,
      `Dry run: ${dryRun}`,
      `Blocked actions: ${blockedActions.join(", ")}`
    ],
    artifacts: ["drive-job", request.job_id],
    fallbackMode: "If direct Drive REST adapter is unavailable, queue through n8n or Google Workspace connector.",
    nextActions: [
      "Validate root folder access.",
      "Execute non-blocked planned operations.",
      "Write Drive receipt.",
      "Validate tree after execution."
    ]
  });

  return {
    ok: blocked_operations.length === 0,
    job_id: request.job_id,
    mode: request.mode ?? "missing_only",
    root_folder_id: request.root_folder_id,
    dry_run: dryRun,
    accepted_actions: acceptedActions,
    blocked_actions: blockedActions,
    planned_operations,
    blocked_operations,
    receipts: [receipt],
    next_actions: [
      dryRun ? "Re-run with dry_run=false after reviewing planned operations." : "Execute through Drive adapter or n8n bridge.",
      "Call drive_write_receipt after execution.",
      "Call drive_list_tree or run_drive_job validate_tree to verify."
    ]
  };
}

export function driveListTree(root_folder_id: string) {
  return runDriveJob({
    job_id: `drive-list-tree-${Date.now()}`,
    root_folder_id,
    dry_run: true,
    actions: ["list_tree", "validate_tree"]
  });
}

export function driveCreateFolder(input: { root_folder_id: string; name: string; parent_folder_id?: string; dry_run?: boolean }) {
  return runDriveJob({
    job_id: `drive-create-folder-${Date.now()}`,
    root_folder_id: input.root_folder_id,
    dry_run: input.dry_run ?? true,
    actions: ["create_missing_folders", "write_receipts", "validate_tree"],
    folders: [{ name: input.name, parent_folder_id: input.parent_folder_id ?? input.root_folder_id }]
  });
}

export function driveUploadFile(input: { root_folder_id: string; name: string; source_path?: string; mime_type?: string; parent_folder_id?: string; dry_run?: boolean }) {
  return runDriveJob({
    job_id: `drive-upload-file-${Date.now()}`,
    root_folder_id: input.root_folder_id,
    dry_run: input.dry_run ?? true,
    actions: ["upload_file", "write_receipts", "validate_tree"],
    files: [{ name: input.name, source_path: input.source_path, mime_type: input.mime_type, parent_folder_id: input.parent_folder_id ?? input.root_folder_id }]
  });
}

export function driveUploadImage(input: { root_folder_id: string; name: string; source_path?: string; mime_type?: string; parent_folder_id?: string; dry_run?: boolean }) {
  return runDriveJob({
    job_id: `drive-upload-image-${Date.now()}`,
    root_folder_id: input.root_folder_id,
    dry_run: input.dry_run ?? true,
    actions: ["upload_image", "write_receipts", "validate_tree"],
    images: [{ name: input.name, source_path: input.source_path, mime_type: input.mime_type ?? "image/png", parent_folder_id: input.parent_folder_id ?? input.root_folder_id }]
  });
}

export function driveMoveFile(input: { root_folder_id: string; item_id: string; to_folder_id: string; from_folder_id?: string; dry_run?: boolean }) {
  return runDriveJob({
    job_id: `drive-move-file-${Date.now()}`,
    root_folder_id: input.root_folder_id,
    dry_run: input.dry_run ?? true,
    actions: ["move_file", "write_receipts", "validate_tree"],
    moves: [{ item_id: input.item_id, from_folder_id: input.from_folder_id, to_folder_id: input.to_folder_id, item_type: "file" }]
  });
}

export function driveMoveFolder(input: { root_folder_id: string; item_id: string; to_folder_id: string; from_folder_id?: string; dry_run?: boolean }) {
  return runDriveJob({
    job_id: `drive-move-folder-${Date.now()}`,
    root_folder_id: input.root_folder_id,
    dry_run: input.dry_run ?? true,
    actions: ["move_folder", "write_receipts", "validate_tree"],
    moves: [{ item_id: input.item_id, from_folder_id: input.from_folder_id, to_folder_id: input.to_folder_id, item_type: "folder" }]
  });
}

export function driveWriteReceipt(input: { root_folder_id: string; job_id?: string; receipt_folder_id?: string; dry_run?: boolean }) {
  return runDriveJob({
    job_id: input.job_id ?? `drive-write-receipt-${Date.now()}`,
    root_folder_id: input.root_folder_id,
    receipt_folder_id: input.receipt_folder_id,
    dry_run: input.dry_run ?? true,
    actions: ["write_receipts"]
  });
}

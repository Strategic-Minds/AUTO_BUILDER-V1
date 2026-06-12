import { createSign } from "node:crypto";

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
  folders?: Array<{ name: string; parent_folder_id?: string; path?: string }>;
  files?: Array<{ name: string; source_path?: string; mime_type?: string; parent_folder_id?: string }>;
  images?: Array<{ name: string; source_path?: string; mime_type?: string; parent_folder_id?: string }>;
  moves?: Array<{ item_id: string; from_folder_id?: string; to_folder_id: string; item_type: "file" | "folder" }>;
  receipt_folder_id?: string;
};

type DriveCreateFolderInput = {
  root_folder_id: string;
  name: string;
  parent_folder_id?: string;
  dry_run?: boolean;
  approved_actions?: string[];
  approval_phrase?: string;
};

type GoogleServiceAccountCredentials = {
  clientEmail: string;
  privateKey: string;
};

const defaultBlockedActions = ["delete", "rename_existing", "move_existing", "publish", "deploy", "payment", "live_social"];
const driveFolderMimeType = "application/vnd.google-apps.folder";
const driveFolderCreateApprovalPhrase = "APPROVE DRIVE FOLDER CREATE";
const serviceAccountJsonEnvNames = ["GOOGLE_SERVICE_ACCOUNT_JSON", "GOOGLE_APPLICATION_CREDENTIALS_JSON", "GOOGLE_CREDENTIALS_JSON"];

function isBlocked(action: string, blockedActions: string[]) {
  return blockedActions.some((blocked) => action === blocked || action.includes(blocked));
}

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n");
}

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function signJwt(payload: Record<string, unknown>, privateKey: string) {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${body}`);
  signer.end();
  return `${header}.${body}.${signer.sign(normalizePrivateKey(privateKey)).toString("base64url")}`;
}

function parseServiceAccountJson(value: string) {
  try {
    const parsed = JSON.parse(value) as { client_email?: unknown; private_key?: unknown };
    if (typeof parsed.client_email === "string" && typeof parsed.private_key === "string") {
      return { clientEmail: parsed.client_email, privateKey: parsed.private_key };
    }
  } catch {
    return null;
  }
  return null;
}

function decodeServiceAccountJson(value: string) {
  const trimmed = value.trim();
  const direct = parseServiceAccountJson(trimmed);
  if (direct) return direct;

  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf8");
    return parseServiceAccountJson(decoded);
  } catch {
    return null;
  }
}

function googleCredentialsFromEnv(): GoogleServiceAccountCredentials | null {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (clientEmail && privateKey) return { clientEmail, privateKey };

  for (const envName of serviceAccountJsonEnvNames) {
    const value = process.env[envName];
    if (!value) continue;
    const parsed = decodeServiceAccountJson(value);
    if (parsed) return parsed;
  }

  return null;
}

async function getGoogleAccessToken() {
  const credentials = googleCredentialsFromEnv();
  if (!credentials) {
    return {
      ok: false as const,
      error: `Google Drive credentials must be configured as GOOGLE_CLIENT_EMAIL plus GOOGLE_PRIVATE_KEY, or one of ${serviceAccountJsonEnvNames.join(", ")}.`
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const scope = process.env.GOOGLE_DRIVE_SCOPE ?? "https://www.googleapis.com/auth/drive.file";
  const assertion = signJwt(
    {
      iss: credentials.clientEmail,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600
    },
    credentials.privateKey
  );

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.access_token !== "string") {
    return { ok: false as const, error: "Google OAuth token exchange failed.", status: response.status };
  }

  return { ok: true as const, accessToken: data.access_token as string, scope };
}

function escapeDriveQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function findGoogleDriveFolder(input: { accessToken: string; name: string; parentFolderId: string }) {
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set(
    "q",
    [`'${escapeDriveQuery(input.parentFolderId)}' in parents`, `name = '${escapeDriveQuery(input.name)}'`, `mimeType = '${driveFolderMimeType}'`, "trashed = false"].join(" and ")
  );
  url.searchParams.set("fields", "files(id,name,mimeType,webViewLink,parents)");
  url.searchParams.set("supportsAllDrives", "true");
  url.searchParams.set("includeItemsFromAllDrives", "true");
  url.searchParams.set("pageSize", "10");

  const response = await fetch(url.toString(), { headers: { Authorization: `Bearer ${input.accessToken}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false as const, status: response.status, error: JSON.stringify(data) };
  const folder = Array.isArray(data.files) ? data.files[0] : undefined;
  return { ok: true as const, folder: folder as { id?: string; name?: string; mimeType?: string; webViewLink?: string; parents?: string[] } | undefined };
}

async function createGoogleDriveFolder(input: { accessToken: string; name: string; parentFolderId: string }) {
  const existing = await findGoogleDriveFolder(input);
  if (!existing.ok) return existing;
  if (existing.folder?.id) return { ok: true as const, folder: existing.folder, existing: true as const };

  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("fields", "id,name,mimeType,webViewLink,parents");
  url.searchParams.set("supportsAllDrives", "true");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: input.name,
      mimeType: driveFolderMimeType,
      parents: [input.parentFolderId]
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false as const, status: response.status, error: JSON.stringify(data) };
  return { ok: true as const, folder: data as { id?: string; name?: string; mimeType?: string; webViewLink?: string; parents?: string[] }, existing: false as const };
}

export function runDriveJob(request: DriveJobRequest) {
  const blockedActions = Array.from(new Set([...(request.blocked_actions ?? []), ...defaultBlockedActions]));
  const dryRun = request.dry_run ?? true;
  const acceptedActions = request.actions.filter((action) => !isBlocked(String(action), blockedActions)).map(String);
  const blockedActionList = request.actions.filter((action) => isBlocked(String(action), blockedActions)).map(String);
  const planned_operations: Array<Record<string, unknown>> = [];
  const blocked_operations = blockedActionList.map((action) => ({ action, status: "blocked_by_policy", reason: "Action matched blocked_actions policy." }));

  for (const action of acceptedActions) {
    if (action === "create_missing_folders") {
      for (const folder of request.folders ?? []) planned_operations.push({ action, provider: "google_workspace", target: "drive", mode: request.mode ?? "missing_only", dry_run: dryRun, folder, execution_hint: "Use Google Drive files.create with folder MIME type and skip existing folders." });
    }
    if (action === "upload_file") {
      for (const file of request.files ?? []) planned_operations.push({ action, provider: "google_workspace", target: "drive", dry_run: dryRun, file, execution_hint: "Use Google Drive files.create multipart upload." });
    }
    if (action === "upload_image" || action === "upload_model_images") {
      for (const image of request.images ?? []) planned_operations.push({ action, provider: "google_workspace", target: "drive", dry_run: dryRun, image, execution_hint: "Use Google Drive files.create multipart upload with image MIME type." });
    }
    if (action === "move_file" || action === "move_folder") {
      for (const move of request.moves ?? []) planned_operations.push({ action, provider: "google_workspace", target: "drive", dry_run: dryRun, move, execution_hint: "Use Google Drive files.update with addParents/removeParents." });
    }
    if (action === "list_tree" || action === "validate_tree" || action === "write_receipts") {
      planned_operations.push({ action, provider: "google_workspace", target: "drive", dry_run: dryRun, root_folder_id: request.root_folder_id, execution_hint: action === "list_tree" ? "Use Drive files.list scoped to folder parents." : action === "validate_tree" ? "Compare expected folders/files against Drive metadata." : "Write JSON receipt into configured receipt folder." });
    }
  }

  const receipt = createReceipt({
    ok: blocked_operations.length === 0,
    provider: "google_workspace",
    action: "run_drive_job",
    category: "execute",
    operation: "drive_job_plan",
    requestedCapability: "Run Google Drive job through AUTO BUILDER MCP.",
    authStatus: "unknown",
    executionMode: dryRun ? "manual_receipt" : "api",
    status: dryRun ? "planned" : "queued",
    projectId: request.root_folder_id,
    logs: [`Drive job ${request.job_id} accepted ${acceptedActions.length} actions.`, `Dry run: ${dryRun}`, `Blocked actions: ${blockedActions.join(", ")}`],
    artifacts: ["drive-job", request.job_id],
    fallbackMode: "If direct Drive REST adapter is unavailable, queue through n8n or Google Workspace connector.",
    nextActions: ["Validate root folder access.", "Execute non-blocked planned operations.", "Write Drive receipt.", "Validate tree after execution."]
  });

  return { ok: blocked_operations.length === 0, job_id: request.job_id, mode: request.mode ?? "missing_only", root_folder_id: request.root_folder_id, dry_run: dryRun, accepted_actions: acceptedActions, blocked_actions: blockedActions, planned_operations, blocked_operations, receipts: [receipt], next_actions: [dryRun ? "Re-run with dry_run=false after reviewing planned operations." : "Execute through Drive adapter or n8n bridge.", "Call drive_write_receipt after execution.", "Call drive_list_tree or run_drive_job validate_tree to verify."] };
}

export function driveListTree(root_folder_id: string) {
  return runDriveJob({ job_id: `drive-list-tree-${Date.now()}`, root_folder_id, dry_run: true, actions: ["list_tree", "validate_tree"] });
}

export async function driveCreateFolder(input: DriveCreateFolderInput) {
  const parentFolderId = input.parent_folder_id ?? input.root_folder_id;
  const basePlan = runDriveJob({ job_id: `drive-create-folder-${Date.now()}`, root_folder_id: input.root_folder_id, dry_run: input.dry_run ?? true, actions: ["create_missing_folders", "write_receipts", "validate_tree"], folders: [{ name: input.name, parent_folder_id: parentFolderId }] });

  if (!input.name.trim()) {
    return { ...basePlan, ok: false, validation_status: "blocked", blocked_operations: [...basePlan.blocked_operations, { action: "create_missing_folders", status: "blocked_invalid_payload", reason: "Folder name is required." }] };
  }

  if (input.dry_run !== false) return basePlan;

  const approved = input.approved_actions?.includes("create_missing_folders") && input.approval_phrase === driveFolderCreateApprovalPhrase;
  if (!approved) {
    return {
      ...basePlan,
      ok: false,
      dry_run: true,
      approval_required: true,
      validation_status: "blocked",
      blocked_operations: [
        ...basePlan.blocked_operations,
        {
          action: "create_missing_folders",
          status: "blocked_pending_approval",
          reason: `Live Drive folder creation requires approved_actions=["create_missing_folders"] and approval_phrase="${driveFolderCreateApprovalPhrase}".`
        }
      ],
      next_actions: ["Review the dry-run plan.", "Confirm Drive parent folder access.", "Re-run only after explicit approval for live Drive folder creation."]
    };
  }

  const token = await getGoogleAccessToken();
  if (!token.ok) {
    return {
      ...basePlan,
      ok: false,
      approval_required: true,
      validation_status: "blocked",
      blocked_operations: [...basePlan.blocked_operations, { action: "create_missing_folders", status: "blocked_missing_secret", reason: token.error }]
    };
  }

  const created = await createGoogleDriveFolder({ accessToken: token.accessToken, name: input.name, parentFolderId });
  if (!created.ok) {
    return {
      ...basePlan,
      ok: false,
      dry_run: false,
      validation_status: "failed",
      failed_operations: [{ action: "create_missing_folders", status: created.status, reason: created.error }],
      receipts: [
        createReceipt({
          ok: false,
          provider: "google_workspace",
          action: "drive_create_folder",
          category: "create",
          operation: "drive_folder_create",
          requestedCapability: "Create Google Drive folder through AUTO BUILDER MCP.",
          authStatus: "verified",
          executionMode: "api",
          status: "failed",
          projectId: input.root_folder_id,
          logs: ["Google Drive folder creation failed.", `HTTP status: ${created.status}`],
          artifacts: ["drive-folder-create", parentFolderId],
          fallbackMode: "Retry after validating folder access or queue through Google Workspace connector.",
          nextActions: ["Confirm service account has access to the parent folder.", "Confirm Drive scope is sufficient.", "Retry with explicit approval only after blocker is resolved."]
        })
      ]
    };
  }

  const folder = created.folder;
  const existing = created.existing === true;
  return {
    ...basePlan,
    ok: true,
    dry_run: false,
    approval_required: false,
    validation_status: existing ? "existing" : "created",
    created_folder: {
      id: folder.id,
      name: folder.name,
      mimeType: folder.mimeType,
      webViewLink: folder.webViewLink,
      parents: folder.parents,
      action: existing ? "existing_preserved" : "created"
    },
    receipts: [
      createReceipt({
        ok: true,
        provider: "google_workspace",
        action: "drive_create_folder",
        category: "create",
        operation: "drive_folder_create",
        requestedCapability: "Create Google Drive folder through AUTO BUILDER MCP.",
        authStatus: "verified",
        executionMode: "api",
        status: existing ? "existing_preserved" : "completed",
        projectId: input.root_folder_id,
        resourceId: folder.id,
        resourceUrl: folder.webViewLink,
        logs: [existing ? "Google Drive folder already existed; preserved without overwrite." : "Google Drive folder created.", "No secret values returned."],
        artifacts: ["drive-folder-create", folder.id ?? "unknown"],
        fallbackMode: "No fallback needed after successful API call.",
        nextActions: ["Call drive_list_tree to verify folder visibility.", "Write or persist the Drive receipt.", "Use the folder id for follow-up uploads only after approval."]
      })
    ],
    next_actions: ["Call drive_list_tree to verify folder visibility.", "Use created_folder.id for future approved Drive operations."]
  };
}

export function driveUploadFile(input: { root_folder_id: string; name: string; source_path?: string; mime_type?: string; parent_folder_id?: string; dry_run?: boolean }) {
  return runDriveJob({ job_id: `drive-upload-file-${Date.now()}`, root_folder_id: input.root_folder_id, dry_run: input.dry_run ?? true, actions: ["upload_file", "write_receipts", "validate_tree"], files: [{ name: input.name, source_path: input.source_path, mime_type: input.mime_type, parent_folder_id: input.parent_folder_id ?? input.root_folder_id }] });
}

export function driveUploadImage(input: { root_folder_id: string; name: string; source_path?: string; mime_type?: string; parent_folder_id?: string; dry_run?: boolean }) {
  return runDriveJob({ job_id: `drive-upload-image-${Date.now()}`, root_folder_id: input.root_folder_id, dry_run: input.dry_run ?? true, actions: ["upload_image", "write_receipts", "validate_tree"], images: [{ name: input.name, source_path: input.source_path, mime_type: input.mime_type ?? "image/png", parent_folder_id: input.parent_folder_id ?? input.root_folder_id }] });
}

export function driveMoveFile(input: { root_folder_id: string; item_id: string; to_folder_id: string; from_folder_id?: string; dry_run?: boolean }) {
  return runDriveJob({ job_id: `drive-move-file-${Date.now()}`, root_folder_id: input.root_folder_id, dry_run: input.dry_run ?? true, actions: ["move_file", "write_receipts", "validate_tree"], moves: [{ item_id: input.item_id, from_folder_id: input.from_folder_id, to_folder_id: input.to_folder_id, item_type: "file" }] });
}

export function driveMoveFolder(input: { root_folder_id: string; item_id: string; to_folder_id: string; from_folder_id?: string; dry_run?: boolean }) {
  return runDriveJob({ job_id: `drive-move-folder-${Date.now()}`, root_folder_id: input.root_folder_id, dry_run: input.dry_run ?? true, actions: ["move_folder", "write_receipts", "validate_tree"], moves: [{ item_id: input.item_id, from_folder_id: input.from_folder_id, to_folder_id: input.to_folder_id, item_type: "folder" }] });
}

export function driveWriteReceipt(input: { root_folder_id: string; job_id?: string; receipt_folder_id?: string; dry_run?: boolean }) {
  return runDriveJob({ job_id: input.job_id ?? `drive-write-receipt-${Date.now()}`, root_folder_id: input.root_folder_id, receipt_folder_id: input.receipt_folder_id, dry_run: input.dry_run ?? true, actions: ["write_receipts"] });
}

import { createSign } from "crypto";
import { createMcpUniverseReceipt, recordMcpUniverseReceipt } from "./receipts";

type DriveBulkFileInput = {
  targetFolderIdOrUrl?: string;
  targetFolderAlias?: string;
  targetName?: string;
  sourceText?: string;
  sourceBase64?: string;
  sourceUrl?: string;
  mimeType?: string;
  uploadMode?: "raw" | "native_google_docs" | "native_google_sheets" | "native_google_slides";
  idempotencyKey?: string;
};

type DriveBulkFolderInput = {
  targetFolderIdOrUrl?: string;
  targetFolderAlias?: string;
  targetName?: string;
  idempotencyKey?: string;
};

type DriveToolInput = DriveBulkFileInput & {
  mode?: string;
  tool?: string;
  approved?: boolean;
  approvalId?: string;
  approvalPhrase?: string;
  sourceFileId?: string;
  destinationFolderIdOrUrl?: string;
  destinationFolderAlias?: string;
  receiptPayload?: unknown;
  bulkFiles?: DriveBulkFileInput[] | string;
  bulkFolders?: DriveBulkFolderInput[] | string;
  targetNames?: string[] | string;
  sharedDriveId?: string;
};

type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  parents?: string[];
};

type GoogleCredential = {
  clientEmail?: string;
  privateKey?: string;
  source: string;
};

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const APPROVAL_PHRASE = "APPROVE DRIVE TOOL WRITE";
const MAX_BULK_ITEMS = 25;

export const AUTO_WORKFLOW_CANONICAL_FOLDERS: Record<string, string> = {
  auto_workflow_root: "13VaSbBlwHGAV_8E48a-dpZD25iwQbWTM",
  auto_social: "12zIjvXyv8OWsIo5yZsKWTA__W2JfcIRy",
  auto_social_builder_docs: "1TQ3A_L8V8pcaxQFQvxHe7mhBOP3PeuPU",
  auto_social_receipts: "1ZEZSDqoVdkwS9b5tGpaf8n5iVovqDRhq",
  auto_social_delivery_assets: "1XoFJkWbbKnFdhs15SeVefm45il8hiL1d",
  auto_social_governance: "1m9PVcLvAemGOaE7B6wmTPcbnemKvlyhg",
  auto_social_publishing_queue: "1ZDXS6g0DBs0GtdNUvA4sYvt8tmK8BC94",
  auto_social_media_engine: "1b4-pgjConXFjRLti_Jv8sNUw_mwM0InJ",
  eden_skye_studios: "1322GZ3hP0jgvVYws_2GKI15GsxdT5VWY",
  eden_website_build_packets: "1KYB3mN2H35D6nDUQIdpqr_n1wh_kJPTz",
  admin_control: "1mxarwm91A5S1HqptiNMeh4BRFHUQ4YJV",
  admin_approval_center: "1-9bQbn9xmcsB3001PduEhpRmVkg6O7Cr",
  admin_drive_write_approvals: "19-8kCYBxgjTb5oNY6TzESFWyD8bHsxT4",
  admin_audit_log: "1gjEUStMBSWVwHxjVp1_Yeu2ClCjASv3c"
};

function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function decodeBase64Maybe(value: string) {
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    return decoded.trim() ? decoded : null;
  } catch {
    return null;
  }
}

function credentialFromParsedJson(parsed: unknown, source: string): GoogleCredential | null {
  if (typeof parsed === "string") return parseGoogleCredentialJson(parsed, `${source}_nested_string`);
  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as { client_email?: unknown; clientEmail?: unknown; private_key?: unknown; privateKey?: unknown };
  const clientEmail = typeof record.client_email === "string" ? record.client_email : typeof record.clientEmail === "string" ? record.clientEmail : undefined;
  const privateKey = typeof record.private_key === "string" ? record.private_key : typeof record.privateKey === "string" ? record.privateKey : undefined;
  return clientEmail || privateKey ? { clientEmail, privateKey, source } : null;
}

function parseGoogleCredentialJson(value: string, source: string): GoogleCredential | null {
  const raw = stripWrappingQuotes(value);
  const decoded = decodeBase64Maybe(raw);
  const candidates = [value.trim(), raw, decoded].filter((candidate): candidate is string => Boolean(candidate));
  for (const candidate of candidates) {
    try {
      const credential = credentialFromParsedJson(JSON.parse(candidate), source);
      if (credential) return credential;
    } catch {
      // Try the next supported shape.
    }
  }
  return null;
}

function normalizePrivateKey(value: string) {
  const parsedJson = parseGoogleCredentialJson(value, "GOOGLE_PRIVATE_KEY_JSON");
  const rawKey = parsedJson?.privateKey ?? value;
  const unwrapped = stripWrappingQuotes(rawKey).replace(/\\n/g, "\n");
  if (unwrapped.includes("-----BEGIN")) return unwrapped;
  const decoded = decodeBase64Maybe(unwrapped)?.replace(/\\n/g, "\n");
  if (decoded?.includes("-----BEGIN")) return decoded;
  return unwrapped;
}

function getGoogleCredentialInputs(): GoogleCredential {
  const jsonCredentialEnvNames = ["GOOGLE_SERVICE_ACCOUNT_JSON", "GOOGLE_CREDENTIALS_JSON", "GOOGLE_APPLICATION_CREDENTIALS_JSON", "GOOGLE_PRIVATE_KEY_JSON"];
  let partialJsonCredential: GoogleCredential | null = null;
  for (const envName of jsonCredentialEnvNames) {
    const jsonCredential = process.env[envName];
    if (!jsonCredential) continue;
    const parsed = parseGoogleCredentialJson(jsonCredential, envName);
    if (parsed?.clientEmail && parsed.privateKey) return parsed;
    if (parsed && !partialJsonCredential) partialJsonCredential = parsed;
  }

  const privateKeyFromEnv = process.env.GOOGLE_PRIVATE_KEY ?? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const parsedPrivateKeyJson = privateKeyFromEnv ? parseGoogleCredentialJson(privateKeyFromEnv, "private_key_env_json") : null;
  const partial = partialJsonCredential ?? parsedPrivateKeyJson;
  return {
    clientEmail: partial?.clientEmail ?? process.env.GOOGLE_CLIENT_EMAIL ?? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: partial?.privateKey ?? parsedPrivateKeyJson?.privateKey ?? privateKeyFromEnv,
    source: partial ? `${partial.source}_with_split_env_fallback` : parsedPrivateKeyJson ? "private_key_env_json" : "separate_env_values"
  };
}

function getDelegatedUserEmail() {
  return process.env.GOOGLE_WORKSPACE_IMPERSONATED_USER ?? process.env.GOOGLE_DELEGATED_USER_EMAIL ?? process.env.GOOGLE_DRIVE_IMPERSONATED_USER_EMAIL;
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken() {
  const directAccessToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN ?? process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN ?? process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  if (directAccessToken) return directAccessToken;
  const credentials = getGoogleCredentialInputs();
  if (!credentials.clientEmail || !credentials.privateKey) {
    throw new Error("Google Drive auth requires an access token, GOOGLE_SERVICE_ACCOUNT_JSON, or client email plus private key.");
  }
  const delegatedUserEmail = getDelegatedUserEmail();
  const now = Math.floor(Date.now() / 1000);
  const jwtClaims: Record<string, string | number> = { iss: credentials.clientEmail, scope: DRIVE_SCOPE, aud: TOKEN_URL, exp: now + 3600, iat: now };
  if (delegatedUserEmail) jwtClaims.sub = delegatedUserEmail;
  const signingInput = `${base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64Url(JSON.stringify(jwtClaims))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  let signature: Buffer;
  try {
    signature = signer.sign(normalizePrivateKey(credentials.privateKey));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Google private key signing failed from ${credentials.source}: ${message}`);
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${signingInput}.${base64Url(signature)}` })
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Google token request failed: ${response.status} ${text}`);
  const json = JSON.parse(text) as { access_token?: string };
  if (!json.access_token) throw new Error("Google token response did not include access_token.");
  return json.access_token;
}

async function driveFetch<T>(accessToken: string, url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { authorization: `Bearer ${accessToken}`, ...(init?.headers ?? {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(`Drive request failed: ${response.status} ${text}`);
  return (text ? JSON.parse(text) : null) as T;
}

function folderIdFromUrlOrAlias(value?: string) {
  if (!value) return null;
  const alias = AUTO_WORKFLOW_CANONICAL_FOLDERS[value];
  if (alias) return alias;
  const match = value.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? value;
}

function escapeDriveQuery(value: string) {
  return value.replace(/'/g, "\\'");
}

async function listFolder(accessToken: string, folderId: string) {
  const files: DriveItem[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      q: `'${escapeDriveQuery(folderId)}' in parents and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType,webViewLink,parents)",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
      pageSize: "1000"
    });
    if (pageToken) params.set("pageToken", pageToken);
    const result = await driveFetch<{ files?: DriveItem[]; nextPageToken?: string }>(accessToken, `${DRIVE_API}/files?${params.toString()}`);
    files.push(...(result.files ?? []));
    pageToken = result.nextPageToken;
  } while (pageToken);
  return files;
}

async function findExistingFile(accessToken: string, folderId: string, name: string, mimeType?: string) {
  const mimeClause = mimeType ? ` and mimeType = '${escapeDriveQuery(mimeType)}'` : "";
  const params = new URLSearchParams({
    q: `'${escapeDriveQuery(folderId)}' in parents and name = '${escapeDriveQuery(name)}'${mimeClause} and trashed = false`,
    fields: "files(id,name,mimeType,webViewLink,parents)",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
    orderBy: "createdTime"
  });
  const result = await driveFetch<{ files: DriveItem[] }>(accessToken, `${DRIVE_API}/files?${params.toString()}`);
  return result.files[0] ?? null;
}

async function contentFromInput(input: DriveToolInput | DriveBulkFileInput) {
  if (typeof input.sourceText === "string") {
    return { buffer: Buffer.from(input.sourceText, "utf8"), mimeType: input.mimeType ?? "text/plain; charset=UTF-8" };
  }
  if (typeof input.sourceBase64 === "string") {
    return { buffer: Buffer.from(input.sourceBase64, "base64"), mimeType: input.mimeType ?? "application/octet-stream" };
  }
  if (typeof input.sourceUrl === "string") {
    const response = await fetch(input.sourceUrl);
    if (!response.ok) throw new Error(`Source URL fetch failed: ${response.status}`);
    return { buffer: Buffer.from(await response.arrayBuffer()), mimeType: input.mimeType ?? response.headers.get("content-type") ?? "application/octet-stream" };
  }
  throw new Error("Drive file writes require sourceText, sourceBase64, or sourceUrl in server execution.");
}

function googleMimeForUpload(input: DriveToolInput | DriveBulkFileInput, fallbackMime: string) {
  if (input.uploadMode === "native_google_docs") return "application/vnd.google-apps.document";
  if (input.uploadMode === "native_google_sheets") return "application/vnd.google-apps.spreadsheet";
  if (input.uploadMode === "native_google_slides") return "application/vnd.google-apps.presentation";
  return fallbackMime;
}

function bulkArrayFromUnknown<T>(value: T[] | string | undefined, label: string) {
  if (!value) return [] as T[];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) return parsed as T[];
  } catch {
    // Fall through to clearer error below.
  }
  throw new Error(`${label} must be an array or a JSON-encoded array.`);
}

function targetNamesFromUnknown(value: string[] | string | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    // Support comma-separated GET probes.
  }
  return value.split(",").map((name) => name.trim()).filter(Boolean);
}

function assertBulkLimit(count: number) {
  if (count > MAX_BULK_ITEMS) throw new Error(`Bulk Drive operations are capped at ${MAX_BULK_ITEMS} items per approved call.`);
}

async function uploadFile(accessToken: string, input: DriveToolInput | DriveBulkFileInput, imageMode = false) {
  const targetFolderId = folderIdFromUrlOrAlias(input.targetFolderAlias ?? input.targetFolderIdOrUrl);
  if (!targetFolderId) throw new Error("targetFolderIdOrUrl or targetFolderAlias is required.");
  if (!input.targetName) throw new Error("targetName is required.");
  const source = await contentFromInput(input);
  const metadataMimeType = googleMimeForUpload(input, imageMode ? input.mimeType ?? source.mimeType ?? "image/png" : source.mimeType);
  const existing = await findExistingFile(accessToken, targetFolderId, input.targetName, metadataMimeType);
  if (existing) return { action: "existing", file: existing, targetFolderId, idempotent: true };

  const boundary = `auto_builder_drive_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const metadata = { name: input.targetName, mimeType: metadataMimeType, parents: [targetFolderId] };
  const multipart = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${source.mimeType}\r\n\r\n`),
    source.buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const created = await driveFetch<DriveItem>(accessToken, `${DRIVE_UPLOAD_API}/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,webViewLink,parents`, {
    method: "POST",
    headers: { "content-type": `multipart/related; boundary=${boundary}` },
    body: multipart
  });
  return { action: "created", file: created, targetFolderId, idempotent: true };
}

async function createFolder(accessToken: string, input: DriveToolInput | DriveBulkFolderInput) {
  const targetFolderId = folderIdFromUrlOrAlias(input.targetFolderAlias ?? input.targetFolderIdOrUrl) ?? AUTO_WORKFLOW_CANONICAL_FOLDERS.auto_workflow_root;
  if (!input.targetName) throw new Error("targetName is required for drive_create_folder.");
  const folderMime = "application/vnd.google-apps.folder";
  const existing = await findExistingFile(accessToken, targetFolderId, input.targetName, folderMime);
  if (existing) return { action: "existing", folder: existing, targetFolderId, idempotent: true };
  const created = await driveFetch<DriveItem>(accessToken, `${DRIVE_API}/files?supportsAllDrives=true&fields=id,name,mimeType,webViewLink,parents`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: input.targetName, mimeType: folderMime, parents: [targetFolderId], appProperties: { autoBuilderMcpCreated: "true" } })
  });
  return { action: "created", folder: created, targetFolderId, idempotent: true };
}

async function bulkUploadFiles(accessToken: string, input: DriveToolInput, imageMode = false) {
  const files = bulkArrayFromUnknown<DriveBulkFileInput>(input.bulkFiles, "bulkFiles");
  assertBulkLimit(files.length);
  if (!files.length) throw new Error("bulkFiles is required for bulk Drive uploads.");
  const uploaded = [];
  for (const file of files) {
    uploaded.push(await uploadFile(accessToken, { ...input, ...file }, imageMode));
  }
  return { action: imageMode ? "bulk_images_uploaded" : "bulk_files_uploaded", count: uploaded.length, uploaded };
}

async function bulkCreateFolders(accessToken: string, input: DriveToolInput) {
  const explicitFolders = bulkArrayFromUnknown<DriveBulkFolderInput>(input.bulkFolders, "bulkFolders");
  const nameFolders = targetNamesFromUnknown(input.targetNames).map((targetName) => ({ targetName }));
  const folders = explicitFolders.length ? explicitFolders : nameFolders;
  assertBulkLimit(folders.length);
  if (!folders.length) throw new Error("bulkFolders or targetNames is required for drive_bulk_create_folders.");
  const created = [];
  for (const folder of folders) {
    created.push(await createFolder(accessToken, { ...input, ...folder }));
  }
  return { action: "bulk_folders_created", count: created.length, folders: created };
}

async function moveFile(accessToken: string, input: DriveToolInput) {
  if (!input.sourceFileId) throw new Error("sourceFileId is required for drive_move_file.");
  const targetFolderId = folderIdFromUrlOrAlias(input.destinationFolderAlias ?? input.destinationFolderIdOrUrl ?? input.targetFolderAlias ?? input.targetFolderIdOrUrl);
  if (!targetFolderId) throw new Error("destinationFolderIdOrUrl or destinationFolderAlias is required for drive_move_file.");
  const file = await driveFetch<DriveItem>(accessToken, `${DRIVE_API}/files/${input.sourceFileId}?fields=id,name,mimeType,parents,webViewLink&supportsAllDrives=true`);
  const previousParents = file.parents?.join(",") ?? "";
  const moved = await driveFetch<DriveItem>(accessToken, `${DRIVE_API}/files/${input.sourceFileId}?addParents=${targetFolderId}&removeParents=${encodeURIComponent(previousParents)}&fields=id,name,mimeType,parents,webViewLink&supportsAllDrives=true`, { method: "PATCH" });
  return { action: "moved", file: moved, previousParents: file.parents ?? [], targetFolderId };
}

async function writeReceipt(accessToken: string, input: DriveToolInput) {
  const targetFolderId = folderIdFromUrlOrAlias(input.targetFolderAlias ?? input.targetFolderIdOrUrl) ?? AUTO_WORKFLOW_CANONICAL_FOLDERS.admin_audit_log;
  const targetName = input.targetName ?? `drive-receipt-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  return uploadFile(accessToken, {
    ...input,
    targetFolderIdOrUrl: targetFolderId,
    targetName,
    sourceText: JSON.stringify({ receiptType: "drive_tool_receipt", approvalId: input.approvalId, timestamp: new Date().toISOString(), payload: input.receiptPayload ?? null }, null, 2),
    mimeType: "application/json",
    uploadMode: "raw"
  });
}

function toolApprovalMissing(input: DriveToolInput) {
  return input.approved !== true || !input.approvalId || input.approvalPhrase !== APPROVAL_PHRASE;
}

export async function runApprovedDriveToolWrite(input: DriveToolInput) {
  const tool = input.tool ?? "drive_put_file";
  const accessToken = await getAccessToken();

  if (tool === "drive_list_folder" || tool === "drive_list_tree") {
    const folderId = folderIdFromUrlOrAlias(input.targetFolderAlias ?? input.targetFolderIdOrUrl) ?? AUTO_WORKFLOW_CANONICAL_FOLDERS.auto_workflow_root;
    const files = await listFolder(accessToken, folderId);
    return { ok: true, productionActionAllowed: false, status: "read_complete", tool, folderId, files, noMutationPerformed: true };
  }

  if (toolApprovalMissing(input)) {
    return { ok: false, productionActionAllowed: false, status: "blocked", blocker: `Drive tool writes require approved=true, approvalId, and approvalPhrase=${APPROVAL_PHRASE}.`, noMutationPerformed: true };
  }

  let result: unknown;
  if (tool === "drive_put_file" || tool === "drive_upload_file") result = await uploadFile(accessToken, input);
  else if (tool === "drive_upload_image") result = await uploadFile(accessToken, input, true);
  else if (tool === "drive_bulk_put_files" || tool === "drive_bulk_upload_files") result = await bulkUploadFiles(accessToken, input);
  else if (tool === "drive_bulk_upload_images") result = await bulkUploadFiles(accessToken, input, true);
  else if (tool === "drive_create_folder") result = await createFolder(accessToken, input);
  else if (tool === "drive_bulk_create_folders") result = await bulkCreateFolders(accessToken, input);
  else if (tool === "drive_move_file") result = await moveFile(accessToken, input);
  else if (tool === "drive_write_receipt") result = await writeReceipt(accessToken, input);
  else return { ok: false, productionActionAllowed: false, status: "blocked", blocker: `Unsupported approved Drive tool: ${tool}`, noMutationPerformed: true };

  const receipt = createMcpUniverseReceipt({
    mcpId: "wave-2-drive-tool-writer",
    category: "system",
    action: `${tool}_approved_write`,
    autonomyLevel: 4,
    riskClass: tool === "drive_move_file" || tool === "drive_bulk_create_folders" ? "high" : "medium",
    approvalState: "approved",
    target: "/api/mcp-universe/wave-2/drive",
    resultSummary: `Approved Drive tool ${tool} completed against canonical AUTO WORKFLOW folder map.`,
    validationStatus: "passed",
    rollbackRef: null,
    nextAction: "Verify Drive folder contents and capture canonical receipt.",
    inputs: { ...input, sourceText: input.sourceText ? "redacted" : undefined, sourceBase64: input.sourceBase64 ? "redacted" : undefined, bulkFiles: input.bulkFiles ? "redacted" : undefined }
  });
  const recorded = await recordMcpUniverseReceipt(receipt);

  return {
    ok: true,
    productionActionAllowed: false,
    status: "approved_tool_write_complete",
    tool,
    approvalId: input.approvalId,
    receiptId: receipt.receiptId,
    result,
    recorded,
    blockedActionsStillLocked: ["delete", "rename_existing", "publish", "deploy", "payment", "live_social", "adult_content_release", "customer_message"]
  };
}

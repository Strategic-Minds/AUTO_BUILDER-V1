import { createSign } from "crypto";
import { AUTO_WORKFLOW_CANONICAL_FOLDERS } from "./drive-tool-writer";
import { createMcpUniverseReceipt, recordMcpUniverseReceipt } from "./receipts";

type DriveDedupeInput = {
  mode?: string;
  tool?: string;
  approved?: boolean;
  approvalId?: string;
  approvalPhrase?: string;
  rootFolderId?: string;
  root_folder_id?: string;
  quarantineFolderId?: string;
  quarantineFolderAlias?: string;
  maxDepth?: number;
  dryRun?: boolean;
};

type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  parents?: string[];
};

type ScannedItem = DriveItem & {
  path: string;
  parentId: string;
  depth: number;
};

type DuplicateGroup = {
  key: string;
  parentId: string;
  path: string;
  name: string;
  mimeType: string;
  keep: ScannedItem;
  duplicates: ScannedItem[];
};

type GoogleCredential = {
  clientEmail?: string;
  privateKey?: string;
  source: string;
};

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const APPROVAL_PHRASE = "APPROVE DRIVE TOOL WRITE";
const AUTO_WORKFLOW_ROOT_FOLDER_ID = AUTO_WORKFLOW_CANONICAL_FOLDERS.auto_workflow_root;
const DEFAULT_QUARANTINE_FOLDER_ID = "1yOdXrh-yKDJZE1gLYzoMCQrdCEMH82k7";

function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return trimmed.slice(1, -1);
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

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken() {
  const directAccessToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN ?? process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN ?? process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  if (directAccessToken) return directAccessToken;
  const credentials = getGoogleCredentialInputs();
  if (!credentials.clientEmail || !credentials.privateKey) throw new Error("Google Drive auth requires an access token, GOOGLE_SERVICE_ACCOUNT_JSON, or client email plus private key.");

  const now = Math.floor(Date.now() / 1000);
  const signingInput = `${base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64Url(JSON.stringify({ iss: credentials.clientEmail, scope: DRIVE_SCOPE, aud: TOKEN_URL, exp: now + 3600, iat: now }))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(normalizePrivateKey(credentials.privateKey));
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

function escapeDriveQuery(value: string) {
  return value.replace(/'/g, "\\'");
}

function folderIdFromAlias(value?: string) {
  if (!value) return null;
  return AUTO_WORKFLOW_CANONICAL_FOLDERS[value] ?? value.match(/folders\/([a-zA-Z0-9_-]+)/)?.[1] ?? value;
}

async function listChildren(accessToken: string, folderId: string) {
  const params = new URLSearchParams({
    q: `'${escapeDriveQuery(folderId)}' in parents and trashed = false`,
    fields: "files(id,name,mimeType,createdTime,modifiedTime,webViewLink,parents)",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
    pageSize: "1000",
    orderBy: "folder,name,createdTime"
  });
  const result = await driveFetch<{ files: DriveItem[] }>(accessToken, `${DRIVE_API}/files?${params.toString()}`);
  return result.files;
}

async function scanTree(accessToken: string, rootFolderId: string, maxDepth: number, excludedFolderIds = new Set<string>()) {
  const items: ScannedItem[] = [];
  const visited = new Set<string>();

  async function visit(folderId: string, path: string, depth: number) {
    if (visited.has(folderId) || depth > maxDepth || excludedFolderIds.has(folderId)) return;
    visited.add(folderId);
    const children = await listChildren(accessToken, folderId);
    for (const child of children) {
      const childPath = path ? `${path}/${child.name}` : child.name;
      const scanned = { ...child, path: childPath, parentId: folderId, depth };
      items.push(scanned);
      if (child.mimeType === "application/vnd.google-apps.folder") await visit(child.id, childPath, depth + 1);
    }
  }

  await visit(rootFolderId, "", 1);
  return items;
}

function duplicateGroupsFor(items: ScannedItem[], canonicalIds: Set<string>) {
  const byKey = new Map<string, ScannedItem[]>();
  for (const item of items) {
    if (item.mimeType !== "application/vnd.google-apps.folder") continue;
    const key = `${item.parentId}::${item.mimeType}::${item.name}`;
    const group = byKey.get(key) ?? [];
    group.push(item);
    byKey.set(key, group);
  }

  const groups: DuplicateGroup[] = [];
  for (const [key, group] of byKey) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => (a.createdTime ?? "").localeCompare(b.createdTime ?? ""));
    const canonical = sorted.find((item) => canonicalIds.has(item.id));
    const keep = canonical ?? sorted[0];
    const duplicates = sorted.filter((item) => item.id !== keep.id);
    groups.push({
      key,
      parentId: keep.parentId,
      path: keep.path,
      name: keep.name,
      mimeType: keep.mimeType,
      keep,
      duplicates
    });
  }
  return groups;
}

async function moveToQuarantine(accessToken: string, item: ScannedItem, quarantineFolderId: string) {
  const previousParents = item.parents?.join(",") || item.parentId;
  return driveFetch<DriveItem>(accessToken, `${DRIVE_API}/files/${item.id}?addParents=${quarantineFolderId}&removeParents=${encodeURIComponent(previousParents)}&fields=id,name,mimeType,parents,webViewLink&supportsAllDrives=true`, { method: "PATCH" });
}

function approvalMissing(input: DriveDedupeInput) {
  return input.approved !== true || !input.approvalId || input.approvalPhrase !== APPROVAL_PHRASE;
}

export async function runDriveDuplicateScan(input: DriveDedupeInput = {}) {
  const accessToken = await getAccessToken();
  const rootFolderId = input.rootFolderId ?? input.root_folder_id ?? AUTO_WORKFLOW_ROOT_FOLDER_ID;
  const quarantineFolderId = folderIdFromAlias(input.quarantineFolderAlias) ?? input.quarantineFolderId ?? DEFAULT_QUARANTINE_FOLDER_ID;
  const maxDepth = Math.max(1, Math.min(Number(input.maxDepth ?? 8), 20));
  const items = await scanTree(accessToken, rootFolderId, maxDepth, new Set([quarantineFolderId]));
  const canonicalIds = new Set(Object.values(AUTO_WORKFLOW_CANONICAL_FOLDERS));
  const groups = duplicateGroupsFor(items, canonicalIds);
  const duplicateCount = groups.reduce((sum, group) => sum + group.duplicates.length, 0);

  return {
    ok: true,
    productionActionAllowed: false,
    status: "duplicate_scan_complete",
    tool: "drive_duplicate_scan",
    rootFolderId,
    quarantineFolderId,
    maxDepth,
    scannedItemCount: items.length,
    duplicateGroupCount: groups.length,
    duplicateFolderCount: duplicateCount,
    groups: groups.map((group) => ({
      path: group.path,
      parentId: group.parentId,
      keep: { id: group.keep.id, name: group.keep.name, createdTime: group.keep.createdTime, path: group.keep.path },
      duplicates: group.duplicates.map((item) => ({ id: item.id, name: item.name, createdTime: item.createdTime, path: item.path }))
    })),
    noMutationPerformed: true
  };
}

export async function runDriveDedupeQuarantine(input: DriveDedupeInput = {}) {
  if (approvalMissing(input)) {
    return { ok: false, productionActionAllowed: false, status: "blocked", blocker: `Drive dedupe quarantine requires approved=true, approvalId, and approvalPhrase=${APPROVAL_PHRASE}.`, noMutationPerformed: true };
  }

  const accessToken = await getAccessToken();
  const rootFolderId = input.rootFolderId ?? input.root_folder_id ?? AUTO_WORKFLOW_ROOT_FOLDER_ID;
  const quarantineFolderId = folderIdFromAlias(input.quarantineFolderAlias) ?? input.quarantineFolderId ?? DEFAULT_QUARANTINE_FOLDER_ID;
  const maxDepth = Math.max(1, Math.min(Number(input.maxDepth ?? 8), 20));
  const items = await scanTree(accessToken, rootFolderId, maxDepth, new Set([quarantineFolderId]));
  const canonicalIds = new Set(Object.values(AUTO_WORKFLOW_CANONICAL_FOLDERS));
  const groups = duplicateGroupsFor(items, canonicalIds);
  const duplicateItems = groups.flatMap((group) => group.duplicates).filter((item) => item.id !== quarantineFolderId);

  const moved = [];
  for (const item of duplicateItems) {
    const result = await moveToQuarantine(accessToken, item, quarantineFolderId);
    moved.push({ id: item.id, name: item.name, path: item.path, previousParentId: item.parentId, result });
  }

  const receipt = createMcpUniverseReceipt({
    mcpId: "wave-2-drive-dedupe-writer",
    category: "system",
    action: "drive_dedupe_quarantine_approved_write",
    autonomyLevel: 4,
    riskClass: "high",
    approvalState: "approved",
    target: "/api/mcp-universe/wave-2/drive",
    resultSummary: `Quarantined ${moved.length} duplicate Drive folders under AUTO WORKFLOW.`,
    validationStatus: "passed",
    rollbackRef: null,
    nextAction: "Run read-only duplicate scan and verify quarantine contents.",
    inputs: { ...input, duplicateCount: duplicateItems.length }
  });
  const recorded = await recordMcpUniverseReceipt(receipt);

  return {
    ok: true,
    productionActionAllowed: false,
    status: "dedupe_quarantine_complete",
    tool: "drive_dedupe_quarantine",
    approvalId: input.approvalId,
    receiptId: receipt.receiptId,
    rootFolderId,
    quarantineFolderId,
    maxDepth,
    scannedItemCount: items.length,
    duplicateGroupCount: groups.length,
    quarantinedCount: moved.length,
    moved,
    recorded,
    noDeletePerformed: true,
    blockedActionsStillLocked: ["delete", "rename_existing", "publish", "deploy", "payment", "live_social", "adult_content_release", "customer_message"]
  };
}

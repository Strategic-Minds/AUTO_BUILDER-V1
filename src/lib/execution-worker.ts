import { createSign } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export type WorkerAction =
  | "vercel.removeProjectDomain"
  | "drive.uploadFileToFolder"
  | "drive.copyFileToFolder"
  | "drive.runDriveJob"
  | "playwright.screenshotQA"
  | "playwright.submitLeadFormAndVerifySupabase";

type WorkerRequest = {
  action?: WorkerAction;
  approved?: boolean;
  token?: string;
  payload?: Record<string, unknown>;
};

type WorkerResult = {
  status: "ok" | "blocked" | "error";
  action?: WorkerAction;
  receipt: Record<string, unknown>;
};

type DriveJobMode = "dry_run" | "approved_write";

type DriveJobUpload = {
  filename: string;
  mimeType: string;
  base64Content: string;
  targetPath?: string;
  folderId?: string;
};

type DriveJobPayload = {
  job_id: string;
  mode: DriveJobMode;
  root_folder_id: string;
  root_folder_name: string;
  create_missing_folders?: boolean;
  folder_manifest?: string[];
  upload_files?: DriveJobUpload[];
  move_files?: unknown[];
  move_folders?: unknown[];
  write_receipts?: boolean;
  validate_tree?: boolean;
  blocked_actions?: string[];
};

const DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

function parseJsonIfPossible(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

const liveMutationActions = new Set<WorkerAction>([
  "vercel.removeProjectDomain",
  "drive.uploadFileToFolder",
  "drive.copyFileToFolder",
  "playwright.submitLeadFormAndVerifySupabase"
]);

function requireString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required payload.${key}`);
  }
  return value.trim();
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function normalizeSecretString(value: string) {
  const trimmed = value.trim();
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (typeof parsed === "string") return parsed;
    if (parsed && typeof parsed === "object" && "private_key" in parsed) {
      const privateKey = (parsed as { private_key?: unknown }).private_key;
      if (typeof privateKey === "string") return privateKey;
    }
  } catch {
    // Not JSON; continue with the raw value.
  }
  return trimmed.replace(/^[']|[']$/g, "").replace(/^[\"]|[\"]$/g, "");
}

function getGooglePrivateKey() {
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY ?? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!rawPrivateKey) return undefined;

  let privateKey = normalizeSecretString(rawPrivateKey).replace(/\\n/g, "\n").replace(/\r/g, "");
  if (!privateKey.includes("BEGIN") && /^[A-Za-z0-9+/=\s]+$/.test(privateKey)) {
    const decoded = Buffer.from(privateKey.replace(/\s/g, ""), "base64").toString("utf8");
    if (decoded.includes("BEGIN") && decoded.includes("PRIVATE KEY")) privateKey = decoded;
  }
  return privateKey;
}

async function mintGoogleServiceAccountToken() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL ?? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = getGooglePrivateKey();
  if (!clientEmail || !privateKey) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/drive",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600
    })
  );
  const unsignedJwt = `${header}.${claims}`;
  const signature = createSign("RSA-SHA256").update(unsignedJwt).sign(privateKey);
  const assertion = `${unsignedJwt}.${base64Url(signature)}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const body = parseJsonIfPossible(await response.text()) as { access_token?: unknown; error?: unknown; error_description?: unknown } | string | null;
  if (!response.ok || !body || typeof body === "string" || typeof body.access_token !== "string") {
    const reason = body && typeof body === "object" ? body.error_description ?? body.error : body;
    throw new Error(`Google service-account token exchange failed${reason ? `: ${String(reason)}` : ""}`);
  }
  return body.access_token;
}

async function getGoogleDriveToken() {
  const token = process.env.GOOGLE_DRIVE_ACCESS_TOKEN ?? process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN;
  if (token) return token;
  const serviceAccountToken = await mintGoogleServiceAccountToken();
  if (serviceAccountToken) return serviceAccountToken;
  throw new Error(
    "Missing Google Drive auth. Set GOOGLE_DRIVE_ACCESS_TOKEN/GOOGLE_WORKSPACE_ACCESS_TOKEN or GOOGLE_CLIENT_EMAIL/GOOGLE_SERVICE_ACCOUNT_EMAIL plus GOOGLE_PRIVATE_KEY/GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
  );
}

function requireWorkerEnabled(request: WorkerRequest) {
  if (process.env.AUTO_BUILDER_EXECUTION_WORKER_ENABLED !== "true") {
    return {
      status: "blocked" as const,
      receipt: {
        reason: "AUTO_BUILDER_EXECUTION_WORKER_ENABLED is not true",
        requiredEnv: ["AUTO_BUILDER_EXECUTION_WORKER_ENABLED", "AUTO_BUILDER_WORKER_TOKEN"]
      }
    };
  }

  const expectedToken = process.env.AUTO_BUILDER_WORKER_TOKEN;
  if (!expectedToken || request.token !== expectedToken) {
    return {
      status: "blocked" as const,
      receipt: { reason: "Worker token missing or invalid", requiredEnv: ["AUTO_BUILDER_WORKER_TOKEN"] }
    };
  }

  if (!request.action) return { status: "blocked" as const, receipt: { reason: "Missing action" } };

  if (liveMutationActions.has(request.action) && request.approved !== true) {
    return {
      status: "blocked" as const,
      action: request.action,
      receipt: { reason: "Explicit approval is required for this action", requiredField: "approved: true" }
    };
  }

  return null;
}

async function removeProjectDomain(payload: Record<string, unknown>) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("Missing VERCEL_TOKEN");
  const project = requireString(payload, "project");
  const domain = requireString(payload, "domain");
  const teamId = typeof payload.teamId === "string" && payload.teamId.trim() ? payload.teamId.trim() : undefined;
  const url = new URL(`https://api.vercel.com/v9/projects/${encodeURIComponent(project)}/domains/${encodeURIComponent(domain)}`);
  if (teamId) url.searchParams.set("teamId", teamId);
  const response = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  return { project, domain, ok: response.ok, statusCode: response.status, response: parseJsonIfPossible(await response.text()) };
}

async function uploadBytesToFolder(params: { folderId: string; filename: string; mimeType: string; bytes: Uint8Array; token: string }) {
  const boundary = `auto-builder-${crypto.randomUUID()}`;
  const metadata = { name: params.filename, mimeType: params.mimeType, parents: [params.folderId] };
  const base64Content = Buffer.from(params.bytes).toString("base64");
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    `Content-Type: ${params.mimeType}`,
    "Content-Transfer-Encoding: base64",
    "",
    base64Content,
    `--${boundary}--`,
    ""
  ].join("\r\n");

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,parents",
    { method: "POST", headers: { Authorization: `Bearer ${params.token}`, "Content-Type": `multipart/related; boundary=${boundary}` }, body }
  );
  return { ok: response.ok, statusCode: response.status, response: parseJsonIfPossible(await response.text()) };
}

async function uploadFileToFolder(payload: Record<string, unknown>) {
  const token = await getGoogleDriveToken();
  const folderId = requireString(payload, "folderId");
  const filename = requireString(payload, "filename");
  const mimeType = requireString(payload, "mimeType");
  const base64Content = requireString(payload, "base64Content");
  const bytes = Buffer.from(base64Content, "base64");
  const result = await uploadBytesToFolder({ folderId, filename, mimeType, bytes, token });
  return { folderId, filename, ...result };
}

async function copyFileToFolder(payload: Record<string, unknown>) {
  const token = await getGoogleDriveToken();
  const sourceFileId = requireString(payload, "sourceFileId");
  const folderId = requireString(payload, "folderId");
  const requestedName = typeof payload.filename === "string" && payload.filename.trim() ? payload.filename.trim() : undefined;

  const metadataResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(sourceFileId)}?fields=id,name,mimeType,size,webViewLink`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const metadata = parseJsonIfPossible(await metadataResponse.text()) as { name?: string; mimeType?: string } | string | null;
  if (!metadataResponse.ok || !metadata || typeof metadata === "string") {
    return { sourceFileId, folderId, ok: false, statusCode: metadataResponse.status, response: metadata };
  }

  const mediaResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(sourceFileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!mediaResponse.ok) {
    return { sourceFileId, folderId, ok: false, statusCode: mediaResponse.status, response: parseJsonIfPossible(await mediaResponse.text()) };
  }

  const bytes = new Uint8Array(await mediaResponse.arrayBuffer());
  const filename = requestedName ?? metadata.name ?? sourceFileId;
  const mimeType = metadata.mimeType ?? "application/octet-stream";
  const result = await uploadBytesToFolder({ folderId, filename, mimeType, bytes, token });
  return { sourceFileId, folderId, filename, mimeType, bytesCopied: bytes.byteLength, ...result };
}

function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function normalizeDrivePath(path: string) {
  return path.split("/").map((part) => part.trim()).filter(Boolean).join("/");
}

function parseDriveJobPayload(payload: Record<string, unknown>): DriveJobPayload {
  const jobId = requireString(payload, "job_id");
  const mode = requireString(payload, "mode");
  const rootFolderId = requireString(payload, "root_folder_id");
  const rootFolderName = requireString(payload, "root_folder_name");
  if (mode !== "dry_run" && mode !== "approved_write") {
    throw new Error("payload.mode must be dry_run or approved_write");
  }

  const folderManifest = Array.isArray(payload.folder_manifest)
    ? payload.folder_manifest.map((item) => String(item)).map(normalizeDrivePath).filter(Boolean)
    : [];
  const uploadFiles = Array.isArray(payload.upload_files) ? payload.upload_files : [];
  const moveFiles = Array.isArray(payload.move_files) ? payload.move_files : [];
  const moveFolders = Array.isArray(payload.move_folders) ? payload.move_folders : [];
  const blockedActions = Array.isArray(payload.blocked_actions) ? payload.blocked_actions.map((item) => String(item)) : [];

  return {
    job_id: jobId,
    mode,
    root_folder_id: rootFolderId,
    root_folder_name: rootFolderName,
    create_missing_folders: payload.create_missing_folders !== false,
    folder_manifest: folderManifest,
    upload_files: uploadFiles as DriveJobUpload[],
    move_files: moveFiles,
    move_folders: moveFolders,
    write_receipts: payload.write_receipts === true,
    validate_tree: payload.validate_tree !== false,
    blocked_actions: blockedActions
  };
}

async function findDriveFolderChild(token: string, parentId: string, name: string) {
  const query = [
    `'${escapeDriveQueryValue(parentId)}' in parents`,
    `name='${escapeDriveQueryValue(name)}'`,
    `mimeType='${DRIVE_FOLDER_MIME_TYPE}'`,
    "trashed=false"
  ].join(" and ");
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", query);
  url.searchParams.set("fields", "files(id,name,mimeType,parents)");
  url.searchParams.set("pageSize", "10");
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = parseJsonIfPossible(await response.text()) as { files?: Array<{ id: string; name: string }> } | string | null;
  if (!response.ok || !body || typeof body === "string") {
    throw new Error(`Drive folder lookup failed for ${name}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
  return body.files?.[0] ?? null;
}

async function createDriveFolder(token: string, parentId: string, name: string) {
  const response = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,parents,webViewLink", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: DRIVE_FOLDER_MIME_TYPE, parents: [parentId] })
  });
  const body = parseJsonIfPossible(await response.text());
  if (!response.ok || !body || typeof body === "string") {
    throw new Error(`Drive folder create failed for ${name}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
  return body as { id: string; name: string; webViewLink?: string };
}

async function ensureDriveFolderPath(params: { token: string; rootFolderId: string; path: string; dryRun: boolean; createMissing: boolean }) {
  const parts = normalizeDrivePath(params.path).split("/").filter(Boolean);
  let parentId = params.rootFolderId;
  const steps: Array<Record<string, unknown>> = [];

  for (const name of parts) {
    const existing = await findDriveFolderChild(params.token, parentId, name);
    if (existing) {
      steps.push({ pathPart: name, status: "exists", folderId: existing.id, parentId });
      parentId = existing.id;
      continue;
    }

    if (!params.createMissing) {
      steps.push({ pathPart: name, status: "missing", parentId });
      break;
    }

    if (params.dryRun) {
      steps.push({ pathPart: name, status: "would_create", parentId });
      parentId = `dry-run:${parts.slice(0, steps.length).join("/")}`;
      continue;
    }

    const created = await createDriveFolder(params.token, parentId, name);
    steps.push({ pathPart: name, status: "created", folderId: created.id, parentId, webViewLink: created.webViewLink });
    parentId = created.id;
  }

  return { path: params.path, folderId: parentId, steps };
}

function validateDriveJobSafety(job: DriveJobPayload, approved?: boolean) {
  const blockedActions = new Set([...(job.blocked_actions ?? []), "delete", "rename_existing", "publish", "deploy", "payment", "live_social"]);
  const blocked: Array<Record<string, unknown>> = [];

  if ((job.move_files?.length ?? 0) > 0) blocked.push({ action: "move_files", reason: "Moving existing files requires separate exact approval." });
  if ((job.move_folders?.length ?? 0) > 0) blocked.push({ action: "move_folders", reason: "Moving existing folders requires separate exact approval." });
  for (const action of blockedActions) blocked.push({ action, reason: "Blocked by Drive job governance policy." });

  if (job.mode === "approved_write" && approved !== true) {
    blocked.push({ action: "approved_write", reason: "Explicit approval is required for approved_write mode.", requiredField: "approved: true" });
  }

  return blocked;
}

async function runDriveJob(payload: Record<string, unknown>, approved?: boolean) {
  const job = parseDriveJobPayload(payload);
  const blocked = validateDriveJobSafety(job, approved);
  const dryRun = job.mode === "dry_run";
  const hardBlocked = blocked.filter((item) => item.action === "approved_write" || item.action === "move_files" || item.action === "move_folders");

  if (hardBlocked.length > 0) {
    return {
      job_id: job.job_id,
      mode: job.mode,
      status: "blocked",
      root_folder_id: job.root_folder_id,
      root_folder_name: job.root_folder_name,
      blocked
    };
  }

  const token = await getGoogleDriveToken();
  const folderResults = [];
  const folderIdByPath = new Map<string, string>();

  for (const path of job.folder_manifest ?? []) {
    const result = await ensureDriveFolderPath({
      token,
      rootFolderId: job.root_folder_id,
      path,
      dryRun,
      createMissing: job.create_missing_folders !== false
    });
    folderResults.push(result);
    folderIdByPath.set(path, result.folderId);
  }

  const uploadResults = [];
  for (const upload of job.upload_files ?? []) {
    const folderId = upload.folderId ?? (upload.targetPath ? folderIdByPath.get(normalizeDrivePath(upload.targetPath)) : undefined);
    if (!folderId) {
      uploadResults.push({ filename: upload.filename, status: "blocked", reason: "Missing upload folderId or resolvable targetPath" });
      continue;
    }
    if (dryRun) {
      uploadResults.push({ filename: upload.filename, mimeType: upload.mimeType, folderId, status: "would_upload" });
      continue;
    }
    const bytes = Buffer.from(upload.base64Content, "base64");
    uploadResults.push({ filename: upload.filename, folderId, ...(await uploadBytesToFolder({ folderId, filename: upload.filename, mimeType: upload.mimeType, bytes, token })) });
  }

  const receipt = {
    job_id: job.job_id,
    mode: job.mode,
    status: dryRun ? "dry_run_complete" : "approved_write_complete",
    root_folder_id: job.root_folder_id,
    root_folder_name: job.root_folder_name,
    folder_manifest_count: job.folder_manifest?.length ?? 0,
    upload_file_count: job.upload_files?.length ?? 0,
    folder_results: folderResults,
    upload_results: uploadResults,
    blocked,
    validate_tree: job.validate_tree,
    write_receipts: job.write_receipts,
    timestamp: new Date().toISOString()
  };

  if (!dryRun && job.write_receipts) {
    const receiptBytes = Buffer.from(JSON.stringify(receipt, null, 2), "utf8");
    const writeResult = await uploadBytesToFolder({
      folderId: job.root_folder_id,
      filename: `${job.job_id}-receipt.json`,
      mimeType: "application/json",
      bytes: receiptBytes,
      token
    });
    return { ...receipt, receipt_write_result: writeResult };
  }

  return receipt;
}

async function launchBrowser() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (executablePath) {
    const playwright = await import("playwright-core");
    return playwright.chromium.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  }

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const [{ chromium }, chromiumPackage] = await Promise.all([import("playwright-core"), import("@sparticuz/chromium")]);
    const serverlessChromium = chromiumPackage.default;
    return chromium.launch({
      args: serverlessChromium.args,
      executablePath: await serverlessChromium.executablePath(),
      headless: true
    });
  }

  const playwright = await import("playwright");
  return playwright.chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
}

async function screenshotQA(payload: Record<string, unknown>) {
  const url = requireString(payload, "url");
  const viewports = Array.isArray(payload.viewports)
    ? payload.viewports
    : [{ name: "desktop", width: 1440, height: 1200 }, { name: "mobile", width: 390, height: 844 }];
  const browser = await launchBrowser();
  const receipts = [];
  try {
    for (const viewport of viewports) {
      const name = typeof viewport === "object" && viewport && "name" in viewport ? String(viewport.name) : "viewport";
      const width = typeof viewport === "object" && viewport && "width" in viewport ? Number(viewport.width) : 1440;
      const height = typeof viewport === "object" && viewport && "height" in viewport ? Number(viewport.height) : 1200;
      const page = await browser.newPage({ viewport: { width, height } });
      const consoleErrors: string[] = [];
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      const screenshot = await page.screenshot({ fullPage: true, type: "png" });
      receipts.push({ name, width, height, statusCode: response?.status() ?? null, title: await page.title(), consoleErrors, screenshotBase64: screenshot.toString("base64") });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return { url, receipts };
}

async function submitLeadFormAndVerifySupabase(payload: Record<string, unknown>) {
  const url = requireString(payload, "url");
  const email = requireString(payload, "email");
  const table = typeof payload.table === "string" && payload.table.trim() ? payload.table.trim() : "nrw_leads";
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    const selectors = {
      name: typeof payload.nameSelector === "string" ? payload.nameSelector : "input[name='name']",
      email: typeof payload.emailSelector === "string" ? payload.emailSelector : "input[name='email']",
      phone: typeof payload.phoneSelector === "string" ? payload.phoneSelector : "input[name='phone']",
      message: typeof payload.messageSelector === "string" ? payload.messageSelector : "textarea[name='message']",
      submit: typeof payload.submitSelector === "string" ? payload.submitSelector : "button[type='submit']"
    };
    await page.fill(selectors.name, typeof payload.name === "string" ? payload.name : "AUTO BUILDER QA");
    await page.fill(selectors.email, email);
    await page.fill(selectors.phone, typeof payload.phone === "string" ? payload.phone : "6155550199");
    await page.fill(selectors.message, typeof payload.message === "string" ? payload.message : "AUTO BUILDER browser QA lead submission");
    await Promise.all([page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => undefined), page.click(selectors.submit)]);
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase.from(table).select("*").eq("email", email).order("created_at", { ascending: false }).limit(1);
    if (error) throw error;
    return { url, email, table, currentUrl: page.url(), rowFound: Array.isArray(data) && data.length > 0, row: Array.isArray(data) ? data[0] ?? null : null };
  } finally {
    await browser.close();
  }
}

export async function runExecutionWorker(request: WorkerRequest): Promise<WorkerResult> {
  const blocked = requireWorkerEnabled(request);
  if (blocked) return blocked;
  const action = request.action as WorkerAction;
  const payload = request.payload ?? {};
  try {
    const receipt =
      action === "vercel.removeProjectDomain" ? await removeProjectDomain(payload)
      : action === "drive.uploadFileToFolder" ? await uploadFileToFolder(payload)
      : action === "drive.copyFileToFolder" ? await copyFileToFolder(payload)
      : action === "drive.runDriveJob" ? await runDriveJob(payload, request.approved)
      : action === "playwright.screenshotQA" ? await screenshotQA(payload)
      : action === "playwright.submitLeadFormAndVerifySupabase" ? await submitLeadFormAndVerifySupabase(payload)
      : { reason: `Unknown action ${action}` };
    return { status: "ok", action, receipt };
  } catch (error) {
    return { status: "error", action, receipt: { message: error instanceof Error ? error.message : String(error) } };
  }
}

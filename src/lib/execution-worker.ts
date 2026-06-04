import { createClient } from "@supabase/supabase-js";

export type WorkerAction =
  | "vercel.removeProjectDomain"
  | "drive.uploadFileToFolder"
  | "drive.copyFileToFolder"
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

function getGoogleDriveToken() {
  const token = process.env.GOOGLE_DRIVE_ACCESS_TOKEN ?? process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Missing GOOGLE_DRIVE_ACCESS_TOKEN or GOOGLE_WORKSPACE_ACCESS_TOKEN");
  }
  return token;
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
      receipt: {
        reason: "Worker token missing or invalid",
        requiredEnv: ["AUTO_BUILDER_WORKER_TOKEN"]
      }
    };
  }

  if (!request.action) {
    return { status: "blocked" as const, receipt: { reason: "Missing action" } };
  }

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
  const text = await response.text();
  return { project, domain, ok: response.ok, statusCode: response.status, response: parseJsonIfPossible(text) };
}

async function uploadBytesToFolder(params: { folderId: string; filename: string; mimeType: string; bytes: ArrayBuffer; token: string }) {
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
    {
      method: "POST",
      headers: { Authorization: `Bearer ${params.token}`, "Content-Type": `multipart/related; boundary=${boundary}` },
      body
    }
  );
  const text = await response.text();
  return { ok: response.ok, statusCode: response.status, response: parseJsonIfPossible(text) };
}

async function uploadFileToFolder(payload: Record<string, unknown>) {
  const token = getGoogleDriveToken();
  const folderId = requireString(payload, "folderId");
  const filename = requireString(payload, "filename");
  const mimeType = requireString(payload, "mimeType");
  const base64Content = requireString(payload, "base64Content");
  const bytes = Buffer.from(base64Content, "base64");
  const result = await uploadBytesToFolder({ folderId, filename, mimeType, bytes, token });
  return { folderId, filename, ...result };
}

async function copyFileToFolder(payload: Record<string, unknown>) {
  const token = getGoogleDriveToken();
  const sourceFileId = requireString(payload, "sourceFileId");
  const folderId = requireString(payload, "folderId");
  const requestedName = typeof payload.filename === "string" && payload.filename.trim() ? payload.filename.trim() : undefined;

  const metadataResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(sourceFileId)}?fields=id,name,mimeType,size,webViewLink`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const metadataText = await metadataResponse.text();
  const metadata = parseJsonIfPossible(metadataText) as { name?: string; mimeType?: string } | string | null;
  if (!metadataResponse.ok || !metadata || typeof metadata === "string") {
    return { sourceFileId, folderId, ok: false, statusCode: metadataResponse.status, response: metadata };
  }

  const mediaResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(sourceFileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!mediaResponse.ok) {
    return { sourceFileId, folderId, ok: false, statusCode: mediaResponse.status, response: parseJsonIfPossible(await mediaResponse.text()) };
  }

  const bytes = await mediaResponse.arrayBuffer();
  const filename = requestedName ?? metadata.name ?? sourceFileId;
  const mimeType = metadata.mimeType ?? "application/octet-stream";
  const result = await uploadBytesToFolder({ folderId, filename, mimeType, bytes, token });
  return { sourceFileId, folderId, filename, mimeType, bytesCopied: bytes.byteLength, ...result };
}

async function launchBrowser() {
  const playwright = await import("playwright");
  return playwright.chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
}

async function screenshotQA(payload: Record<string, unknown>) {
  const url = requireString(payload, "url");
  const viewports = Array.isArray(payload.viewports)
    ? payload.viewports
    : [
        { name: "desktop", width: 1440, height: 1200 },
        { name: "mobile", width: 390, height: 844 }
      ];

  const browser = await launchBrowser();
  const receipts = [];
  try {
    for (const viewport of viewports) {
      const name = typeof viewport === "object" && viewport && "name" in viewport ? String(viewport.name) : "viewport";
      const width = typeof viewport === "object" && viewport && "width" in viewport ? Number(viewport.width) : 1440;
      const height = typeof viewport === "object" && viewport && "height" in viewport ? Number(viewport.height) : 1200;
      const page = await browser.newPage({ viewport: { width, height } });
      const consoleErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
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
      action === "vercel.removeProjectDomain"
        ? await removeProjectDomain(payload)
        : action === "drive.uploadFileToFolder"
          ? await uploadFileToFolder(payload)
          : action === "drive.copyFileToFolder"
            ? await copyFileToFolder(payload)
            : action === "playwright.screenshotQA"
              ? await screenshotQA(payload)
              : action === "playwright.submitLeadFormAndVerifySupabase"
                ? await submitLeadFormAndVerifySupabase(payload)
                : { reason: `Unknown action ${action}` };

    return { status: "ok", action, receipt };
  } catch (error) {
    return { status: "error", action, receipt: { message: error instanceof Error ? error.message : String(error) } };
  }
}

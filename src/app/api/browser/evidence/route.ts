import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 300;

type BrowserTask = {
  id: string;
  task_type: string;
  task_prompt: string;
  target: string;
  priority: string;
  approved: boolean;
  safe: boolean;
  state: string;
  created_at: string;
};

type ScreenshotPayload = {
  name: string;
  width: number;
  height: number;
  statusCode: number | null;
  title: string;
  consoleErrors: string[];
  pageErrors: string[];
  screenshotBytes: number;
  dataUrl: string;
};

type EvidencePayload = {
  taskId: string;
  claimId?: string;
  worker?: string;
  target: string;
  startedAt?: string;
  completedAt?: string;
  screenshots?: ScreenshotPayload[];
  lead?: { email?: string; [key: string]: unknown };
  blocker?: string | null;
};

type JsonWebKeySet = {
  keys: JsonWebKey[];
};

const GITHUB_OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_OIDC_AUDIENCE = "auto-builder-browser-evidence";
const ALLOWED_REPOSITORY = "Strategic-Minds/AUTO_BUILDER";
const ALLOWED_REFS = ["refs/heads/auto-builder/nrw-browser-worker", "refs/heads/main"];

function base64UrlToUint8Array(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return new Uint8Array(Buffer.from(padded, "base64"));
}

function decodeJwtPart<T>(part: string): T {
  return JSON.parse(Buffer.from(base64UrlToUint8Array(part)).toString("utf8")) as T;
}

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function isNrwTask(task: BrowserTask) {
  return task.target.includes("nashvilleresinworx") || task.task_prompt.includes("NRW") || task.task_prompt.includes("nrw_leads");
}

function bearerToken(request: NextRequest) {
  const header = request.headers.get("authorization") ?? "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
}

async function verifyGitHubOidc(token: string) {
  const [headerPart, payloadPart, signaturePart] = token.split(".");
  if (!headerPart || !payloadPart || !signaturePart) return false;

  const header = decodeJwtPart<{ alg?: string; kid?: string }>(headerPart);
  const payload = decodeJwtPart<{ iss?: string; aud?: string | string[]; exp?: number; nbf?: number; repository?: string; ref?: string }>(payloadPart);
  const now = Math.floor(Date.now() / 1000);
  const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

  if (header.alg !== "RS256" || !header.kid) return false;
  if (payload.iss !== GITHUB_OIDC_ISSUER) return false;
  if (!audience.includes(GITHUB_OIDC_AUDIENCE)) return false;
  if (!payload.exp || payload.exp < now) return false;
  if (payload.nbf && payload.nbf > now + 60) return false;
  if (payload.repository !== ALLOWED_REPOSITORY) return false;
  if (!payload.ref || !ALLOWED_REFS.includes(payload.ref)) return false;

  const jwksResponse = await fetch(`${GITHUB_OIDC_ISSUER}/.well-known/jwks`);
  if (!jwksResponse.ok) return false;
  const jwks = (await jwksResponse.json()) as JsonWebKeySet;
  const jwk = jwks.keys.find((key) => key.kid === header.kid);
  if (!jwk) return false;

  const cryptoKey = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const signed = new TextEncoder().encode(`${headerPart}.${payloadPart}`);
  const signature = base64UrlToUint8Array(signaturePart);
  return crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, signature, signed);
}

async function isAuthorized(request: NextRequest) {
  const token = bearerToken(request);
  if (!token) return false;

  const configuredToken = process.env.BROWSER_WORKER_TOKEN || process.env.AUTO_BUILDER_WORKER_TOKEN;
  if (configuredToken && token === configuredToken) return true;

  return verifyGitHubOidc(token).catch(() => false);
}

async function insertRow<T extends Record<string, unknown>>(table: string, row: T) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from(table).insert(row).select("*").single();
  if (error) throw new Error(`${table} insert failed: ${error.message}`);
  return data;
}

async function selectTask() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("browser_tasks")
    .select("*")
    .eq("approved", true)
    .eq("safe", true)
    .in("state", ["queued", "claimed", "blocked"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(`browser_tasks select failed: ${error.message}`);
  return ((data ?? []) as BrowserTask[]).find(isNrwTask) ?? null;
}

async function verifyLead(email: string | undefined) {
  if (!email) return { rowFound: false, row: null };
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("nrw_leads")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(`nrw_leads verification failed: ${error.message}`);
  return { rowFound: Array.isArray(data) && data.length > 0, row: Array.isArray(data) ? data[0] ?? null : null };
}

async function updateTask(taskId: string, state: "claimed" | "completed" | "blocked") {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("browser_tasks").update({ state }).eq("id", taskId);
  if (error) throw new Error(`browser_tasks update failed: ${error.message}`);
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const worker = request.nextUrl.searchParams.get("worker") ?? "github_actions_playwright_nrw_worker";
  const explicitTaskId = request.nextUrl.searchParams.get("taskId");
  const supabase = getSupabaseClient();
  let task: BrowserTask | null = null;

  if (explicitTaskId) {
    const { data, error } = await supabase.from("browser_tasks").select("*").eq("id", explicitTaskId).single();
    if (error) throw new Error(`browser_tasks explicit select failed: ${error.message}`);
    task = data as BrowserTask;
  } else {
    task = await selectTask();
  }

  if (!task) return NextResponse.json({ ok: true, task: null, reason: "No approved safe NRW browser task found." });

  const claim = await insertRow("browser_claims", {
    task_ref: task.id,
    worker,
    claimed_at: new Date().toISOString()
  });
  await updateTask(task.id, "claimed");

  return NextResponse.json({ ok: true, task, claim });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const payload = (await request.json()) as EvidencePayload;
  if (!payload.taskId || !payload.target) return NextResponse.json({ ok: false, error: "Missing taskId or target" }, { status: 400 });

  const completedAt = payload.completedAt ?? new Date().toISOString();
  const screenshots = payload.screenshots ?? [];
  for (const screenshot of screenshots) {
    await insertRow("browser_screenshots", {
      task_ref: payload.taskId,
      screenshot_ref: JSON.stringify({
        name: screenshot.name,
        width: screenshot.width,
        height: screenshot.height,
        statusCode: screenshot.statusCode,
        title: screenshot.title,
        consoleErrors: screenshot.consoleErrors,
        pageErrors: screenshot.pageErrors,
        screenshotBytes: screenshot.screenshotBytes,
        dataUrl: screenshot.dataUrl
      }),
      created_at: completedAt
    });
  }

  const leadVerification = await verifyLead(payload.lead?.email);
  const blockerParts = [payload.blocker, leadVerification.rowFound ? null : payload.lead?.email ? `Lead row missing for ${payload.lead.email}` : null].filter(Boolean);
  const blocker = blockerParts.length ? blockerParts.join(" | ") : null;
  const status = blocker ? "blocked" : "success";

  await insertRow("browser_evidence", {
    task_ref: payload.taskId,
    claim_ref: payload.claimId ?? null,
    status,
    evidence: JSON.stringify({
      worker: payload.worker ?? "github_actions_playwright_nrw_worker",
      taskId: payload.taskId,
      target: payload.target,
      startedAt: payload.startedAt,
      completedAt,
      screenshots: screenshots.map(({ dataUrl: _dataUrl, ...receipt }) => receipt),
      lead: { ...(payload.lead ?? {}), ...leadVerification }
    }),
    source_url: payload.target,
    created_at: completedAt
  });

  if (blocker) {
    await insertRow("browser_blockers", {
      task_ref: payload.taskId,
      blocker,
      severity: "high",
      state: "open",
      created_at: completedAt
    });
  }

  await updateTask(payload.taskId, blocker ? "blocked" : "completed");
  await insertRow("worker_heartbeats", {
    worker_name: payload.worker ?? "github_actions_playwright_nrw_worker",
    surface: "browser_tasks",
    status,
    last_seen_at: completedAt,
    created_at: completedAt
  }).catch(() => null);

  return NextResponse.json({ ok: !blocker, status, blocker, screenshots: screenshots.length, lead: leadVerification });
}

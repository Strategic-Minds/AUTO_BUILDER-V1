import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { insertTelemetry, readTelemetryByQuery, updateTelemetry } from "@/lib/telemetry-store";

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

type ScreenshotReceipt = {
  name: string;
  width: number;
  height: number;
  statusCode: number | null;
  title: string;
  consoleErrors: string[];
  screenshotBytes: number;
};

function parseEmailFromPrompt(prompt: string) {
  const match = prompt.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? `browser-qa-${Date.now()}@example.com`;
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

async function getLatestClaim(taskId: string) {
  const claims = await readTelemetryByQuery("browser_claims", {
    select: "*",
    task_ref: `eq.${taskId}`,
    order: "claimed_at.desc",
    limit: "1"
  });

  if (!claims.ok) return null;
  return (claims.rows[0] as { id?: string } | undefined)?.id ?? null;
}

async function selectTask() {
  const claimed = await readTelemetryByQuery("browser_tasks", {
    select: "*",
    state: "eq.claimed",
    order: "created_at.asc",
    limit: "10"
  });

  if (!claimed.ok) {
    return { ok: false as const, error: "browser_task_queue_unavailable", detail: claimed };
  }

  const candidates = claimed.rows as BrowserTask[];
  for (const task of candidates) {
    const evidence = await readTelemetryByQuery("browser_evidence", {
      select: "id,status,created_at",
      task_ref: `eq.${task.id}`,
      order: "created_at.desc",
      limit: "1"
    });
    if (evidence.ok && evidence.rows.length === 0) {
      return { ok: true as const, task };
    }
  }

  return { ok: true as const, task: null };
}

async function captureScreenshots(task: BrowserTask) {
  const browser = await launchBrowser();
  const receipts: ScreenshotReceipt[] = [];
  const screenshotRows: Array<{ name: string; dataUrl: string }> = [];
  const viewports = [
    { name: "desktop", width: 1440, height: 1200 },
    { name: "mobile", width: 390, height: 844 }
  ];

  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
      const consoleErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });

      const response = await page.goto(task.target, { waitUntil: "networkidle", timeout: 60000 });
      const title = await page.title();
      const screenshot = await page.screenshot({ fullPage: true, type: "png" });
      const screenshotBase64 = screenshot.toString("base64");
      screenshotRows.push({ name: viewport.name, dataUrl: `data:image/png;base64,${screenshotBase64}` });
      receipts.push({
        ...viewport,
        statusCode: response?.status() ?? null,
        title,
        consoleErrors,
        screenshotBytes: screenshot.byteLength
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  return { receipts, screenshotRows };
}

async function submitNrwLead(task: BrowserTask, email: string) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.goto(`${task.target.replace(/\/$/, "")}/#estimate`, { waitUntil: "networkidle", timeout: 60000 });

    await page.fill("input[name='fullName']", "AUTO BUILDER Bridge QA");
    await page.fill("input[name='phone']", "772-209-0266");
    await page.fill("input[name='email']", email);
    await page.selectOption("select[name='projectType']", { label: "Metallic Epoxy" }).catch(async () => {
      await page.selectOption("select[name='projectType']", { index: 1 });
    });
    await page.selectOption("select[name='squareFootage']", { index: 1 }).catch(() => undefined);
    await page.selectOption("select[name='surfaceCondition']", { index: 1 }).catch(() => undefined);

    await Promise.all([
      page.waitForURL(/thank-you|\/thank-you|#estimate/, { timeout: 60000 }).catch(() => undefined),
      page.click("button[type='submit']")
    ]);

    await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => undefined);
    const currentUrl = page.url();

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("nrw_leads")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    return {
      email,
      currentUrl,
      rowFound: Array.isArray(data) && data.length > 0,
      row: Array.isArray(data) ? data[0] ?? null : null
    };
  } finally {
    await browser.close();
  }
}

async function writeEvidence(task: BrowserTask, status: "success" | "blocked", evidence: Record<string, unknown>, blocker?: string) {
  const claimRef = await getLatestClaim(task.id);
  await insertTelemetry("browser_evidence", {
    task_ref: task.id,
    claim_ref: claimRef,
    status,
    evidence: JSON.stringify(evidence),
    source_url: task.target,
    created_at: new Date().toISOString()
  });

  if (blocker) {
    await insertTelemetry("browser_blockers", {
      task_ref: task.id,
      blocker,
      severity: status === "blocked" ? "high" : "medium",
      state: "open",
      created_at: new Date().toISOString()
    });
  }
}

export async function GET(request: NextRequest) {
  const worker = request.nextUrl.searchParams.get("worker") ?? "auto_builder_browser_processor";
  const selected = await selectTask();
  if (!selected.ok) {
    return NextResponse.json({ ok: false, error: selected.error, detail: selected.detail }, { status: 503 });
  }

  if (!selected.task) {
    return NextResponse.json({ ok: true, processed: false, reason: "No claimed browser task without evidence." });
  }

  const task = selected.task;
  const startedAt = new Date().toISOString();

  await insertTelemetry("worker_heartbeats", {
    worker_name: worker,
    surface: "browser_tasks",
    status: "running",
    last_seen_at: startedAt,
    created_at: startedAt
  });

  try {
    const email = parseEmailFromPrompt(task.task_prompt);
    const screenshotResult = await captureScreenshots(task);

    for (const screenshot of screenshotResult.screenshotRows) {
      await insertTelemetry("browser_screenshots", {
        task_ref: task.id,
        screenshot_ref: JSON.stringify({ name: screenshot.name, dataUrl: screenshot.dataUrl }),
        created_at: new Date().toISOString()
      });
    }

    const leadResult = task.task_prompt.includes("nrw_leads") || task.target.includes("nashvilleresinworx")
      ? await submitNrwLead(task, email)
      : null;

    const blocker = leadResult && !leadResult.rowFound ? `Lead submission did not create Supabase row for ${email}` : undefined;
    await writeEvidence(
      task,
      blocker ? "blocked" : "success",
      {
        worker,
        startedAt,
        completedAt: new Date().toISOString(),
        taskId: task.id,
        target: task.target,
        screenshots: screenshotResult.receipts,
        lead: leadResult
      },
      blocker
    );

    await updateTelemetry("browser_tasks", { state: blocker ? "blocked" : "completed" }, { id: `eq.${task.id}` });

    await insertTelemetry("worker_heartbeats", {
      worker_name: worker,
      surface: "browser_tasks",
      status: blocker ? "blocked" : "completed",
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ ok: !blocker, processed: true, taskId: task.id, screenshots: screenshotResult.receipts, lead: leadResult, blocker });
  } catch (error) {
    const blocker = error instanceof Error ? error.message : String(error);
    await writeEvidence(task, "blocked", { worker, taskId: task.id, target: task.target, error: blocker }, blocker);
    await updateTelemetry("browser_tasks", { state: "blocked" }, { id: `eq.${task.id}` });
    await insertTelemetry("worker_heartbeats", {
      worker_name: worker,
      surface: "browser_tasks",
      status: "error",
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
    return NextResponse.json({ ok: false, processed: true, taskId: task.id, error: blocker }, { status: 500 });
  }
}

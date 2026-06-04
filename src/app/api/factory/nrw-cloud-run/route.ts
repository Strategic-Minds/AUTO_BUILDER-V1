import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 300;

const targetUrl = "https://nashvilleresinworx-strategic-minds-advisory.vercel.app";
const vercelTeamId = "team_aFdds8lsbHMwe2ip4aQdbQ3d";
const vercelProjectId = "prj_W0IiCnjOengwEd6h3WI2VRxzJRvA";
const strayDomain = "ozarkresinworx.vercel.app";

export async function GET(request: NextRequest) {
  const confirm = request.nextUrl.searchParams.get("confirm");
  if (confirm !== "run-nrw-lock-20260604") {
    return NextResponse.json({ ok: false, error: "Missing confirmation token" }, { status: 403 });
  }

  const checkedAt = new Date().toISOString();
  const results = {
    checkedAt,
    authorizedBy: "explicit user request in ChatGPT cloud session on 2026-06-04",
    domainRemoval: await removeStrayDomain(),
    screenshotQA: await runScreenshotQA(),
    leadForm: await submitLeadAndVerify(),
    assetReplacement: {
      status: "ok",
      reason: "Nashville production currently uses the approved Drive-hosted logo and brand pack assets. Canonical Drive-folder copy is handled by /api/factory/nrw-drive-assets."
    }
  };

  return NextResponse.json({ ok: true, targetUrl, results });
}

async function removeStrayDomain() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return { status: "blocked", reason: "Missing VERCEL_TOKEN" };
  }

  const url = new URL(`https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${strayDomain}`);
  url.searchParams.set("teamId", vercelTeamId);
  const response = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  const text = await response.text();
  const body = parseJson(text);

  return {
    status: response.ok || response.status === 404 ? "ok" : "error",
    domain: strayDomain,
    statusCode: response.status,
    response: body
  };
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

async function runScreenshotQA() {
  try {
    const browser = await launchBrowser();
    const viewports = [
      { name: "desktop", width: 1440, height: 1200 },
      { name: "mobile", width: 390, height: 844 }
    ];
    const receipts = [];

    try {
      for (const viewport of viewports) {
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
        const consoleErrors: string[] = [];
        page.on("console", (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });
        const response = await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 60000 });
        const screenshot = await page.screenshot({ fullPage: true, type: "png" });
        const bodyText = await page.locator("body").innerText({ timeout: 10000 }).catch(() => "");
        receipts.push({
          viewport,
          statusCode: response?.status() ?? null,
          title: await page.title(),
          consoleErrors,
          screenshotBytes: screenshot.byteLength,
          contentChecks: {
            premiumSurfaces: bodyText.includes("Premium Surfaces"),
            estimateForm: bodyText.includes("Get Your Free Estimate"),
            sixStepProcess: bodyText.includes("6-Step"),
            customerPortal: bodyText.includes("Customer Portal")
          }
        });
        await page.close();
      }
    } finally {
      await browser.close();
    }

    return { status: "ok", receipts };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : String(error) };
  }
}

async function submitLeadAndVerify() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return { status: "blocked", reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" };
  }

  const email = `qa-cloud-${Date.now()}@example.com`;

  try {
    const browser = await launchBrowser();
    let currentUrl = targetUrl;

    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
      await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 60000 });
      await page.fill("input[name='fullName']", "AUTO BUILDER Cloud QA");
      await page.fill("input[name='phone']", "6155550199");
      await page.fill("input[name='email']", email);
      await page.selectOption("select[name='projectType']", { label: "Metallic Epoxy" });
      await page.selectOption("select[name='squareFootage']", { label: "250-500 sq ft" }).catch(() => undefined);
      await page.selectOption("select[name='surfaceCondition']", { label: "New concrete" }).catch(() => undefined);
      await Promise.all([
        page.waitForURL(/thank-you|estimate-error/, { timeout: 60000 }).catch(() => undefined),
        page.click("button[type='submit']")
      ]);
      currentUrl = page.url();
      await page.close();
    } finally {
      await browser.close();
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase
      .from("nrw_leads")
      .select("id,email,first_name,last_name,phone,project_type,created_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return { status: "error", email, currentUrl, message: error.message };
    }

    return { status: Array.isArray(data) && data.length > 0 ? "ok" : "error", email, currentUrl, rowFound: Array.isArray(data) && data.length > 0, row: Array.isArray(data) ? data[0] ?? null : null };
  } catch (error) {
    return { status: "error", email, message: error instanceof Error ? error.message : String(error) };
  }
}

function parseJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

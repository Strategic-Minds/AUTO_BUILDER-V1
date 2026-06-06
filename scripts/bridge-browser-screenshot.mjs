import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const urls = process.argv.slice(2).filter(Boolean);
const artifactDir = process.env.BRIDGE_SMOKE_ARTIFACT_DIR || "bridge-smoke-artifacts";

if (urls.length === 0) {
  console.log("No URLs provided for screenshot smoke; writing empty receipt.");
}

await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const receipts = [];

for (const [index, url] of urls.entries()) {
  const startedAt = new Date().toISOString();
  const safeName = url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 90) || `url-${index + 1}`;
  const screenshotPath = path.join(artifactDir, `${String(index + 1).padStart(2, "0")}-${safeName}.png`);

  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    receipts.push({
      url,
      status: response?.status() ?? null,
      ok: response ? response.ok() : false,
      screenshotPath,
      startedAt,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    receipts.push({
      url,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      screenshotPath: null,
      startedAt,
      completedAt: new Date().toISOString(),
    });
  }
}

await browser.close();

const receiptPath = path.join(artifactDir, "browser-screenshot-smoke.json");
await writeFile(receiptPath, JSON.stringify({ generatedAt: new Date().toISOString(), receipts }, null, 2));

const failed = receipts.filter((receipt) => !receipt.ok);
console.log(JSON.stringify({ receiptPath, total: receipts.length, failed: failed.length }, null, 2));

if (failed.length > 0 && process.env.BRIDGE_SCREENSHOT_STRICT === "true") {
  process.exit(1);
}

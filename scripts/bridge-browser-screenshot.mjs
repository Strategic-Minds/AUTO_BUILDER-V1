#!/usr/bin/env node
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const urls = process.argv.slice(2).filter(Boolean);
if (urls.length === 0) {
  console.error("Usage: node scripts/bridge-browser-screenshot.mjs <url> [...url]");
  process.exit(1);
}

const outDir = resolve(process.env.BRIDGE_SCREENSHOT_DIR || "bridge-smoke-artifacts");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

for (const [index, url] of urls.entries()) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) errors.push({ type: msg.type(), text: msg.text() });
  });
  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  const textLength = await page.locator("body").innerText({ timeout: 10000 }).then((text) => text.trim().length).catch(() => 0);
  const file = `${outDir}/screenshot-${index + 1}.png`;
  await page.screenshot({ path: file, fullPage: true });
  results.push({ url, status: response?.status() || null, textLength, screenshot: file, errors });
  await page.close();
}

await browser.close();
await writeFile(`${outDir}/browser-smoke-report.json`, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
console.log(JSON.stringify({ status: "completed", results }, null, 2));

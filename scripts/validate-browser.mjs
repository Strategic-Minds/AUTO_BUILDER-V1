import { chromium } from 'playwright';
import { receiptBase, writeJson } from '../lib/receipt.mjs';

const target = process.argv[2] ?? 'http://127.0.0.1:3000';
const receipt = receiptBase('browser-validation');
const artifactsDir = 'validation-artifacts';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  await page.goto(target, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${artifactsDir}/desktop-home.png`, fullPage: true });
  receipt.receipts.push({ step: 'desktop-screenshot', path: `${artifactsDir}/desktop-home.png`, viewport: '1440x1100' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.screenshot({ path: `${artifactsDir}/mobile-home.png`, fullPage: true });
  receipt.receipts.push({ step: 'mobile-screenshot', path: `${artifactsDir}/mobile-home.png`, viewport: '390x844' });

  await browser.close();
  await writeJson(`${artifactsDir}/browser-validation.receipt.json`, {
    ...receipt,
    target,
    status: 'passed'
  });
}

main().catch(async (error) => {
  await writeJson(`${artifactsDir}/browser-validation.receipt.json`, {
    ...receipt,
    target,
    status: 'failed',
    blocker: String(error instanceof Error ? error.message : error)
  });
  console.error(error);
  process.exit(1);
});

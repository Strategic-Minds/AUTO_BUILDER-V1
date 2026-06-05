import { chromium } from 'playwright';

const DEFAULT_TARGET = 'https://nashvilleresinworx-strategic-minds-advisory.vercel.app';
const DEFAULT_WORKER = 'github_actions_playwright_nrw_worker';
const DEFAULT_EVIDENCE_ENDPOINT = 'https://auto-builder-git-auto-builder-n-6f3dfe-strategic-minds-advisory.vercel.app/api/browser/evidence';
const OIDC_AUDIENCE = 'auto-builder-browser-evidence';

function parseEmailFromPrompt(prompt = '') {
  const match = prompt.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? null;
}

function makeQaEmail() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `nrw-gha-browser-qa-${stamp}@example.com`;
}

async function getAuthToken() {
  if (process.env.BROWSER_WORKER_TOKEN) return process.env.BROWSER_WORKER_TOKEN;
  if (process.env.AUTO_BUILDER_WORKER_TOKEN) return process.env.AUTO_BUILDER_WORKER_TOKEN;

  const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!requestUrl || !requestToken) {
    throw new Error('Missing GitHub OIDC request env. Ensure workflow permissions include id-token: write.');
  }

  const url = new URL(requestUrl);
  url.searchParams.set('audience', OIDC_AUDIENCE);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${requestToken}` } });
  if (!response.ok) throw new Error(`GitHub OIDC token request failed: ${response.status} ${await response.text()}`);
  const body = await response.json();
  if (!body.value) throw new Error('GitHub OIDC token response did not include value.');
  return body.value;
}

async function evidenceFetch(endpoint, token, options = {}) {
  const headers = new Headers(options.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('content-type')) headers.set('content-type', 'application/json');

  const response = await fetch(endpoint, { ...options, headers });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!response.ok) throw new Error(`Evidence bridge request failed: ${response.status} ${text}`);
  return body;
}

async function claimTask(endpoint, token, worker) {
  const url = new URL(endpoint);
  url.searchParams.set('worker', worker);
  const taskId = process.env.NRW_BROWSER_TASK_ID || process.env.BROWSER_TASK_ID;
  if (taskId) url.searchParams.set('taskId', taskId);
  return evidenceFetch(url, token);
}

async function captureViewport(browser, target, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const response = await page.goto(target, { waitUntil: 'networkidle', timeout: 90000 });
    await page.locator('body').waitFor({ state: 'visible', timeout: 30000 });
    const title = await page.title();
    const screenshot = await page.screenshot({ fullPage: true, type: 'png' });

    return {
      name: viewport.name,
      width: viewport.width,
      height: viewport.height,
      statusCode: response?.status() ?? null,
      title,
      consoleErrors,
      pageErrors,
      screenshotBytes: screenshot.byteLength,
      dataUrl: `data:image/png;base64,${screenshot.toString('base64')}`
    };
  } finally {
    await page.close();
  }
}

async function submitLeadWithBrowser(browser, target, email) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  try {
    await page.goto(`${target.replace(/\/$/, '')}/#estimate`, { waitUntil: 'networkidle', timeout: 90000 });
    await page.fill("input[name='fullName']", 'AUTO BUILDER GitHub Actions QA');
    await page.fill("input[name='phone']", '772-209-0266');
    await page.fill("input[name='email']", email);
    await page.selectOption("select[name='projectType']", { label: 'Metallic Epoxy' }).catch(async () => page.selectOption("select[name='projectType']", { index: 1 }));
    await page.selectOption("select[name='squareFootage']", { label: 'Under 250 sq ft' }).catch(async () => page.selectOption("select[name='squareFootage']", { index: 1 }));
    await page.selectOption("select[name='surfaceCondition']", { label: 'New concrete' }).catch(async () => page.selectOption("select[name='surfaceCondition']", { index: 1 }));
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: 90000 }).catch(() => undefined),
      page.click("button[type='submit']")
    ]);
    await page.waitForTimeout(3000);
    return { method: 'browser', email, currentUrl: page.url() };
  } finally {
    await page.close();
  }
}

async function main() {
  const worker = process.env.BROWSER_WORKER_NAME || DEFAULT_WORKER;
  const endpoint = process.env.BROWSER_EVIDENCE_ENDPOINT || DEFAULT_EVIDENCE_ENDPOINT;
  const token = await getAuthToken();
  const startedAt = new Date().toISOString();
  const claimed = await claimTask(endpoint, token, worker);

  if (!claimed?.task) {
    console.log(JSON.stringify({ ok: true, processed: false, reason: claimed?.reason ?? 'No task returned.' }, null, 2));
    return;
  }

  const task = claimed.task;
  const target = process.env.NRW_TARGET_URL || task.target || DEFAULT_TARGET;
  const qaEmail = process.env.NRW_QA_EMAIL || parseEmailFromPrompt(task.task_prompt) || makeQaEmail();
  const screenshots = [];
  let lead = null;
  const blockerParts = [];

  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [
      { name: 'desktop', width: 1440, height: 1200 },
      { name: 'mobile', width: 390, height: 844 }
    ]) {
      const receipt = await captureViewport(browser, target, viewport);
      screenshots.push(receipt);
      if (receipt.statusCode && receipt.statusCode >= 400) blockerParts.push(`${receipt.name} returned HTTP ${receipt.statusCode}`);
      if (receipt.consoleErrors.length) blockerParts.push(`${receipt.name} console errors: ${receipt.consoleErrors.slice(0, 3).join(' | ')}`);
      if (receipt.pageErrors.length) blockerParts.push(`${receipt.name} page errors: ${receipt.pageErrors.slice(0, 3).join(' | ')}`);
    }

    lead = await submitLeadWithBrowser(browser, target, qaEmail);
  } catch (error) {
    blockerParts.push(error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }

  const completedAt = new Date().toISOString();
  const payload = {
    taskId: task.id,
    claimId: claimed.claim?.id,
    worker,
    target,
    startedAt,
    completedAt,
    screenshots,
    lead,
    blocker: blockerParts.length ? blockerParts.join(' | ') : null
  };

  const result = await evidenceFetch(endpoint, token, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  console.log(JSON.stringify({ ok: result.ok, taskId: task.id, target, result, screenshots: screenshots.map(({ dataUrl, ...receipt }) => receipt), lead }, null, 2));
  if (!result.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';

const DEFAULT_TARGET = 'https://nashvilleresinworx-strategic-minds-advisory.vercel.app';
const DEFAULT_WORKER = 'github_actions_playwright_nrw_worker';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env ${name}`);
  return value;
}

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function parseEmailFromPrompt(prompt = '') {
  const match = prompt.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? null;
}

function isNrwTask(task) {
  const target = task?.target ?? '';
  const prompt = task?.task_prompt ?? '';
  return target.includes('nashvilleresinworx') || prompt.includes('NRW') || prompt.includes('nrw_leads');
}

function makeQaEmail() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `nrw-gha-browser-qa-${stamp}@example.com`;
}

async function insertRow(supabase, table, row) {
  const { data, error } = await supabase.from(table).insert(row).select('*').single();
  if (error) throw new Error(`${table} insert failed: ${error.message}`);
  return data;
}

async function updateTaskState(supabase, taskId, state) {
  const { error } = await supabase.from('browser_tasks').update({ state }).eq('id', taskId);
  if (error) throw new Error(`browser_tasks update failed: ${error.message}`);
}

async function selectTask(supabase) {
  const explicitTaskId = process.env.NRW_BROWSER_TASK_ID || process.env.BROWSER_TASK_ID;
  if (explicitTaskId) {
    const { data, error } = await supabase.from('browser_tasks').select('*').eq('id', explicitTaskId).single();
    if (error) throw new Error(`Explicit browser task lookup failed: ${error.message}`);
    return data;
  }

  const states = (process.env.NRW_BROWSER_TASK_STATES || 'queued,claimed,blocked')
    .split(',')
    .map((state) => state.trim())
    .filter(Boolean);

  const { data, error } = await supabase
    .from('browser_tasks')
    .select('*')
    .eq('approved', true)
    .eq('safe', true)
    .in('state', states)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(`browser_tasks select failed: ${error.message}`);
  return (data ?? []).find(isNrwTask) ?? null;
}

async function claimTask(supabase, task, worker) {
  const claim = await insertRow(supabase, 'browser_claims', {
    task_ref: task.id,
    worker,
    claimed_at: new Date().toISOString()
  });
  await updateTaskState(supabase, task.id, 'claimed');
  return claim;
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

async function verifyLead(supabase, email) {
  const { data, error } = await supabase
    .from('nrw_leads')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw new Error(`nrw_leads verification failed: ${error.message}`);
  return { rowFound: Array.isArray(data) && data.length > 0, row: Array.isArray(data) ? data[0] ?? null : null };
}

async function main() {
  const worker = process.env.BROWSER_WORKER_NAME || DEFAULT_WORKER;
  const targetOverride = process.env.NRW_TARGET_URL || '';
  const supabase = getSupabaseClient();
  const startedAt = new Date().toISOString();

  await insertRow(supabase, 'worker_heartbeats', {
    worker_name: worker,
    surface: 'browser_tasks',
    status: 'running',
    last_seen_at: startedAt,
    created_at: startedAt
  }).catch((error) => console.warn(error.message));

  const task = await selectTask(supabase);
  if (!task) {
    console.log('No approved safe NRW browser task found.');
    await insertRow(supabase, 'worker_heartbeats', {
      worker_name: worker,
      surface: 'browser_tasks',
      status: 'idle',
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }).catch((error) => console.warn(error.message));
    return;
  }

  const target = targetOverride || task.target || DEFAULT_TARGET;
  const qaEmail = process.env.NRW_QA_EMAIL || parseEmailFromPrompt(task.task_prompt) || makeQaEmail();
  const claim = await claimTask(supabase, task, worker);
  const browser = await chromium.launch({ headless: true });
  const blockerParts = [];
  const screenshots = [];
  let lead = null;

  try {
    for (const viewport of [
      { name: 'desktop', width: 1440, height: 1200 },
      { name: 'mobile', width: 390, height: 844 }
    ]) {
      const receipt = await captureViewport(browser, target, viewport);
      screenshots.push(receipt);
      await insertRow(supabase, 'browser_screenshots', {
        task_ref: task.id,
        screenshot_ref: JSON.stringify({
          name: receipt.name,
          width: receipt.width,
          height: receipt.height,
          statusCode: receipt.statusCode,
          title: receipt.title,
          consoleErrors: receipt.consoleErrors,
          pageErrors: receipt.pageErrors,
          screenshotBytes: receipt.screenshotBytes,
          dataUrl: receipt.dataUrl
        }),
        created_at: new Date().toISOString()
      });

      if (receipt.statusCode && receipt.statusCode >= 400) blockerParts.push(`${receipt.name} returned HTTP ${receipt.statusCode}`);
      if (receipt.consoleErrors.length) blockerParts.push(`${receipt.name} console errors: ${receipt.consoleErrors.slice(0, 3).join(' | ')}`);
      if (receipt.pageErrors.length) blockerParts.push(`${receipt.name} page errors: ${receipt.pageErrors.slice(0, 3).join(' | ')}`);
    }

    lead = await submitLeadWithBrowser(browser, target, qaEmail);
    const leadVerification = await verifyLead(supabase, qaEmail);
    lead = { ...lead, ...leadVerification };
    if (!leadVerification.rowFound) blockerParts.push(`Lead row missing for ${qaEmail}`);
  } catch (error) {
    blockerParts.push(error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }

  const blocker = blockerParts.length ? blockerParts.join(' | ') : null;
  const status = blocker ? 'blocked' : 'success';
  const completedAt = new Date().toISOString();

  await insertRow(supabase, 'browser_evidence', {
    task_ref: task.id,
    claim_ref: claim.id,
    status,
    evidence: JSON.stringify({
      worker,
      taskId: task.id,
      target,
      startedAt,
      completedAt,
      screenshots: screenshots.map(({ dataUrl, ...receipt }) => receipt),
      lead
    }),
    source_url: target,
    created_at: completedAt
  });

  if (blocker) {
    await insertRow(supabase, 'browser_blockers', {
      task_ref: task.id,
      blocker,
      severity: 'high',
      state: 'open',
      created_at: completedAt
    });
  }

  await updateTaskState(supabase, task.id, blocker ? 'blocked' : 'completed');
  await insertRow(supabase, 'worker_heartbeats', {
    worker_name: worker,
    surface: 'browser_tasks',
    status,
    last_seen_at: completedAt,
    created_at: completedAt
  }).catch((error) => console.warn(error.message));

  console.log(JSON.stringify({ ok: !blocker, taskId: task.id, target, status, screenshots: screenshots.map(({ dataUrl, ...receipt }) => receipt), lead, blocker }, null, 2));

  if (blocker) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

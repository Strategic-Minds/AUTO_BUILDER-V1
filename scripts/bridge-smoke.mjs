import fs from 'node:fs/promises';

const base = (process.env.AUTO_BUILDER_URL || 'http://localhost:3000').replace(/\/$/, '');
const outDir = 'bridge-smoke-artifacts';
await fs.mkdir(outDir, { recursive: true });

async function request(name, path, init = {}) {
  const res = await fetch(`${base}${path}`, init);
  const text = await res.text();
  await fs.writeFile(`${outDir}/${name}.json`, text);
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { name, status: res.status, ok: res.ok, json, text };
}

const checks = [];
checks.push(await request('heartbeat-policy-get', '/api/bridge/policy-check'));
checks.push(await request('policy-post-read', '/api/bridge/policy-check', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ riskClass: 0, mutation: false, system: 'bridge', action: 'read', approvalState: 'not_required' })
}));
checks.push(await request('policy-post-protected', '/api/bridge/policy-check', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ riskClass: 4, mutation: true, system: 'supabase', action: 'production_migration', approvalState: 'pending' })
}));
checks.push(await request('connections-public', '/api/bridge/connections'));
checks.push(await request('workflow-status', '/api/workflows/status'));
checks.push(await request('sandbox-status', '/api/sandbox/status'));
checks.push(await request('agents-status', '/api/agents/status'));
checks.push(await request('social-status', '/api/social/status'));

const failures = checks.filter((check) => ![200, 401, 423].includes(check.status));
const protectedCheck = checks.find((check) => check.name === 'policy-post-protected');
if (!protectedCheck?.json?.decision?.approvalRequired) {
  failures.push({ name: 'policy-post-protected-approval-required', status: 500, ok: false });
}

const summary = {
  ok: failures.length === 0,
  base,
  checkedAt: new Date().toISOString(),
  checks: checks.map(({ name, status, ok, json }) => ({ name, status, ok, jsonOk: Boolean(json) })),
  failures
};
await fs.writeFile(`${outDir}/summary.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (!summary.ok) process.exit(1);

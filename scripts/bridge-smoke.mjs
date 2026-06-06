#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const autoBuilderUrl = process.env.AUTO_BUILDER_URL || process.argv[2];
const v0Url = process.env.V0_BRIDGE_URL || process.argv[3];
const outDir = resolve(process.env.BRIDGE_SMOKE_DIR || "bridge-smoke-artifacts");

if (!autoBuilderUrl) throw new Error("AUTO_BUILDER_URL is required");
await mkdir(outDir, { recursive: true });

async function getJson(path) {
  const res = await fetch(`${autoBuilderUrl}${path}`);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { path, status: res.status, ok: res.ok, json, text: json ? undefined : text.slice(0, 500) };
}

async function postJson(path, body, token) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${autoBuilderUrl}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { path, status: res.status, ok: res.ok, json, text: json ? undefined : text.slice(0, 500) };
}

function gitStatus() {
  return new Promise((resolveStatus) => {
    execFile("git", ["status", "--short", "--branch"], { timeout: 30000 }, (error, stdout, stderr) => {
      resolveStatus({ status: error ? "failed" : "completed", exitCode: error?.code ?? 0, stdout, stderr });
    });
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  autoBuilderUrl,
  v0Url: v0Url || null,
  checks: []
};

report.checks.push({ name: "heartbeat", result: await getJson("/api/bridge/registry") });
report.checks.push({ name: "secret_names_only", result: await getJson("/api/bridge/env-names") });
report.checks.push({ name: "smoke_get", result: await getJson("/api/bridge/smoke") });
report.checks.push({ name: "smoke_post", result: await postJson("/api/bridge/smoke", { approvalState: "not_required", harmless: true }) });
report.checks.push({ name: "policy_read_allowed", result: await postJson("/api/bridge/policy-check", { riskClass: 0, mutation: false, system: "vercel" }) });
report.checks.push({ name: "policy_prod_blocked", result: await postJson("/api/bridge/policy-check", { riskClass: 4, mutation: true, system: "stripe" }) });
report.checks.push({ name: "supabase_admin_names", result: await getJson("/api/bridge/supabase-admin") });
report.checks.push({ name: "supabase_admin_unauth_block", result: await postJson("/api/bridge/supabase-admin", { action: "select", table: "bridge_receipts", limit: 1 }) });
report.checks.push({ name: "git_status", result: await gitStatus() });

await writeFile(`${outDir}/bridge-smoke-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

const hardFailures = report.checks.filter((check) => {
  if (check.name === "policy_prod_blocked") return check.result.status !== 403;
  if (check.name === "supabase_admin_unauth_block") return check.result.status !== 401;
  return check.result.ok === false && check.result.status >= 500;
});

if (hardFailures.length) {
  console.error(`Hard failures: ${hardFailures.map((failure) => failure.name).join(", ")}`);
  process.exit(1);
}

#!/usr/bin/env node
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { randomUUID, createHash } from "node:crypto";
import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import { dirname, resolve, relative } from "node:path";

const PORT = Number(process.env.AWOS_RELAY_PORT || 8795);
const ROOT = resolve(process.env.AWOS_RELAY_ROOT || process.cwd());
const TOKEN = process.env.AWOS_RELAY_TOKEN || "";
const RECEIPT_PATH = resolve(ROOT, ".local-bridge-audit", "receipts.jsonl");

const READ_COMMANDS = new Map([
  ["git:status", ["git", ["status", "--short", "--branch"]]],
  ["git:diff:stat", ["git", ["diff", "--stat"]]],
  ["git:diff:name-only", ["git", ["diff", "--name-only"]]],
  ["npm:lint", ["npm", ["run", "lint"]]],
  ["npm:build", ["npm", ["run", "build"]]],
  ["npm:test", ["npm", ["test"]]],
  ["node:validate-env", ["node", ["scripts/validate-env.mjs"]]],
  ["node:smoke-local", ["node", ["scripts/smoke-local.mjs"]]]
]);

const BLOCKED_PATTERNS = [/git\s+reset\s+--hard/i, /git\s+checkout\s+--/i, /rm\s+-rf/i, /npm\s+publish/i, /vercel\s+deploy\s+--prod/i, /supabase\s+db\s+(push|reset|remote|migrate)/i, /(stripe|shopify|slack|social).*(create|update|delete|send|publish)/i];

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body, null, 2));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function assertAuth(req) {
  if (!TOKEN) return;
  if ((req.headers.authorization || "") !== `Bearer ${TOKEN}`) {
    throw Object.assign(new Error("unauthorized"), { status: 401 });
  }
}

function insideRoot(path) {
  const abs = resolve(ROOT, path || ".");
  const rel = relative(ROOT, abs);
  if (rel.startsWith("..") || rel === "") throw Object.assign(new Error("path_outside_allowed_root"), { status: 403 });
  return abs;
}

function hash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function record(operation, body, result, riskClass = 0, mutation = false) {
  const receipt = {
    receipt_id: randomUUID(), generated_at: new Date().toISOString(), actor: "awos-local-device-relay", bridge_id: "local_device_relay", operation,
    risk_class: riskClass, mutation, approval_state: riskClass <= 1 ? "not_required" : body.approval_id ? "approved" : "pending",
    target: body.target || { system: "local_device" }, inputs_hash: hash(body), result, rollback_ref: body.rollback_ref || null,
    next_action: result.status === "blocked" ? "request_approval_or_adjust_policy" : "continue"
  };
  await mkdir(dirname(RECEIPT_PATH), { recursive: true });
  await appendFile(RECEIPT_PATH, `${JSON.stringify(receipt)}\n`);
  return receipt;
}

function run(commandKey) {
  const command = READ_COMMANDS.get(commandKey);
  if (!command) throw Object.assign(new Error("command_not_allowlisted"), { status: 403 });
  return new Promise((resolveRun) => {
    const [bin, args] = command;
    execFile(bin, args, { cwd: ROOT, timeout: 120000 }, (error, stdout, stderr) => resolveRun({ status: error ? "failed" : "completed", exit_code: error?.code ?? 0, stdout, stderr }));
  });
}

async function route(req, res) {
  assertAuth(req);
  const body = await parseBody(req);
  if (req.method === "POST" && req.url === "/snapshot") return json(res, 200, await record("snapshot", body, { status: "completed", root: ROOT, port: PORT, relay_version: "2026-06-06", git: await run("git:status") }));
  if (req.method === "POST" && req.url === "/git/status") return json(res, 200, await record("git_status", body, await run("git:status")));
  if (req.method === "POST" && req.url === "/git/diff") return json(res, 200, await record("git_diff", body, await run(body.nameOnly ? "git:diff:name-only" : "git:diff:stat")));
  if (req.method === "POST" && req.url === "/files/read") {
    const path = insideRoot(body.path);
    return json(res, 200, await record("file_read", body, { status: "completed", path: relative(ROOT, path), content: await readFile(path, "utf8") }));
  }
  if (req.method === "POST" && req.url === "/files/write") {
    if (!body.approval_id) return json(res, 403, await record("file_write", body, { status: "blocked", summary: "approval_required" }, 2, true));
    const path = insideRoot(body.path);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, String(body.content || ""), "utf8");
    return json(res, 200, await record("file_write", body, { status: "completed", path: relative(ROOT, path) }, 2, true));
  }
  if (req.method === "POST" && req.url === "/verify") return json(res, 200, await record("verify", body, await run(body.commandKey || body.command), 1, false));
  if (req.method === "POST" && req.url === "/execute-approved") {
    const command = String(body.command || "");
    if (!body.approval_id || BLOCKED_PATTERNS.some((pattern) => pattern.test(command))) return json(res, 403, await record("execute_approved", body, { status: "blocked", summary: "approval_required_or_policy_denied" }, 2, true));
    return json(res, 403, await record("execute_approved", body, { status: "blocked", summary: "generic_shell_execution_not_enabled_in_scaffold" }, 2, true));
  }
  if (req.method === "GET" && req.url === "/receipts") {
    let content = "";
    try { content = await readFile(RECEIPT_PATH, "utf8"); } catch {}
    return json(res, 200, { receipts: content.split("\n").filter(Boolean).map((line) => JSON.parse(line)) });
  }
  return json(res, 404, { error: "not_found" });
}

createServer((req, res) => route(req, res).catch((error) => json(res, error.status || 500, { error: error.message }))).listen(PORT, "127.0.0.1", () => {
  console.log(`AWOS local device relay listening on http://127.0.0.1:${PORT}`);
  console.log(`Allowed root: ${ROOT}`);
});

/**
 * MCP Gateway Router v2.0.1
 * Unified entry point for all MCP tool execution.
 * Routes to correct provider, logs every action, writes receipts.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SB_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export type ExecutionMode =
  | "OBSERVE_ONLY"
  | "DRAFT_ONLY"
  | "APPROVAL_REQUIRED"
  | "FULL_AUTONOMOUS"
  | "SUPERADMIN_EXECUTE";

export interface ToolRunRequest {
  tool_id: string;
  namespace_id?: string;
  execution_mode?: ExecutionMode;
  caller_agent?: string;
  caller_type?: string;
  input: Record<string, unknown>;
}

export interface ToolRunResult {
  run_id: string;
  receipt_id: string;
  rollback_id?: string;
  status: "success" | "queued_for_approval" | "blocked" | "failed";
  output?: unknown;
  error?: string;
  production_mutated: boolean;
}

function db(): SupabaseClient {
  return createClient(SB_URL, SB_KEY);
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function routeTool(req: ToolRunRequest): Promise<ToolRunResult> {
  const sb = db();
  const runId = genId("run");
  const receiptId = genId("rcpt");
  // Use string assignment to prevent TS narrowing complaints on mode comparisons
  const mode: string = req.execution_mode ?? "APPROVAL_REQUIRED";

  await sb.from("mcp_tool_runs").insert({
    run_id: runId,
    tool_id: req.tool_id,
    namespace_id: req.namespace_id,
    caller_agent: req.caller_agent ?? "unknown",
    caller_type: req.caller_type ?? "api",
    execution_mode: mode,
    input_payload: req.input,
    status: "running",
    started_at: new Date().toISOString(),
  });

  if (mode === "OBSERVE_ONLY") {
    return buildResult(runId, receiptId, "blocked", false, undefined, "OBSERVE_ONLY mode — no execution");
  }
  if (mode === "DRAFT_ONLY") {
    return buildResult(runId, receiptId, "queued_for_approval", false, undefined, "DRAFT_ONLY — draft created");
  }
  if (mode === "APPROVAL_REQUIRED") {
    await sb.from("mcp_tool_runs").update({ status: "queued_for_approval" }).eq("run_id", runId);
    return buildResult(runId, receiptId, "queued_for_approval", false, undefined, "Pending approval");
  }

  // FULL_AUTONOMOUS and SUPERADMIN_EXECUTE — route to provider
  try {
    const ns = req.namespace_id ?? req.tool_id.split(".").slice(0, 2).join(".");
    const output = await dispatchToProvider(ns, req.tool_id, req.input, mode);

    await sb.from("mcp_audit_log").insert({
      audit_id: genId("audit"),
      event_type: "tool_run",
      tool_id: req.tool_id,
      namespace_id: req.namespace_id,
      caller_agent: req.caller_agent,
      caller_type: req.caller_type,
      execution_mode: mode,
      action_taken: req.tool_id,
      input_summary: JSON.stringify(req.input).slice(0, 200),
      output_summary: JSON.stringify(output).slice(0, 200),
      risk_level: mode === "SUPERADMIN_EXECUTE" ? "high" : "medium",
      created_at: new Date().toISOString(),
    });

    const rollbackId = genId("rollback");
    await sb.from("mcp_receipts").insert({
      receipt_id: receiptId,
      tool_run_id: runId,
      tool_id: req.tool_id,
      action: req.tool_id,
      caller_agent: req.caller_agent,
      status: "success",
      execution_mode: mode,
      payload: { input: req.input, output },
      production_mutated: mode !== "DRAFT_ONLY",
      created_at: new Date().toISOString(),
    });

    await sb.from("mcp_rollback_packets").insert({
      rollback_id: rollbackId,
      tool_run_id: runId,
      tool_id: req.tool_id,
      rollback_type: "auto",
      state_before: req.input,
      state_after: (output as Record<string, unknown>) ?? {},
      created_at: new Date().toISOString(),
    });

    await sb.from("mcp_tool_runs")
      .update({
        status: "success",
        output_payload: (output as Record<string, unknown>) ?? {},
        receipt_id: receiptId,
        completed_at: new Date().toISOString(),
      })
      .eq("run_id", runId);

    return buildResult(runId, receiptId, "success", true, output, undefined, rollbackId);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await sb.from("mcp_tool_runs")
      .update({ status: "failed", error_message: errMsg, completed_at: new Date().toISOString() })
      .eq("run_id", runId);
    await sb.from("mcp_deadletters").insert({
      dead_id: genId("dead"),
      tool_run_id: runId,
      tool_id: req.tool_id,
      error_message: errMsg,
      input_payload: req.input,
      attempt_count: 1,
      max_attempts: 5,
      next_retry: new Date(Date.now() + 60000).toISOString(),
    });
    return buildResult(runId, receiptId, "failed", false, undefined, errMsg);
  }
}

async function dispatchToProvider(
  namespace: string,
  toolId: string,
  input: Record<string, unknown>,
  mode: string
): Promise<unknown> {
  const parts = toolId.split(".");
  const capability = parts.slice(2).join(".");

  const DISPATCH_MAP: Record<string, (i: Record<string, unknown>) => Promise<unknown>> = {
    "ops.github":   (i) => callGitHub(capability, i),
    "ops.vercel":   (i) => callVercel(capability, i),
    "ops.supabase": (i) => callSupabase(capability, i),
    "ops.drive":    (i) => callDrive(capability, i),
    "ops.gmail":    (i) => callGmail(capability, i),
    "ops.sheets":   (i) => callSheets(capability, i),
    "ops.openai":   (i) => callOpenAI(capability, i),
    "ops.twilio":   (i) => callTwilio(capability, i),
    "ops.whatsapp": (i) => callWhatsApp(capability, i),
    "ops.n8n":      (i) => callN8N(capability, i),
    "ops.browser":  (i) => callBrowser(capability, i),
    "xps.project":  (i) => callXpsProject(capability, i),
    "xps.queue":    (i) => callXpsQueue(capability, i),
    "xps.qa":       (i) => callXpsQA(capability, i),
    "xps.auto_fix": (i) => callXpsAutoFix(capability, i),
  };

  const handler = DISPATCH_MAP[namespace];
  if (handler) return handler(input);
  return { note: `Provider ${namespace} registered. Configure credentials to activate.`, mode };
}

async function callGitHub(cap: string, input: Record<string, unknown>) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { blocked: true, reason: "GITHUB_TOKEN not configured" };
  const base = "https://api.github.com";
  const h = { Authorization: `token ${token}`, Accept: "application/vnd.github+json" };
  if (cap === "create_file" || cap === "update_file") {
    const { repo, path, content, message, sha } = input as Record<string, string>;
    const body: Record<string, unknown> = { message, content: btoa(content), branch: "main" };
    if (sha) body.sha = sha;
    const r = await fetch(`${base}/repos/${repo}/contents/${path}`, {
      method: "PUT", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    return r.ok ? r.json() : { error: await r.text() };
  }
  if (cap === "get_file") {
    const { repo, path } = input as Record<string, string>;
    const r = await fetch(`${base}/repos/${repo}/contents/${path}?ref=main`, { headers: h });
    return r.ok ? r.json() : { error: await r.text() };
  }
  if (cap === "list_repos") {
    const r = await fetch(`${base}/user/repos?per_page=50`, { headers: h });
    return r.ok ? r.json() : { error: await r.text() };
  }
  if (cap === "create_branch") {
    const { repo, branch, from_sha } = input as Record<string, string>;
    const r = await fetch(`${base}/repos/${repo}/git/refs`, {
      method: "POST", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: from_sha }),
    });
    return r.ok ? r.json() : { error: await r.text() };
  }
  if (cap === "create_pr") {
    const { repo, title, head, base: prBase, body } = input as Record<string, string>;
    const r = await fetch(`${base}/repos/${repo}/pulls`, {
      method: "POST", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ title, head, base: prBase, body }),
    });
    return r.ok ? r.json() : { error: await r.text() };
  }
  return { note: `GitHub.${cap} available`, configured: true };
}

async function callVercel(cap: string, input: Record<string, unknown>) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { blocked: true, reason: "VERCEL_TOKEN not configured" };
  const base = "https://api.vercel.com";
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  if (cap === "list_projects") {
    const r = await fetch(`${base}/v9/projects?limit=20`, { headers: h });
    return r.ok ? r.json() : { error: await r.text() };
  }
  if (cap === "set_env_var") {
    const { projectId, key, value } = input as Record<string, string>;
    const r = await fetch(`${base}/v10/projects/${projectId}/env?upsert=true`, {
      method: "POST", headers: h,
      body: JSON.stringify({ key, value, target: ["production", "preview"], type: "plain" }),
    });
    return r.ok ? r.json() : { error: await r.text() };
  }
  if (cap === "get_deployment_logs") {
    const { deploymentId } = input as Record<string, string>;
    const r = await fetch(`${base}/v2/deployments/${deploymentId}/events?limit=50`, { headers: h });
    return r.ok ? r.json() : { error: await r.text() };
  }
  return { note: `Vercel.${cap} available`, configured: true };
}

async function callSupabase(cap: string, input: Record<string, unknown>) {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!key) return { blocked: true, reason: "SUPABASE_SERVICE_ROLE_KEY not configured" };
  const h = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  if (cap === "run_sql") {
    const token = process.env.SUPABASE_MANAGEMENT_TOKEN ?? "";
    const r = await fetch(
      "https://api.supabase.com/v1/projects/prhppuuwcnmfdhwsagug/database/query",
      { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: input.sql }) }
    );
    return r.ok ? r.json() : { error: await r.text() };
  }
  if (cap === "select") {
    const { table, filter, limit } = input as { table: string; filter?: string; limit?: number };
    const q = filter ? `?${filter}&limit=${limit ?? 50}` : `?limit=${limit ?? 50}`;
    const r = await fetch(`${url}/rest/v1/${table}${q}`, { headers: h });
    return r.ok ? r.json() : { error: await r.text() };
  }
  if (cap === "insert") {
    const { table, data } = input as { table: string; data: Record<string, unknown> };
    const r = await fetch(`${url}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...h, Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify(data),
    });
    return r.ok ? r.json() : { error: await r.text() };
  }
  return { note: `Supabase.${cap} available`, configured: true };
}

async function callDrive(cap: string, input: Record<string, unknown>) {
  const token = process.env.GOOGLEDRIVE_ACCESS_TOKEN ?? process.env.GOOGLE_ACCESS_TOKEN ?? "";
  if (!token) return { blocked: true, reason: "Google OAuth token not configured" };
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  if (cap === "create_folder") {
    const { name, parent_id } = input as Record<string, string>;
    const r = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST", headers: h,
      body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parent_id] }),
    });
    return r.ok ? r.json() : { error: await r.text() };
  }
  if (cap === "list_files") {
    const { parent_id, query } = input as { parent_id?: string; query?: string };
    const q = query ?? (parent_id ? `'${parent_id}' in parents and trashed=false` : "trashed=false");
    const r = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,webViewLink)`,
      { headers: h }
    );
    return r.ok ? r.json() : { error: await r.text() };
  }
  return { note: `Drive.${cap} available`, configured: true };
}

async function callGmail(cap: string, _input: Record<string, unknown>) {
  const token = process.env.GMAIL_ACCESS_TOKEN ?? process.env.GOOGLE_ACCESS_TOKEN ?? "";
  if (!token) return { blocked: true, reason: "Gmail OAuth token not configured" };
  return { note: `Gmail.${cap} available — token present`, configured: true };
}

async function callSheets(cap: string, input: Record<string, unknown>) {
  const token = process.env.GOOGLESHEETS_ACCESS_TOKEN ?? process.env.GOOGLE_ACCESS_TOKEN ?? "";
  if (!token) return { blocked: true, reason: "Sheets OAuth token not configured" };
  if (cap === "read_range") {
    const { spreadsheet_id, range } = input as Record<string, string>;
    const r = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return r.ok ? r.json() : { error: await r.text() };
  }
  if (cap === "append_rows") {
    const { spreadsheet_id, range, values } = input as { spreadsheet_id: string; range: string; values: unknown[][] };
    const r = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}:append?valueInputOption=USER_ENTERED`,
      { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ values }) }
    );
    return r.ok ? r.json() : { error: await r.text() };
  }
  return { note: `Sheets.${cap} available`, configured: true };
}

async function callOpenAI(cap: string, input: Record<string, unknown>) {
  // Try Groq first (no IP restrictions, 10x faster, OpenAI-compatible)
  const groqKey = process.env.GROQ_API_KEY ?? "";
  if (groqKey && (cap === "chat" || cap === "complete")) {
    const groqModel = (input.model as string)?.replace("gpt-4o", "llama-3.3-70b-versatile")
                                               .replace("gpt-4",  "llama-3.3-70b-versatile")
                                               .replace("gpt-3.5","llama3-8b-8192") ?? "llama-3.3-70b-versatile";
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: groqModel, messages: input.messages ?? [], temperature: (input.temperature as number) ?? 0.7, max_tokens: (input.max_tokens as number) ?? 2048 }),
      });
      if (r.ok) {
        const d = await r.json();
        return { ...d, _provider: "groq", _model: groqModel };
      }
    } catch { /* fall through to OpenAI */ }
  }

  // Fallback: OpenAI direct
  const key = process.env.OPENAI_API_KEY ?? "";
  if (!key) return { blocked: true, reason: "OPENAI_API_KEY not configured" };
  const h = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  if (cap === "chat" || cap === "complete") {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: h,
      body: JSON.stringify({ model: (input.model as string) ?? "gpt-4o-mini", messages: input.messages ?? [], temperature: (input.temperature as number) ?? 0.7 }),
    });
    return r.ok ? r.json() : { error: await r.text() };
  }
  if (cap === "generate_image") {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST", headers: h,
      body: JSON.stringify({ model: "dall-e-3", prompt: input.prompt, n: 1, size: (input.size as string) ?? "1024x1024" }),
    });
    return r.ok ? r.json() : { error: await r.text() };
  }
  return { note: `OpenAI.${cap} available`, configured: true };
}

async function callTwilio(cap: string, input: Record<string, unknown>) {
  const sid  = process.env.TWILIO_ACCOUNT_SID ?? "";
  const auth = process.env.TWILIO_API_SECRET  ?? process.env.TWILIO_AUTH_TOKEN ?? "";
  if (!sid || !auth) return { blocked: true, reason: "Twilio credentials not configured" };
  if (cap === "send_sms") {
    const { to, body, from: fromNum } = input as Record<string, string>;
    const f = fromNum ?? process.env.TWILIO_SMS_FROM ?? "+15616780328";
    const params = new URLSearchParams({ To: to, From: f, Body: body });
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${btoa(sid + ":" + auth)}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    return r.ok ? r.json() : { error: await r.text() };
  }
  return { note: `Twilio.${cap} available`, configured: true };
}

async function callWhatsApp(cap: string, input: Record<string, unknown>) {
  return callTwilio(cap, input);
}

async function callN8N(cap: string, _input: Record<string, unknown>) {
  const key  = process.env.N8N_API_KEY  ?? "";
  const base = process.env.N8N_BASE_URL ?? "";
  if (!key || !base) return { blocked: true, reason: "N8N_API_KEY or N8N_BASE_URL not configured" };
  return { note: `n8n.${cap} available — configure N8N_BASE_URL`, configured: false };
}

async function callBrowser(cap: string, input: Record<string, unknown>) {
  const token = process.env.BROWSERBASE_API_KEY ?? "";
  if (!token) return { blocked: true, reason: "BROWSERBASE_API_KEY not configured — headless browser unavailable" };
  return { note: `Browser.${cap} available`, input };
}

async function callXpsProject(cap: string, input: Record<string, unknown>) {
  const sb = db();
  if (cap === "create") {
    const { client_slug, client_name, industry } = input as Record<string, string>;
    const project_id = `XPS-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await sb
      .from("factory_projects")
      .insert({ project_id, client_slug, client_name, industry, status: "NEW", created_at: new Date().toISOString() })
      .select()
      .single();
    return error ? { error: error.message } : data;
  }
  if (cap === "get_status") {
    const { project_id } = input as { project_id: string };
    const { data } = await sb.from("factory_projects").select("*").eq("project_id", project_id).single();
    return data ?? { error: "not found" };
  }
  return { note: `xps.project.${cap} routed` };
}

async function callXpsQueue(cap: string, input: Record<string, unknown>) {
  const sb = db();
  if (cap === "add") {
    const { project_id, client_slug, stage } = input as Record<string, string>;
    const { data } = await sb
      .from("factory_project_queue")
      .insert({ queue_id: `q_${Date.now()}`, project_id, status: "QUEUED", stage, payload: input, created_at: new Date().toISOString() })
      .select()
      .single();
    return data;
  }
  return { note: `xps.queue.${cap} routed` };
}

async function callXpsQA(cap: string, input: Record<string, unknown>) {
  const sb = db();
  if (cap === "run_score") {
    const { project_id, url } = input as { project_id: string; url: string };
    const score_id = `qa_${Date.now()}`;
    const { data } = await sb
      .from("factory_quality_scores")
      .insert({ score_id, project_id, score_type: "site_health", score: 0, grade: "PENDING", checked_at: new Date().toISOString(), details: { url, status: "scan_queued" } })
      .select()
      .single();
    return data;
  }
  return { note: `xps.qa.${cap} routed` };
}

async function callXpsAutoFix(cap: string, input: Record<string, unknown>) {
  return { note: `xps.auto_fix.${cap} queued for execution`, input };
}

function buildResult(
  runId: string, receiptId: string, status: ToolRunResult["status"],
  mutated: boolean, output?: unknown, error?: string, rollbackId?: string
): ToolRunResult {
  return { run_id: runId, receipt_id: receiptId, rollback_id: rollbackId, status, output, error, production_mutated: mutated };
}

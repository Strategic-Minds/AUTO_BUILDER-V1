import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type BridgeAction = "select" | "insert" | "upsert" | "update" | "delete" | "rpc";

const defaultTableAllowlist = [
  "bridge_tasks",
  "bridge_receipts",
  "bridge_events",
  "bridge_connections",
  "browser_evidence",
  "browser_screenshots",
  "nrw_leads",
  "eden_bridge_queue",
  "eden_tool_receipts"
];

function names(value: string | undefined, fallback: string[]) {
  return (value || fallback.join(",")).split(",").map((item) => item.trim()).filter(Boolean);
}

function adminEnabled() {
  return process.env.AUTO_BUILDER_ADMIN_WRITE_ENABLED === "true";
}

function authorized(request: Request) {
  const token = process.env.AUTO_BUILDER_BRIDGE_TOKEN || process.env.ADMIN_API_TOKEN || process.env.BRIDGE_API_KEY;
  if (!token) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${token}`;
}

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function applyFilters(query: any, filters: Record<string, unknown> | undefined) {
  let next = query;
  for (const [key, value] of Object.entries(filters || {})) next = next.eq(key, value as any);
  return next;
}

export async function GET() {
  const tableAllowlist = names(process.env.SUPABASE_BRIDGE_TABLE_ALLOWLIST, defaultTableAllowlist);
  const rpcAllowlist = names(process.env.SUPABASE_BRIDGE_RPC_ALLOWLIST, []);

  return NextResponse.json({
    status: "ready",
    mutation: false,
    source: "supabase_admin_bridge_names_only",
    warning: "Service-role values are never exposed. Mutations require bearer auth, allowlist, approvalId, and AUTO_BUILDER_ADMIN_WRITE_ENABLED=true.",
    configured: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      AUTO_BUILDER_BRIDGE_TOKEN: Boolean(process.env.AUTO_BUILDER_BRIDGE_TOKEN || process.env.ADMIN_API_TOKEN || process.env.BRIDGE_API_KEY),
      AUTO_BUILDER_ADMIN_WRITE_ENABLED: adminEnabled()
    },
    tableAllowlist,
    rpcAllowlist,
    actions: ["select", "insert", "upsert", "update", "delete", "rpc"]
  }, { headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ status: "blocked", mutation: false, reason: "bridge_bearer_token_required" }, { status: 401 });

  const body = await request.json();
  const action = body.action as BridgeAction;
  const table = String(body.table || "");
  const tableAllowlist = names(process.env.SUPABASE_BRIDGE_TABLE_ALLOWLIST, defaultTableAllowlist);
  const rpcAllowlist = names(process.env.SUPABASE_BRIDGE_RPC_ALLOWLIST, []);
  const supabase = client();

  if (!supabase) return NextResponse.json({ status: "blocked", mutation: false, reason: "supabase_env_missing" }, { status: 500 });
  if (!["select", "insert", "upsert", "update", "delete", "rpc"].includes(action)) return NextResponse.json({ status: "blocked", mutation: false, reason: "unsupported_action" }, { status: 400 });

  const mutation = action !== "select";
  if (action === "rpc") {
    const fn = String(body.functionName || "");
    if (!rpcAllowlist.includes(fn)) return NextResponse.json({ status: "blocked", mutation: false, reason: "rpc_not_allowlisted", rpcAllowlist }, { status: 403 });
    if (!body.approvalId || !adminEnabled()) return NextResponse.json({ status: "blocked", mutation: true, reason: "approval_and_admin_write_required" }, { status: 403 });
    const { data, error } = await supabase.rpc(fn, body.args || {});
    return NextResponse.json({ status: error ? "failed" : "completed", mutation: true, action, functionName: fn, data, error: error?.message || null });
  }

  if (!tableAllowlist.includes(table)) return NextResponse.json({ status: "blocked", mutation, reason: "table_not_allowlisted", tableAllowlist }, { status: 403 });
  if (mutation && (!body.approvalId || !adminEnabled())) return NextResponse.json({ status: "blocked", mutation: true, reason: "approval_and_admin_write_required" }, { status: 403 });

  let query: any;
  if (action === "select") query = applyFilters(supabase.from(table).select(body.columns || "*"), body.filters).limit(Math.min(Number(body.limit || 50), 500));
  if (action === "insert") query = supabase.from(table).insert(body.payload).select();
  if (action === "upsert") query = supabase.from(table).upsert(body.payload, body.options || {}).select();
  if (action === "update") query = applyFilters(supabase.from(table).update(body.payload).select(), body.filters);
  if (action === "delete") query = applyFilters(supabase.from(table).delete().select(), body.filters);

  const { data, error } = await query;
  return NextResponse.json({ status: error ? "failed" : "completed", mutation, action, table, data, error: error?.message || null });
}

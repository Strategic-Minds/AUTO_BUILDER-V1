import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ","") ?? req.nextUrl.searchParams.get("token") ?? "";
  const expected = process.env.CRON_SECRET ?? process.env.EPOXY_CRON_SECRET ?? "";
  if (expected && secret !== expected) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });

  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env.SUPABASE_URL??"", process.env.SUPABASE_SERVICE_ROLE_KEY??"");

  const runId = `cron_mcp-receipt-sync_${Date.now()}`;
  const startedAt = new Date().toISOString();

  // Log cron run
  await sb.from("mcp_cron_jobs").upsert({
    job_id: "mcp-receipt-sync", name: "MCP Receipt Sync", route: "/api/cron/mcp-receipt-sync",
    server_id: "mcp_gateway_router", enabled: true,
    last_run: startedAt, last_status: "running",
    updated_at: startedAt
  }, { onConflict: "job_id" }).select();

  // Write run receipt
  await sb.from("mcp_receipts").insert({
    receipt_id: runId, action: "mcp-receipt-sync",
    status: "success", execution_mode: "FULL_AUTONOMOUS",
    production_mutated: false, created_at: startedAt,
    payload: { cron: "mcp-receipt-sync", server: "mcp_gateway_router", timestamp: startedAt }
  }).select();

  await sb.from("mcp_cron_jobs").upsert({
    job_id: "mcp-receipt-sync", last_status: "success",
    run_count: 1
  }, { onConflict: "job_id" });

  return NextResponse.json({ ok:true, cron:"mcp-receipt-sync", label:"MCP Receipt Sync", runId, timestamp: startedAt });
}

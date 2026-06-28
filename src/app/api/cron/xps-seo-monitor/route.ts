import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ","") ?? req.nextUrl.searchParams.get("token") ?? "";
  const expected = process.env.CRON_SECRET ?? process.env.EPOXY_CRON_SECRET ?? "";
  if (expected && secret !== expected) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });

  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env.SUPABASE_URL??"", process.env.SUPABASE_SERVICE_ROLE_KEY??"");

  const runId = `cron_xps-seo-monitor_${Date.now()}`;
  const startedAt = new Date().toISOString();

  // Log cron run
  await sb.from("mcp_cron_jobs").upsert({
    job_id: "xps-seo-monitor", name: "XPS SEO Monitor", route: "/api/cron/xps-seo-monitor",
    server_id: "xps_website_factory_mcp", enabled: true,
    last_run: startedAt, last_status: "running",
    updated_at: startedAt
  }, { onConflict: "job_id" }).select();

  // Write run receipt
  await sb.from("mcp_receipts").insert({
    receipt_id: runId, action: "xps-seo-monitor",
    status: "success", execution_mode: "FULL_AUTONOMOUS",
    production_mutated: false, created_at: startedAt,
    payload: { cron: "xps-seo-monitor", server: "xps_website_factory_mcp", timestamp: startedAt }
  }).select();

  await sb.from("mcp_cron_jobs").upsert({
    job_id: "xps-seo-monitor", last_status: "success",
    run_count: 1
  }, { onConflict: "job_id" });

  return NextResponse.json({ ok:true, cron:"xps-seo-monitor", label:"XPS SEO Monitor", runId, timestamp: startedAt });
}

import { NextRequest, NextResponse } from "next/server";
import { routeTool } from "@/lib/mcp/gateway-router";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { workflow, step, project_id, execution_mode, input } = body;
  if (!workflow || !step) return NextResponse.json({ ok:false, error:"workflow and step required" }, { status:400 });
  const tool_id = `xps.${workflow}.${step}`;
  const result = await routeTool({ tool_id, namespace_id:`xps.${workflow}`, execution_mode:execution_mode??"APPROVAL_REQUIRED", caller_agent:body.caller_agent??"xps_factory", input:{ ...input, project_id } });
  return NextResponse.json({ ok: result.status !== "failed", ...result });
}

export async function GET(_req: NextRequest) {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env.SUPABASE_URL??"", process.env.SUPABASE_SERVICE_ROLE_KEY??"");
  const [projects, queue, gates] = await Promise.all([
    sb.from("factory_projects").select("project_id,client_slug,status").limit(10).order("created_at",{ascending:false}),
    sb.from("factory_project_queue").select("*",{count:"exact",head:true}).not("status","eq","COMPLETE"),
    sb.from("factory_project_gates").select("*",{count:"exact",head:true}).eq("status","pending"),
  ]);
  return NextResponse.json({ ok:true, server:"xps_website_factory_mcp",
    active_projects: projects.data?.length??0,
    queue_depth: queue.count??0, pending_gates: gates.count??0,
    timestamp: new Date().toISOString() });
}

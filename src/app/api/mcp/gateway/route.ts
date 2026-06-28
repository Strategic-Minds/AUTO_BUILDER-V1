import { NextRequest, NextResponse } from "next/server";
import { routeTool } from "@/lib/mcp/gateway-router";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.tool_id) return NextResponse.json({ ok:false, error:"tool_id required" }, { status:400 });
  const result = await routeTool(body);
  return NextResponse.json({ ok: result.status !== "failed", ...result });
}

export async function GET(req: NextRequest) {
  const SB_URL = process.env.SUPABASE_URL ?? "";
  const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(SB_URL, SB_KEY);

  const [servers, namespaces, tools, providers] = await Promise.all([
    sb.from("mcp_servers").select("server_id,name,role,status,execution_mode"),
    sb.from("mcp_namespaces").select("namespace_id,server_id,category,enabled"),
    sb.from("mcp_tools").select("tool_id,namespace_id,name,enabled,execution_mode").limit(100),
    sb.from("mcp_provider_registry").select("provider_id,name,status"),
  ]);

  return NextResponse.json({
    ok: true, system: "Strategic Minds Enterprise MCP",
    version: "2.0.0",
    servers: servers.data?.length ?? 0,
    namespaces: namespaces.data?.length ?? 0,
    tools: tools.data?.length ?? 0,
    providers: providers.data?.length ?? 0,
    execution_modes: ["OBSERVE_ONLY","DRAFT_ONLY","APPROVAL_REQUIRED","FULL_AUTONOMOUS","SUPERADMIN_EXECUTE"],
    timestamp: new Date().toISOString(),
  });
}

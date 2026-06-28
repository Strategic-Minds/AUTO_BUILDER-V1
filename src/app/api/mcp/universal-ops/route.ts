import { NextRequest, NextResponse } from "next/server";
import { routeTool } from "@/lib/mcp/gateway-router";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { namespace, capability, execution_mode, caller_agent, input } = body;
  if (!namespace || !capability) return NextResponse.json({ ok:false, error:"namespace and capability required" }, { status:400 });
  const tool_id = `${namespace}.${capability}`;
  const result = await routeTool({ tool_id, namespace_id:namespace, execution_mode, caller_agent, input:input??{} });
  return NextResponse.json({ ok: result.status !== "failed", ...result });
}

export async function GET(req: NextRequest) {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env.SUPABASE_URL??"", process.env.SUPABASE_SERVICE_ROLE_KEY??"");
  const [ns, creds, providers] = await Promise.all([
    sb.from("mcp_namespaces").select("*").eq("server_id","strategic_minds_universal_ops_mcp"),
    sb.from("mcp_credentials_registry").select("credential_id,provider,env_var_name,status"),
    sb.from("mcp_provider_registry").select("provider_id,name,type,status"),
  ]);
  return NextResponse.json({ ok:true, server:"strategic_minds_universal_ops_mcp",
    namespaces: ns.data, credentials: creds.data, providers: providers.data,
    timestamp: new Date().toISOString() });
}

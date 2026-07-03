import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedExecution } from "@/lib/autobuilder-v2/execution-route-auth";
import { isDryRun } from "@/packages/clients/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authorization = requireAuthorizedExecution(req, { mode: "execute", tool_id: "mcp_webhook", namespace: "mcp" });
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.message, authorization }, { status: authorization.status });
  }

  const source = req.nextUrl.searchParams.get("source") ?? "unknown";
  const event_type = req.nextUrl.searchParams.get("event_type") ?? "webhook";
  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const event_id = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (isDryRun()) {
    return NextResponse.json({
      ok: true,
      event_id,
      queued: false,
      dry_run: true,
      production_mutation: false,
      planned_event: { source, event_type, payload, processed: false },
      authorization,
      timestamp: new Date().toISOString(),
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, error: "Supabase env vars are required for live webhook queue writes" }, { status: 503 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(supabaseUrl, supabaseKey);
  const { error } = await sb.from("mcp_webhook_events").insert({
    event_id,
    source,
    event_type,
    payload,
    processed: false,
    received_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message, event_id, authorization }, { status: 500 });
  }

  return NextResponse.json({ ok: true, event_id, queued: true, production_mutation: false, authorization, timestamp: new Date().toISOString() });
}

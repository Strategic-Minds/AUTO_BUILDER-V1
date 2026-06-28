import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env.SUPABASE_URL??"", process.env.SUPABASE_SERVICE_ROLE_KEY??"");
  const source = req.nextUrl.searchParams.get("source") ?? "unknown";
  const event_type = req.nextUrl.searchParams.get("event_type") ?? "webhook";
  let payload: Record<string, unknown> = {};
  try { payload = await req.json(); } catch {}

  const event_id = `wh_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  await sb.from("mcp_webhook_events").insert({
    event_id, source, event_type, payload, processed: false,
    received_at: new Date().toISOString()
  });

  return NextResponse.json({ ok: true, event_id, queued: true, timestamp: new Date().toISOString() });
}

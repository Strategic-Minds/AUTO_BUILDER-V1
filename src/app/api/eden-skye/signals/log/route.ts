import { NextResponse } from "next/server";
import { asNumber, asOptionalString, getEdenAdminClient, mutationGate, parseJsonBody } from "@/lib/eden-skye/review-data";

export async function POST(request: Request) {
  const gate = mutationGate(request);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, status: "blocked", blocker: gate.message }, { status: gate.status });
  }

  const body = await parseJsonBody(request);
  const platform = asOptionalString(body.platform);
  const contentQueueId = asOptionalString(body.content_queue_id);

  if (!platform) {
    return NextResponse.json({ ok: false, status: "blocked", blocker: "platform is required." }, { status: 400 });
  }

  const client = getEdenAdminClient();
  if (!client) {
    return NextResponse.json({ ok: false, status: "blocked", blocker: "Sandbox Supabase admin client is unavailable." }, { status: 503 });
  }

  const metadata = typeof body.metadata_json === "object" && body.metadata_json !== null ? body.metadata_json : {};
  const { data, error } = await client
    .from("eden_signal_logs")
    .insert({
      content_queue_id: contentQueueId,
      persona_id: asOptionalString(body.persona_id) || "eden-skye",
      platform,
      measured_at: asOptionalString(body.measured_at) || new Date().toISOString(),
      impressions: asNumber(body.impressions),
      views: asNumber(body.views),
      watch_time_seconds: asNumber(body.watch_time_seconds),
      likes: asNumber(body.likes),
      comments: asNumber(body.comments),
      saves: asNumber(body.saves),
      shares: asNumber(body.shares),
      clicks: asNumber(body.clicks),
      email_opt_ins: asNumber(body.email_opt_ins),
      product_views: asNumber(body.product_views),
      purchases: asNumber(body.purchases),
      revenue_cents: asNumber(body.revenue_cents),
      metadata_json: metadata
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, status: "failed", blocker: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: "logged", signalLog: data });
}

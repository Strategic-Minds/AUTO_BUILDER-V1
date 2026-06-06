import { NextRequest, NextResponse } from "next/server";
import { insertBridgeEvent, signedOrBearerAuthorized, validateBridgeEvent } from "@/lib/bridge/event-bus";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!signedOrBearerAuthorized(request, rawBody)) {
    return NextResponse.json({ ok: false, error: "unauthorized", acceptedAuth: ["Bearer bridge secret", "HMAC SHA-256 signature"] }, { status: 401 });
  }

  const body = JSON.parse(rawBody || "{}");
  const errors = validateBridgeEvent(body);
  if (errors.length) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const write = await insertBridgeEvent(body, "pending");
  return NextResponse.json({
    ok: true,
    event_id: Array.isArray(write.data) ? write.data[0]?.id : body.id,
    status: write.ok ? "queued" : "dry_run",
    queued_at: new Date().toISOString(),
    write
  }, { headers: { "cache-control": "no-store" } });
}

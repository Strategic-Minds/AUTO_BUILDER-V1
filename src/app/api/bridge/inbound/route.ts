import { NextRequest, NextResponse } from "next/server";
import { dispatchToConnection, hmacAuthorized, insertBridgeEvent, validateBridgeEvent } from "@/lib/bridge-event-bus";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!hmacAuthorized(request, rawBody)) {
    return NextResponse.json({ status: "blocked", mutation: false, reason: "valid_hmac_signature_required" }, { status: 401 });
  }

  const body = JSON.parse(rawBody || "{}");
  const errors = validateBridgeEvent(body);
  if (errors.length) {
    return NextResponse.json({ status: "blocked", mutation: false, reason: "invalid_bridge_event", errors }, { status: 400 });
  }

  const queued = await insertBridgeEvent(body, "pending");
  const event = Array.isArray(queued.data) ? queued.data[0] : null;
  const eventId = event?.id || body.id || null;

  const shouldDispatch = body.metadata?.dispatch !== false;
  const dispatch = shouldDispatch
    ? await dispatchToConnection(body.target_system, { event_id: eventId, phase: body.phase, source_system: body.source_system, target_system: body.target_system, payload: body.payload || {}, metadata: body.metadata || {} })
    : { ok: false, reason: "dispatch_skipped_by_metadata" };

  return NextResponse.json({
    event_id: eventId,
    status: dispatch.ok ? "success" : "queued",
    queued_at: event?.created_at || new Date().toISOString(),
    persistence: queued,
    dispatch
  }, { headers: { "cache-control": "no-store" } });
}

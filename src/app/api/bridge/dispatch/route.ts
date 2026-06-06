import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized, dispatchToConnection, insertBridgeEvent, updateBridgeEvent, validateBridgeEvent } from "@/lib/bridge-event-bus";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!bearerAuthorized(request)) {
    return NextResponse.json({ status: "blocked", mutation: false, reason: "bridge_bearer_token_required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const eventBody = {
    phase: body.phase,
    source_system: body.source_system || "auto_builder",
    target_system: body.target_system,
    payload: body.payload || {},
    metadata: body.metadata || {}
  };
  const errors = validateBridgeEvent(eventBody);
  if (errors.length) {
    return NextResponse.json({ status: "blocked", mutation: false, reason: "invalid_bridge_event", errors }, { status: 400 });
  }

  const queued = await insertBridgeEvent(eventBody, "pending");
  const event = Array.isArray(queued.data) ? queued.data[0] : null;
  const dispatch = await dispatchToConnection(eventBody.target_system, { event_id: event?.id || null, ...eventBody });

  if (event?.id) {
    await updateBridgeEvent(event.id, dispatch.ok ? {
      status: "success",
      completed_at: new Date().toISOString(),
      dispatched_at: new Date().toISOString(),
      error_message: null
    } : {
      status: "failed",
      error_message: dispatch.reason || "dispatch_failed",
      next_retry_at: new Date(Date.now() + 120000).toISOString()
    });
  }

  return NextResponse.json({
    event_id: event?.id || null,
    status: dispatch.ok ? "success" : "failed",
    persistence: queued,
    dispatch
  }, { status: dispatch.ok ? 200 : 502, headers: { "cache-control": "no-store" } });
}

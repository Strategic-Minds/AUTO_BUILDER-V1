import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized, bridgeEventBusStatus, readRetryableBridgeEvents } from "@/lib/bridge/event-bus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!bearerAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized", bus: bridgeEventBusStatus() }, { status: 401 });
  }

  const limit = Number(request.nextUrl.searchParams.get("limit") || 10);
  const events = await readRetryableBridgeEvents(limit);
  return NextResponse.json({
    ok: events.ok,
    route: "/api/bridge/retry",
    mode: "inspect_only_until_dispatch_enabled",
    bus: bridgeEventBusStatus(),
    retryable: events
  }, { headers: { "cache-control": "no-store" } });
}

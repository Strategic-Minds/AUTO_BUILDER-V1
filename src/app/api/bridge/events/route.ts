import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized, bridgeEventBusStatus, readBridgeEvents } from "@/lib/bridge/event-bus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!bearerAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized", bus: bridgeEventBusStatus() }, { status: 401 });
  }

  const events = await readBridgeEvents(request.nextUrl.searchParams);
  return NextResponse.json({ ok: events.ok, events, bus: bridgeEventBusStatus() }, { headers: { "cache-control": "no-store" } });
}

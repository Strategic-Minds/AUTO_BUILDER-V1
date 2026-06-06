import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized, readBridgeEvents } from "@/lib/bridge-event-bus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!bearerAuthorized(request)) {
    return NextResponse.json({ status: "blocked", mutation: false, reason: "bridge_bearer_token_required" }, { status: 401 });
  }

  const events = await readBridgeEvents(new URL(request.url).searchParams);
  return NextResponse.json({ status: events.ok ? "ready" : "unavailable", mutation: false, events }, { headers: { "cache-control": "no-store" } });
}

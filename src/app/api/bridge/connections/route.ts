import { NextRequest, NextResponse } from "next/server";
import { bridgeEventBusStatus, publicConnection, readBridgeConnections } from "@/lib/bridge/event-bus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const includeInactive = request.nextUrl.searchParams.get("include_inactive") === "true";
  const revealUrl = request.nextUrl.searchParams.get("reveal_url") === "true" && request.headers.get("authorization")?.startsWith("Bearer ");
  const connections = await readBridgeConnections(includeInactive);
  const rows = Array.isArray(connections.data) ? connections.data.map((row) => publicConnection(row as Record<string, unknown>, revealUrl)) : [];

  return NextResponse.json({
    ok: connections.ok,
    bus: bridgeEventBusStatus(),
    connections: rows,
    source: connections.mode,
    note: "Webhook URLs are masked unless an authorized internal bearer request asks for reveal_url=true."
  }, { headers: { "cache-control": "no-store" } });
}

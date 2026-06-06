import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized, bridgeEventBusStatus, publicConnection, readBridgeConnections } from "@/lib/bridge-event-bus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authorized = bearerAuthorized(request);
  const includeInactive = authorized && new URL(request.url).searchParams.get("includeInactive") === "true";
  const connections = await readBridgeConnections(includeInactive);
  const rows = Array.isArray(connections.data) ? connections.data : [];

  return NextResponse.json({
    status: connections.ok ? "ready" : "unavailable",
    mutation: false,
    source: "awos_bridge_connection_registry",
    configured: bridgeEventBusStatus(),
    urlPolicy: authorized ? "full_url_visible_to_authorized_callers" : "webhook_urls_masked",
    connections: rows.map((row) => publicConnection(row, authorized)),
    persistence: connections.ok ? "supabase_rest" : connections
  }, { headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } });
}

import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized, publicConnection, registerBridgeConnection, validateConnection } from "@/lib/bridge-event-bus";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!bearerAuthorized(request)) {
    return NextResponse.json({ status: "blocked", mutation: false, reason: "bridge_bearer_token_required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const errors = validateConnection(body);
  if (errors.length) {
    return NextResponse.json({ status: "blocked", mutation: false, reason: "invalid_bridge_connection", errors }, { status: 400 });
  }

  const registered = await registerBridgeConnection(body);
  const row = Array.isArray(registered.data) ? registered.data[0] : null;

  return NextResponse.json({
    status: registered.ok ? "registered" : "accepted_not_persisted",
    mutation: registered.ok,
    connection_id: row?.id || null,
    connection: row ? publicConnection(row, false) : null,
    credentials: {
      issued: false,
      rule: "Secret values are configured through approved secret channels or Supabase Vault, never returned from this route."
    },
    persistence: registered
  }, { headers: { "cache-control": "no-store" } });
}

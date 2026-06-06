import { NextRequest, NextResponse } from "next/server";
import { registerBridgeConnection, signedOrBearerAuthorized, validateConnection } from "@/lib/bridge/event-bus";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!signedOrBearerAuthorized(request, rawBody)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = JSON.parse(rawBody || "{}");
  const errors = validateConnection(body);
  if (errors.length) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const result = await registerBridgeConnection(body);
  return NextResponse.json({ ok: result.ok, status: result.ok ? "registered" : "dry_run", result }, { headers: { "cache-control": "no-store" } });
}

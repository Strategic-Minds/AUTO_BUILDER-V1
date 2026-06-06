import { NextRequest, NextResponse } from "next/server";
import { dispatchToConnection, insertBridgeEvent, signedOrBearerAuthorized, validateBridgeEvent } from "@/lib/bridge/event-bus";
import { classifyBridgeAction } from "@/lib/bridge/policy";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!signedOrBearerAuthorized(request, rawBody)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = JSON.parse(rawBody || "{}");
  const event = {
    phase: body.phase,
    source_system: body.source_system || "auto_builder",
    target_system: body.target_system,
    payload: body.payload || {},
    metadata: body.metadata || {}
  };
  const errors = validateBridgeEvent(event);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });

  const policy = classifyBridgeAction({
    riskClass: body.riskClass ?? 2,
    mutation: true,
    system: event.target_system,
    action: body.action || "bridge_dispatch",
    approvalState: body.approvalState || "pending"
  });

  const receipt = await insertBridgeEvent(event, policy.allowed ? "pending" : "failed");
  if (!policy.allowed) {
    return NextResponse.json({ ok: false, blocked: true, policy, receipt }, { status: 423 });
  }

  const dispatch = await dispatchToConnection(String(event.target_system), event, 5);
  return NextResponse.json({ ok: dispatch.ok, policy, receipt, dispatch }, { headers: { "cache-control": "no-store" } });
}

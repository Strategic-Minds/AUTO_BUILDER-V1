import { NextRequest, NextResponse } from "next/server";
import { classifyBridgeAction } from "@/lib/bridge/policy";
import { bridgeEventBusStatus } from "@/lib/bridge/event-bus";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/bridge/policy-check",
    accepts: "POST",
    secretsExposed: false,
    bus: bridgeEventBusStatus(),
    smoke: {
      heartbeat: true,
      secretNamesOnly: true,
      harmlessRead: true,
      harmlessWriteRequiresGate: true,
      protectedActionsBlockedByDefault: true
    }
  }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const decision = classifyBridgeAction({
    riskClass: body.riskClass,
    mutation: body.mutation,
    system: body.system,
    action: body.action,
    approvalState: body.approvalState
  });

  return NextResponse.json({
    ok: true,
    decision,
    bus: bridgeEventBusStatus(),
    protectedGates: [
      "production_deploy",
      "production_migration",
      "secret_mutation",
      "shopify_live_write",
      "stripe_payment_action",
      "social_live_publish",
      "customer_message",
      "destructive_action",
      "capital_spend"
    ]
  }, { headers: { "cache-control": "no-store" } });
}

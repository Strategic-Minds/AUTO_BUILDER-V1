import { NextRequest, NextResponse } from "next/server";
import { runPostRelayBridge } from "@/lib/bridges/post-relay-bridge";
import { runUniversalGptBridge, type UniversalBridgeAction } from "@/lib/bridges/universal-gpt-bridge";

export const runtime = "nodejs";
export const maxDuration = 300;

type PhoneBridgeBody = {
  phoneToken?: string;
  route?: "postRelay" | "universal";
  approved?: boolean;
  payload?: Record<string, unknown>;
  action?: UniversalBridgeAction;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as PhoneBridgeBody;
  const gate = requirePhoneBridge(body.phoneToken);
  if (gate) return NextResponse.json(gate, { status: 403 });

  if (body.route === "postRelay") {
    const result = await runPostRelayBridge({
      ...(body.payload ?? {}),
      token: process.env.AUTO_BUILDER_POST_RELAY_TOKEN ?? process.env.AUTO_BUILDER_UNIVERSAL_BRIDGE_TOKEN,
      approved: body.approved
    });
    const statusCode = result.status === "blocked" ? 403 : result.status === "error" ? 500 : 200;
    return NextResponse.json(result, { status: statusCode });
  }

  if (body.route === "universal") {
    const result = await runUniversalGptBridge({
      action: body.action,
      token: process.env.AUTO_BUILDER_UNIVERSAL_BRIDGE_TOKEN,
      approved: body.approved,
      payload: body.payload
    });
    const statusCode = result.status === "blocked" ? 403 : result.status === "error" ? 500 : 200;
    return NextResponse.json(result, { status: statusCode });
  }

  return NextResponse.json({ status: "blocked", receipt: { reason: "Missing route. Use postRelay or universal." } }, { status: 400 });
}

function requirePhoneBridge(phoneToken: string | undefined) {
  if (process.env.AUTO_BUILDER_PHONE_BRIDGE_ENABLED !== "true") {
    return {
      status: "blocked",
      receipt: {
        reason: "AUTO_BUILDER_PHONE_BRIDGE_ENABLED is not true",
        requiredEnv: ["AUTO_BUILDER_PHONE_BRIDGE_ENABLED", "AUTO_BUILDER_PHONE_BRIDGE_TOKEN"]
      }
    };
  }

  const expectedToken = process.env.AUTO_BUILDER_PHONE_BRIDGE_TOKEN;
  if (!expectedToken || phoneToken !== expectedToken) {
    return { status: "blocked", receipt: { reason: "Phone bridge token missing or invalid" } };
  }

  return null;
}

import { NextRequest, NextResponse } from "next/server";
import { googleChatContract } from "@/lib/autobuilder/runtime-contracts";
import { classifyBridgeAction } from "@/lib/bridge/policy";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(googleChatContract(), { headers: { "cache-control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const policy = classifyBridgeAction({
    riskClass: body.riskClass ?? 2,
    mutation: true,
    system: "google_chat",
    action: "customer_message" in body ? "customer_message" : "operator_approval_message",
    approvalState: body.approvalState || "pending"
  });

  const message = {
    text: body.text || "AUTO BUILDER approval requested.",
    cardsV2: body.cardsV2,
    metadata: {
      source: "auto_builder_google_chat_bridge",
      draftOnly: process.env.GOOGLE_CHAT_SEND_ENABLED !== "true",
      createdAt: new Date().toISOString()
    }
  };

  if (!policy.allowed || process.env.GOOGLE_CHAT_SEND_ENABLED !== "true") {
    return NextResponse.json({
      ok: true,
      sent: false,
      mode: "draft_only",
      policy,
      contract: googleChatContract(),
      draft: message
    }, { headers: { "cache-control": "no-store" } });
  }

  const webhook = process.env.GOOGLE_CHAT_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json({ ok: false, sent: false, error: "GOOGLE_CHAT_WEBHOOK_URL_missing", policy }, { status: 500 });
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(message)
  });

  return NextResponse.json({ ok: response.ok, sent: response.ok, status: response.status, policy }, { headers: { "cache-control": "no-store" } });
}

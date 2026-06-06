import { NextResponse } from "next/server";
import { classifyBridgeAction } from "@/lib/bridges/governance";

export async function POST(request: Request) {
  const body = await request.json();
  const decision = classifyBridgeAction({
    riskClass: body.riskClass,
    mutation: Boolean(body.mutation),
    system: String(body.system || "unknown"),
    approvalState: body.approvalState
  });

  return NextResponse.json({ status: decision.allowed ? "allowed" : "blocked", mutation: false, decision }, { status: decision.allowed ? 200 : 403 });
}

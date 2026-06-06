import { NextRequest, NextResponse } from "next/server";
import { runUniversalGptBridge, type UniversalBridgeAction } from "@/lib/bridges/universal-gpt-bridge";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    action?: UniversalBridgeAction;
    approved?: boolean;
    token?: string;
    payload?: Record<string, unknown>;
  };

  const result = await runUniversalGptBridge(body);
  const statusCode = result.status === "blocked" ? 403 : result.status === "error" ? 500 : 200;
  return NextResponse.json(result, { status: statusCode });
}

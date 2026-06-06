import { NextRequest, NextResponse } from "next/server";
import { runPostRelayBridge } from "@/lib/bridges/post-relay-bridge";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = await runPostRelayBridge(body);
  const statusCode = result.status === "blocked" ? 403 : result.status === "error" ? 500 : 200;
  return NextResponse.json(result, { status: statusCode });
}

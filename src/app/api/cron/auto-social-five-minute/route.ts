import { NextRequest, NextResponse } from "next/server";
import { buildHeartbeatReceipt } from "@/lib/auto-social";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET ?? process.env.CRON_API_TOKEN;
  if (!expected) return true;

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const legacy = request.headers.get("x-cron-token");
  return bearer === expected || legacy === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(buildHeartbeatReceipt());
}

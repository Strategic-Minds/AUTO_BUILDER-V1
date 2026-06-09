import { NextRequest, NextResponse } from "next/server";
import { buildEdenReceipt, type EdenOperation } from "@/lib/eden-skye-os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET || process.env.CRON_API_TOKEN;
  if (!secret) return true;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return bearer === secret || request.headers.get("x-cron-token") === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const operations: EdenOperation[] = ["discover", "analyze", "create", "validate", "heal"];
  return NextResponse.json({
    ok: true,
    job: "eden-skye-five-minute",
    productionActionAllowed: false,
    timestamp: new Date().toISOString(),
    receipts: operations.map((operation) => buildEdenReceipt(operation))
  });
}

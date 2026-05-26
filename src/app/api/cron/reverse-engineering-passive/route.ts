import { NextRequest, NextResponse } from "next/server";
import { buildPassiveReverseEngineeringPlan } from "@/lib/factory";

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_API_TOKEN;
  if (!expected) {
    return true;
  }

  const header = request.headers.get("x-cron-token") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = request.nextUrl.searchParams.get("target") ?? "benchmark-portfolio";

  return NextResponse.json({
    ok: true,
    job: "reverse-engineering-passive",
    queued: true,
    productionActionAllowed: false,
    timestamp: new Date().toISOString(),
    passiveMode: process.env.PASSIVE_RESEARCH_ENABLED ?? "true",
    plan: buildPassiveReverseEngineeringPlan(target)
  });
}

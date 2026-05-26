import { NextRequest, NextResponse } from "next/server";
import { factoryReadiness, buildCapabilityTestMatrix } from "@/lib/factory";

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

  return NextResponse.json({
    ok: true,
    job: "factory-readiness",
    queued: true,
    productionActionAllowed: false,
    timestamp: new Date().toISOString(),
    factory: factoryReadiness,
    capabilityMatrix: buildCapabilityTestMatrix()
  });
}

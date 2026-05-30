import { NextRequest, NextResponse } from "next/server";
import { factoryReadiness, buildCapabilityTestMatrix } from "@/lib/factory";
import { buildOperationalReadinessSnapshot } from "@/lib/operational-readiness";

export const dynamic = "force-dynamic";

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

  const operationalReadiness = await buildOperationalReadinessSnapshot();

  return NextResponse.json({
    ok: operationalReadiness.status === "operational",
    job: "factory-readiness",
    queued: true,
    productionActionAllowed: false,
    timestamp: new Date().toISOString(),
    operationalReadiness,
    factory: factoryReadiness,
    capabilityMatrix: buildCapabilityTestMatrix()
  });
}

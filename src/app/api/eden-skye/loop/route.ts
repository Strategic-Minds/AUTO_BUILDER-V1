import { NextRequest, NextResponse } from "next/server";
import {
  buildEdenSkyeLoopDryRun,
  getEdenSkyeAgents,
  getEdenSkyeWebsiteSocialLoopReadiness,
  getEdenSkyeWorkflowPlan
} from "@/lib/eden-skye/website-social-loop";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get("dryRun");

  if (dryRun === "1" || dryRun === "full") {
    return NextResponse.json(buildEdenSkyeLoopDryRun());
  }

  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    secretsExposed: false,
    readiness: getEdenSkyeWebsiteSocialLoopReadiness(),
    workflow: getEdenSkyeWorkflowPlan(),
    agents: getEdenSkyeAgents(),
    dryRun: "/api/eden-skye/loop?dryRun=full"
  });
}

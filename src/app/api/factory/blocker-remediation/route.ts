import { NextRequest, NextResponse } from "next/server";
import { blockerAutonomyPolicy, buildBlockerRemediationPlan } from "@/lib/blocker-remediation";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    system: "AUTO BUILDER blocker remediation",
    policy: blockerAutonomyPolicy,
    exampleTrigger: {
      queue: "vercel_preview_queue",
      connector: "Vercel",
      summary: "Preview deployment failed in UI and needs automatic repair.",
      uiSurface: "factory-control-center"
    }
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    blockerCode?: string;
    queue?: string;
    connector?: string;
    uiSurface?: string;
    summary?: string;
    evidence?: string[];
    attempts?: number;
    approvalRequired?: boolean;
    riskClass?: string;
  };

  const remediation = buildBlockerRemediationPlan(body);

  return NextResponse.json({
    status: "ok",
    triggered: true,
    system: "AUTO BUILDER blocker remediation",
    source: body.uiSurface ?? body.queue ?? "ui-blocker-card",
    policy: blockerAutonomyPolicy,
    remediation
  });
}

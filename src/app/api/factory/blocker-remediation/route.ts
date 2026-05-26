import { NextRequest, NextResponse } from "next/server";
import { blockerAutonomyPolicy, buildBlockerRemediationPlan } from "@/lib/blocker-remediation";

function parseBoolean(value: string | null) {
  return value === "true";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queue = searchParams.get("queue");
  const summary = searchParams.get("summary");

  if (queue || summary) {
    const remediation = buildBlockerRemediationPlan({
      blockerCode: searchParams.get("blockerCode") ?? undefined,
      queue: queue ?? undefined,
      connector: searchParams.get("connector") ?? undefined,
      uiSurface: searchParams.get("uiSurface") ?? "factory-control-center",
      summary: summary ?? undefined,
      attempts: Number(searchParams.get("attempts") ?? "0"),
      approvalRequired: parseBoolean(searchParams.get("approvalRequired")),
      riskClass: searchParams.get("riskClass") ?? undefined,
      evidence: searchParams.getAll("evidence")
    });

    return NextResponse.json({
      status: "ok",
      system: "AUTO BUILDER blocker remediation",
      testMode: true,
      remediation
    });
  }

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
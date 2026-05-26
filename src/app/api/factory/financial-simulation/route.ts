import { NextRequest, NextResponse } from "next/server";
import { buildFinanceCommandCenter, buildFinanceSimulationPacket, defaultFinanceAssumptions, defaultFinanceScenarios } from "@/lib/finance-sim";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    system: "AUTO BUILDER Financial Prediction & Simulation System",
    assumptions: defaultFinanceAssumptions,
    scenarios: defaultFinanceScenarios,
    commandCenter: buildFinanceCommandCenter()
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { idea?: string };
  const idea = body.idea?.trim() || "Build Chris a financial prediction and simulation system.";

  return NextResponse.json({
    status: "ok",
    buildPacket: buildFinanceSimulationPacket(idea)
  });
}

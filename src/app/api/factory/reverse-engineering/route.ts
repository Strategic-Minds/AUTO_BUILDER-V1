import { NextRequest, NextResponse } from "next/server";
import { buildPassiveReverseEngineeringPlan } from "@/lib/factory";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { target?: string };
  const target = body.target?.trim() || "unspecified-target";

  return NextResponse.json({
    status: "ok",
    reverseEngineering: buildPassiveReverseEngineeringPlan(target)
  });
}

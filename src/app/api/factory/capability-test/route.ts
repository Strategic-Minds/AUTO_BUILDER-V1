import { NextResponse } from "next/server";
import { buildCapabilityTestMatrix } from "@/lib/factory";
import { blockerAutonomyPolicy } from "@/lib/blocker-remediation";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    system: "AUTO BUILDER capability test system",
    matrix: buildCapabilityTestMatrix(),
    blockerAutonomy: blockerAutonomyPolicy
  });
}
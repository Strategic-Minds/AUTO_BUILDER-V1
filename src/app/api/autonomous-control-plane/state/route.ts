import { NextResponse } from "next/server";
import { getAutonomousControlPlaneState } from "@/lib/autonomous-control-plane/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ...getAutonomousControlPlaneState(),
    note: "Preview-safe state only. Production action is disabled."
  });
}

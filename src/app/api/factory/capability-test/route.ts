import { NextResponse } from "next/server";
import { buildCapabilityTestMatrix } from "@/lib/factory";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    system: "AUTO BUILDER capability test system",
    matrix: buildCapabilityTestMatrix()
  });
}

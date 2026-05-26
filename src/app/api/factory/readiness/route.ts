import { NextResponse } from "next/server";
import { buildCapabilityTestMatrix, factoryReadiness, templateLibrary, fastPathRoutes } from "@/lib/factory";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    factory: factoryReadiness,
    routeCount: fastPathRoutes.length,
    templateCount: templateLibrary.length,
    capabilityTestMatrix: buildCapabilityTestMatrix()
  });
}

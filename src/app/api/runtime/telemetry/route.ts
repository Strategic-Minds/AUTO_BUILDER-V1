import { NextResponse } from "next/server";
import { buildRuntimeTelemetrySnapshot, runtimeTelemetrySchemaSql } from "@/lib/runtime-telemetry";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    telemetry: buildRuntimeTelemetrySnapshot(),
    sql: runtimeTelemetrySchemaSql
  });
}

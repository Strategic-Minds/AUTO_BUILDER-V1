import { NextResponse } from "next/server";
import { readSignalLogs } from "@/lib/eden-skye/review-data";

export async function GET() {
  const result = await readSignalLogs();

  return NextResponse.json({
    ok: true,
    table: "eden_signal_logs",
    source: result.source,
    blockers: result.blockers,
    rows: result.rows
  });
}

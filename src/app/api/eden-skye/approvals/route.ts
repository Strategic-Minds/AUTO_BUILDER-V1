import { NextResponse } from "next/server";
import { readApprovalEvents } from "@/lib/eden-skye/review-data";

export async function GET() {
  const result = await readApprovalEvents();

  return NextResponse.json({
    ok: true,
    table: "approval_events",
    source: result.source,
    blockers: result.blockers,
    rows: result.rows
  });
}

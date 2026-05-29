import { NextResponse } from "next/server";
import { readInteractionModes } from "@/lib/eden-skye/review-data";

export async function GET() {
  const result = await readInteractionModes();

  return NextResponse.json({
    ok: true,
    table: "interaction_modes",
    source: result.source,
    blockers: result.blockers,
    rows: result.rows
  });
}

import { NextResponse } from "next/server";
import { readPersonaAssets } from "@/lib/eden-skye/review-data";

export async function GET() {
  const result = await readPersonaAssets();

  return NextResponse.json({
    ok: true,
    table: "eden_persona_assets",
    source: result.source,
    blockers: result.blockers,
    rows: result.rows
  });
}

import { NextResponse } from "next/server";
import { readPersonas } from "@/lib/eden-skye/review-data";

export async function GET() {
  const result = await readPersonas();

  return NextResponse.json({
    ok: true,
    table: "forbidden_fruit_personas",
    source: result.source,
    blockers: result.blockers,
    rows: result.rows
  });
}

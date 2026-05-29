import { NextResponse } from "next/server";
import { readContentQueue } from "@/lib/eden-skye/review-data";

export async function GET() {
  const result = await readContentQueue();

  return NextResponse.json({
    ok: true,
    table: "content_products",
    source: result.source,
    blockers: result.blockers,
    rows: result.rows
  });
}

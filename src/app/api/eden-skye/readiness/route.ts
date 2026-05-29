import { NextResponse } from "next/server";
import { buildReadinessSnapshot, readAllEdenReviewData } from "@/lib/eden-skye/review-data";

export async function GET() {
  const result = await readAllEdenReviewData();
  const readiness = buildReadinessSnapshot(result.data, result.source, result.blockers);

  return NextResponse.json({
    ok: true,
    readiness
  });
}

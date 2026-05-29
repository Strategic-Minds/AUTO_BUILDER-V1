import { NextResponse } from "next/server";
import { buildReadinessSnapshot, readAllEdenReviewData, type ReadinessSnapshot } from "@/lib/eden-skye/review-data";

function normalizeSource(source: string): ReadinessSnapshot["source"] {
  return source === "supabase" || source === "static_seed" || source === "mixed" ? source : "mixed";
}

export async function GET() {
  const result = await readAllEdenReviewData();
  const readiness = buildReadinessSnapshot(result.data, normalizeSource(result.source), result.blockers);

  return NextResponse.json({
    ok: true,
    readiness
  });
}

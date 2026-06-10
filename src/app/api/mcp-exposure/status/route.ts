import { NextRequest, NextResponse } from "next/server";
import { analyzeToolExposure } from "@/lib/mcp-exposure/analyzer";
import { recordToolExposure } from "@/lib/mcp-exposure/auto-heal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const input = await request.json().catch(() => ({}));
  if (input.record === false) {
    return NextResponse.json({ analysis: analyzeToolExposure(input) });
  }

  return NextResponse.json(await recordToolExposure(input));
}

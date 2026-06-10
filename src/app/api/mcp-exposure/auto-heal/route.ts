import { NextRequest, NextResponse } from "next/server";
import { buildAutoHealPlan } from "@/lib/mcp-exposure/auto-heal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const input = await request.json().catch(() => ({}));
  return NextResponse.json(buildAutoHealPlan(input));
}

import { NextRequest, NextResponse } from "next/server";
import { governancePreflight } from "@/lib/autobuilder/mcp-core";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const input = await req.json().catch(() => ({}));
  return NextResponse.json(governancePreflight(input));
}

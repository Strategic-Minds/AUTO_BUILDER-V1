import { NextResponse } from "next/server";
import { getWave2Health } from "@/lib/autobuilder-v2/mcp-universe/wave-2-adapters";

export async function GET() {
  return NextResponse.json(getWave2Health());
}

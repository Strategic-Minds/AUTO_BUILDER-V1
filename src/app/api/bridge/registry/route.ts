import { NextResponse } from "next/server";
import { bridgeRegistry } from "@/lib/autobuilder/mcp-core";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(bridgeRegistry());
}

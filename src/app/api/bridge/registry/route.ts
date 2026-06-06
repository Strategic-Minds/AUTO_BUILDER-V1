import { NextResponse } from "next/server";
import { bridgeRegistry } from "@/lib/autobuilder/mcp-core";
import { autonomousBridgeRegistry } from "@/lib/bridges/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ready",
    mutation: false,
    existing: bridgeRegistry(),
    autonomous: autonomousBridgeRegistry
  });
}

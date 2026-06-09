import { NextResponse } from "next/server";
import { runMcpSelfOperatingLoop } from "@/lib/autobuilder-v2/mcp-universe/self-operating-loop";

export const runtime = "nodejs";

export async function GET() {
  const result = await runMcpSelfOperatingLoop();
  return NextResponse.json({
    ...result,
    note: "Self-operating loop creates internal receipts and work queues only. It does not execute live connector mutations."
  });
}

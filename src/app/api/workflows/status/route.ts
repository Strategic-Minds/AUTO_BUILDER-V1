import { NextResponse } from "next/server";
import { aiGatewayContract, workflowContract } from "@/lib/autobuilder/runtime-contracts";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    workflow: workflowContract(),
    aiGateway: aiGatewayContract()
  }, { headers: { "cache-control": "no-store" } });
}

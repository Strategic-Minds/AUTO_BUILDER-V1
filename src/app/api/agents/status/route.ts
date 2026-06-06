import { NextResponse } from "next/server";
import { agentContract } from "@/lib/autobuilder/runtime-contracts";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(agentContract(), { headers: { "cache-control": "no-store" } });
}

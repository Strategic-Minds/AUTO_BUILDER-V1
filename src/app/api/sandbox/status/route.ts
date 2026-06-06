import { NextResponse } from "next/server";
import { sandboxContract } from "@/lib/autobuilder/runtime-contracts";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(sandboxContract(), { headers: { "cache-control": "no-store" } });
}

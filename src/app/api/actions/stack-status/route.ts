import { NextResponse } from "next/server";
import { autobuilderStackStatus } from "@/lib/autobuilder/mcp-core";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(autobuilderStackStatus());
}

export async function POST() {
  return GET();
}

import { NextRequest, NextResponse } from "next/server";
import { webhookIntake } from "@/lib/autobuilder/mcp-core";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const input = await req.json().catch(() => ({}));
  return NextResponse.json(webhookIntake(input));
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    route: "/api/bridge/webhook",
    mode: "data intake only"
  });
}

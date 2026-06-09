import { NextRequest, NextResponse } from "next/server";
import { runWave2DriveDryRun, wave2DriveTools } from "@/lib/autobuilder-v2/mcp-universe/wave-2-adapters";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    tools: wave2DriveTools,
    mode: "dry_run_ready",
    note: "POST validates Drive upload/import payloads and writes an internal receipt. It performs no Drive mutation in dry_run mode."
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, productionActionAllowed: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await runWave2DriveDryRun(body as Record<string, unknown>);
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}

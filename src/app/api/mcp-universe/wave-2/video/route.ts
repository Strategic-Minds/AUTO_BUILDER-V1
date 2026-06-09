import { NextRequest, NextResponse } from "next/server";
import { runWave2VideoDryRun, wave2VideoTools } from "@/lib/autobuilder-v2/mcp-universe/wave-2-adapters";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    tools: wave2VideoTools,
    mode: "dry_run_ready",
    note: "POST validates video generation payloads and writes an internal receipt. It performs no paid/provider-side generation in dry_run mode."
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, productionActionAllowed: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await runWave2VideoDryRun(body as Record<string, unknown>);
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}

import { NextRequest, NextResponse } from "next/server";
import { runWave2VideoDryRun, wave2VideoTools } from "@/lib/autobuilder-v2/mcp-universe/wave-2-adapters";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get("dryRun");
  const approvalProbe = request.nextUrl.searchParams.get("approvalProbe");

  if (dryRun === "sample") {
    const result = await runWave2VideoDryRun({
      mode: "dry_run",
      tool: "video_generate_draft",
      provider: "heygen",
      modelId: "eden-skye-test-model",
      avatarId: "e2b5bc437bc7433d8c6c327c16dbee16",
      voiceId: "05b2f709e2534917b30a1bfa80964e5c",
      script: "Internal dry run only. This validates a draft video payload for Eden Skye Studios. Do not publish.",
      aspectRatio: "9:16",
      durationTargetSeconds: 15,
      platformTarget: "instagram",
      driveTargetFolderIdOrUrl: "https://drive.google.com/drive/folders/1uCsLaebFWtiMQ3T6A8i_NvgzWB6Kmxgk",
      contentSafetyClass: "public_safe"
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }

  if (approvalProbe === "1") {
    const result = await runWave2VideoDryRun({
      mode: "approved_generation",
      tool: "video_generate_draft",
      provider: "heygen",
      modelId: "eden-skye-test-model",
      script: "Internal approval probe only. Do not generate.",
      aspectRatio: "9:16",
      durationTargetSeconds: 15,
      platformTarget: "instagram",
      contentSafetyClass: "public_safe"
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }

  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    tools: wave2VideoTools,
    mode: "dry_run_ready",
    sampleDryRun: "/api/mcp-universe/wave-2/video?dryRun=sample",
    approvalProbe: "/api/mcp-universe/wave-2/video?approvalProbe=1",
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

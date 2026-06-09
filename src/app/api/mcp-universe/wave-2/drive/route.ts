import { NextRequest, NextResponse } from "next/server";
import { runWave2DriveDryRun, wave2DriveTools } from "@/lib/autobuilder-v2/mcp-universe/wave-2-adapters";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get("dryRun");
  const approvalProbe = request.nextUrl.searchParams.get("approvalProbe");

  if (dryRun === "sample") {
    const result = await runWave2DriveDryRun({
      mode: "dry_run",
      tool: "drive_upload_file",
      sourceFileRef: "/workspace/output/eden-skye-enterprise-image-library-ops-workbook.xlsx",
      targetFolderIdOrUrl: "https://drive.google.com/drive/folders/1uCsLaebFWtiMQ3T6A8i_NvgzWB6Kmxgk",
      targetName: "eden-skye-enterprise-image-library-ops-workbook.xlsx",
      uploadMode: "native_google_sheets",
      idempotencyKey: "eden-skye-wave2-drive-get-dry-run"
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }

  if (approvalProbe === "1") {
    const result = await runWave2DriveDryRun({
      mode: "approved_write",
      tool: "drive_upload_file",
      sourceFileRef: "/workspace/output/eden-skye-enterprise-image-library-ops-workbook.xlsx",
      targetFolderIdOrUrl: "https://drive.google.com/drive/folders/1uCsLaebFWtiMQ3T6A8i_NvgzWB6Kmxgk",
      targetName: "eden-skye-enterprise-image-library-ops-workbook.xlsx",
      uploadMode: "native_google_sheets"
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }

  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    tools: wave2DriveTools,
    mode: "dry_run_ready",
    sampleDryRun: "/api/mcp-universe/wave-2/drive?dryRun=sample",
    approvalProbe: "/api/mcp-universe/wave-2/drive?approvalProbe=1",
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

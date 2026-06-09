import { NextRequest, NextResponse } from "next/server";
import { driveCreateFolder } from "@/lib/autobuilder-v2/drive-job-runner";
import { runWave2DriveDryRun, wave2DriveTools } from "@/lib/autobuilder-v2/mcp-universe/wave-2-adapters";

export const runtime = "nodejs";

const autoBuilderMasterFolderId = "1JAmLjo4UiD567C0Z_ogBxo3NELJK8L80";
const autoWorkflowFolderId = "13VaSbBlwHGAV_8E48a-dpZD25iwQbWTM";
const liveScaffoldApprovalId = "jeremy-auto-workflow-scaffold-20260609";

type CreatedFolderResult = {
  ok?: boolean;
  validation_status?: string;
  created_folder?: { id?: string; name?: string; webViewLink?: string; parents?: string[] };
  blocked_operations?: unknown[];
  failed_operations?: unknown[];
  receipts?: unknown[];
};

function cleanFolderName(value: string | null) {
  return (value ?? "").trim().slice(0, 120);
}

function safeError(value: unknown) {
  if (value instanceof Error) return { name: value.name, message: value.message };
  return { name: "UnknownError", message: String(value) };
}

async function createApprovedFolder(name: string, parentFolderId: string) {
  const result = await driveCreateFolder({
    root_folder_id: autoWorkflowFolderId,
    parent_folder_id: parentFolderId,
    name,
    dry_run: false,
    approved_actions: ["create_missing_folders"],
    approval_phrase: "APPROVE DRIVE FOLDER CREATE"
  }) as CreatedFolderResult;

  return {
    name,
    parentFolderId,
    ok: result.ok === true,
    validationStatus: result.validation_status ?? null,
    folder: result.created_folder ?? null,
    blockedOperations: result.blocked_operations ?? [],
    failedOperations: result.failed_operations ?? [],
    receipts: result.receipts ?? []
  };
}

async function runLiveCreateFolder(request: NextRequest) {
  const parentFolderId = request.nextUrl.searchParams.get("parentFolderId");
  const masterFolderId = request.nextUrl.searchParams.get("masterFolderId");
  const approvalId = request.nextUrl.searchParams.get("approvalId");
  const name = cleanFolderName(request.nextUrl.searchParams.get("name"));

  if (!name) {
    return NextResponse.json({ ok: false, productionActionAllowed: false, status: "blocked", blocker: "Folder name is required.", noMutationPerformed: true }, { status: 400 });
  }

  if (!parentFolderId || masterFolderId !== autoBuilderMasterFolderId || approvalId !== liveScaffoldApprovalId) {
    return NextResponse.json({
      ok: false,
      productionActionAllowed: false,
      status: "blocked",
      blocker: "Approved Auto Workflow folder creation requires masterFolderId, parentFolderId, and approvalId.",
      expected: { masterFolderId: autoBuilderMasterFolderId, approvalId: liveScaffoldApprovalId },
      noMutationPerformed: true
    }, { status: 409 });
  }

  try {
    const result = await createApprovedFolder(name, parentFolderId);
    return NextResponse.json({
      ok: result.ok,
      productionActionAllowed: true,
      status: result.ok ? "folder_created" : "folder_create_failed",
      approvalId,
      masterFolderId,
      rootFolderId: autoWorkflowFolderId,
      parentFolderId,
      result,
      noSupabaseSchemaChange: true,
      noCronActivation: true,
      noWorkflowActivation: true,
      noAdapterWidening: true
    }, { status: result.ok ? 200 : 409 });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      productionActionAllowed: false,
      status: "folder_create_exception",
      blocker: "Live Drive folder creation threw before returning a Drive receipt.",
      error: safeError(error),
      noMutationPerformed: true,
      noSupabaseSchemaChange: true,
      noCronActivation: true,
      noWorkflowActivation: true,
      noAdapterWidening: true
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get("dryRun");
  const approvalProbe = request.nextUrl.searchParams.get("approvalProbe");
  const liveCreateFolder = request.nextUrl.searchParams.get("liveCreateFolder");

  if (liveCreateFolder === "1") {
    return runLiveCreateFolder(request);
  }

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

  if (dryRun === "createFolder") {
    const result = await runWave2DriveDryRun({
      mode: "dry_run",
      tool: "drive_create_folder",
      targetFolderIdOrUrl: "test-parent-folder-id-or-url",
      targetName: "AUTO BUILDER MCP Dry Run Test Folder",
      idempotencyKey: "auto-builder-drive-create-folder-get-dry-run"
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
    createFolderDryRun: "/api/mcp-universe/wave-2/drive?dryRun=createFolder",
    approvalProbe: "/api/mcp-universe/wave-2/drive?approvalProbe=1",
    note: "POST validates Drive upload/import/folder payloads and writes an internal receipt. It performs no Drive mutation in dry_run mode."
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

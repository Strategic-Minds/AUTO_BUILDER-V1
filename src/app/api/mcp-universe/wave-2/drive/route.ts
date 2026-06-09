import { NextRequest, NextResponse } from "next/server";
import {
  buildEdenSkyeFullScaffoldDriveJob,
  runWave2DriveDryRun,
  wave2DriveTools
} from "@/lib/autobuilder-v2/mcp-universe/wave-2-adapters";
import {
  buildApprovedDriveScaffoldPayload,
  runApprovedDriveScaffoldWrite
} from "@/lib/autobuilder-v2/mcp-universe/drive-scaffold-writer";
import {
  AUTO_WORKFLOW_CANONICAL_FOLDERS,
  runApprovedDriveToolWrite
} from "@/lib/autobuilder-v2/mcp-universe/drive-tool-writer";

export const runtime = "nodejs";

const AUTO_WORKFLOW_ROOT_FOLDER_ID = "13VaSbBlwHGAV_8E48a-dpZD25iwQbWTM";
const APPROVED_DRIVE_TOOL_WRITE_PHRASE = "APPROVE DRIVE TOOL WRITE";
const APPROVED_TOOL_NAMES = new Set(["drive_put_file", "drive_upload_file", "drive_upload_image", "drive_move_file", "drive_list_folder", "drive_list_tree", "drive_write_receipt"]);

function scaffoldErrorResponse(error: unknown) {
  return NextResponse.json(
    {
      ok: false,
      productionActionAllowed: false,
      status: "drive_scaffold_failed",
      error: error instanceof Error ? error.message : String(error),
      noDeleteRenameMovePublishPaymentOrMessagingPerformed: true
    },
    { status: 500 }
  );
}

function getRequestedRootFolderId(request: NextRequest) {
  return (
    request.nextUrl.searchParams.get("rootFolderId") ??
    request.nextUrl.searchParams.get("root_folder_id") ??
    request.nextUrl.searchParams.get("parentFolderId") ??
    undefined
  );
}

function assertAutoWorkflowRoot(rootFolderId: string | undefined) {
  if (rootFolderId === AUTO_WORKFLOW_ROOT_FOLDER_ID) return null;

  return NextResponse.json(
    {
      ok: false,
      productionActionAllowed: false,
      status: "blocked_wrong_root_folder",
      requiredRootFolderId: AUTO_WORKFLOW_ROOT_FOLDER_ID,
      receivedRootFolderId: rootFolderId ?? null,
      blocker: "Approved AUTO WORKFLOW scaffold GET must target the existing AUTO WORKFLOW folder. No outside/root-level folder creation is allowed.",
      noMutationPerformed: true
    },
    { status: 409 }
  );
}

function getPayloadRootFolderId(payload: Record<string, unknown>) {
  const rootFolderId = payload.root_folder_id ?? payload.rootFolderId ?? payload.parentFolderId;
  return typeof rootFolderId === "string" ? rootFolderId : undefined;
}

function getApprovedToolPayload(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  return {
    mode: "approved_write",
    tool: params.get("approvedTool") ?? undefined,
    approved: params.get("approved") === "true",
    approvalId: params.get("approvalId") ?? undefined,
    approvalPhrase: params.get("approvalPhrase") ?? undefined,
    targetFolderAlias: params.get("targetFolderAlias") ?? undefined,
    targetFolderIdOrUrl: params.get("targetFolderIdOrUrl") ?? undefined,
    destinationFolderAlias: params.get("destinationFolderAlias") ?? undefined,
    destinationFolderIdOrUrl: params.get("destinationFolderIdOrUrl") ?? undefined,
    targetName: params.get("targetName") ?? undefined,
    sourceText: params.get("sourceText") ?? undefined,
    sourceBase64: params.get("sourceBase64") ?? undefined,
    sourceUrl: params.get("sourceUrl") ?? undefined,
    sourceFileId: params.get("sourceFileId") ?? undefined,
    mimeType: params.get("mimeType") ?? undefined,
    idempotencyKey: params.get("idempotencyKey") ?? undefined
  };
}

export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get("dryRun");
  const approvalProbe = request.nextUrl.searchParams.get("approvalProbe");
  const approvedScaffold = request.nextUrl.searchParams.get("approvedScaffold");
  const approvedTool = request.nextUrl.searchParams.get("approvedTool");

  if (dryRun === "sample") {
    const result = await runWave2DriveDryRun({
      mode: "dry_run",
      tool: "drive_upload_file",
      sourceText: "AUTO BUILDER Drive dry-run sample",
      targetFolderAlias: "auto_social_receipts",
      targetName: "auto-builder-drive-dry-run.txt",
      uploadMode: "raw",
      idempotencyKey: "eden-skye-wave2-drive-get-dry-run"
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }

  if (dryRun === "fullScaffold") {
    const result = await runWave2DriveDryRun(buildEdenSkyeFullScaffoldDriveJob());
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

  if (dryRun === "putFile") {
    const result = await runWave2DriveDryRun({
      mode: "dry_run",
      tool: "drive_put_file",
      sourceText: "AUTO BUILDER canonical Drive put-file dry run",
      targetFolderAlias: "auto_social_receipts",
      targetName: "auto-builder-put-file-dry-run.txt",
      uploadMode: "raw",
      idempotencyKey: "auto-builder-drive-put-file-dry-run"
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }

  if (dryRun === "uploadImage") {
    const result = await runWave2DriveDryRun({
      mode: "dry_run",
      tool: "drive_upload_image",
      sourceBase64: "redacted-dry-run-placeholder",
      targetFolderAlias: "auto_social_media_engine",
      targetName: "auto-builder-image-dry-run.png",
      idempotencyKey: "auto-builder-drive-upload-image-dry-run"
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }

  if (dryRun === "moveFile") {
    return NextResponse.json({
      ok: true,
      productionActionAllowed: false,
      status: "dry_run_pass",
      tool: "drive_move_file",
      mode: "dry_run",
      blocker: null,
      receiptId: null,
      result: {
        sourceFileId: "dry-run-file-id-placeholder",
        destinationFolderAlias: "auto_social_delivery_assets",
        destinationFolderId: AUTO_WORKFLOW_CANONICAL_FOLDERS.auto_social_delivery_assets,
        wouldMoveFile: true,
        wouldListFolder: false,
        noMutationPerformed: true
      },
      recorded: null,
      note: "Move-file dry-run validates canonical destination routing only. Live move requires approved=true, approvalId, approvalPhrase, sourceFileId, and destinationFolderAlias or destinationFolderIdOrUrl."
    });
  }

  if (approvalProbe === "1") {
    const result = await runWave2DriveDryRun({
      mode: "approved_write",
      tool: "drive_put_file",
      sourceText: "AUTO BUILDER approved write probe",
      targetFolderAlias: "auto_social_receipts",
      targetName: "auto-builder-approved-write-probe.txt",
      uploadMode: "raw"
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }

  if (approvedScaffold === "1") {
    try {
      const requestedRootFolderId = getRequestedRootFolderId(request);
      const rootBlocker = assertAutoWorkflowRoot(requestedRootFolderId);
      if (rootBlocker) return rootBlocker;

      const filesEnabled = request.nextUrl.searchParams.get("files") !== "false";
      const result = await runApprovedDriveScaffoldWrite({
        ...buildApprovedDriveScaffoldPayload(),
        approved: request.nextUrl.searchParams.get("approved") === "true",
        approvalId: request.nextUrl.searchParams.get("approvalId") ?? undefined,
        approvalPhrase: request.nextUrl.searchParams.get("approvalPhrase") ?? undefined,
        root_folder_id: requestedRootFolderId,
        create_readme_files: filesEnabled,
        create_admin_control_pack: filesEnabled
      });
      return NextResponse.json(result, { status: result.ok ? 200 : 409 });
    } catch (error) {
      return scaffoldErrorResponse(error);
    }
  }

  if (approvedTool) {
    if (!APPROVED_TOOL_NAMES.has(approvedTool)) {
      return NextResponse.json({
        ok: false,
        productionActionAllowed: false,
        status: "blocked_unsupported_drive_tool",
        tool: approvedTool,
        allowedTools: [...APPROVED_TOOL_NAMES],
        noMutationPerformed: true
      }, { status: 409 });
    }

    try {
      const result = await runApprovedDriveToolWrite(getApprovedToolPayload(request));
      return NextResponse.json(result, { status: result.ok ? 200 : 409 });
    } catch (error) {
      return scaffoldErrorResponse(error);
    }
  }

  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    tools: wave2DriveTools,
    mode: "dry_run_ready",
    canonicalFolders: AUTO_WORKFLOW_CANONICAL_FOLDERS,
    sampleDryRun: "/api/mcp-universe/wave-2/drive?dryRun=sample",
    fullScaffoldDryRun: "/api/mcp-universe/wave-2/drive?dryRun=fullScaffold",
    createFolderDryRun: "/api/mcp-universe/wave-2/drive?dryRun=createFolder",
    putFileDryRun: "/api/mcp-universe/wave-2/drive?dryRun=putFile",
    uploadImageDryRun: "/api/mcp-universe/wave-2/drive?dryRun=uploadImage",
    moveFileDryRun: "/api/mcp-universe/wave-2/drive?dryRun=moveFile",
    approvalProbe: "/api/mcp-universe/wave-2/drive?approvalProbe=1",
    approvedToolGet: {
      method: "GET",
      tools: ["drive_put_file", "drive_upload_file", "drive_upload_image", "drive_move_file", "drive_list_folder", "drive_write_receipt"],
      required: {
        approvedTool: "drive_put_file | drive_upload_file | drive_upload_image | drive_move_file | drive_list_folder | drive_write_receipt",
        approved: true,
        approvalId: "operator approval id",
        approvalPhrase: APPROVED_DRIVE_TOOL_WRITE_PHRASE
      },
      note: "GET harness exists for connected MCP/Vercel evidence tools that cannot POST. It calls the same approved Drive tool writer and uses the same allowlist/approval gate."
    },
    approvedToolPost: {
      method: "POST",
      tools: ["drive_put_file", "drive_upload_file", "drive_upload_image", "drive_move_file", "drive_list_folder", "drive_write_receipt"],
      approvalPhrase: APPROVED_DRIVE_TOOL_WRITE_PHRASE,
      targetFolders: "Use canonical folder aliases from canonicalFolders or explicit folder IDs.",
      note: "Mutating Drive tool writes require approved=true, approvalId, and approvalPhrase. drive_list_folder is read-only. Deletes, renames, publishes, payments, live social, adult-content release, and customer messaging are not supported."
    },
    approvedScaffoldPost: {
      method: "POST",
      required: {
        mode: "approved_write",
        tool: "run_drive_job",
        approved: true,
        approvalPhrase: "APPROVE DRIVE SCAFFOLD WRITE",
        root_folder_id: AUTO_WORKFLOW_ROOT_FOLDER_ID
      },
      note: "Creates missing folders plus readable Google Docs README/admin-control files inside AUTO WORKFLOW only. No delete, rename, move, publish, deploy, payment, live social, adult-content, or customer-message action is performed."
    },
    approvedScaffoldGet: {
      method: "GET",
      folderOnlyPath: `/api/mcp-universe/wave-2/drive?approvedScaffold=1&approved=true&files=false&rootFolderId=${AUTO_WORKFLOW_ROOT_FOLDER_ID}&approvalId=<id>&approvalPhrase=APPROVE%20DRIVE%20SCAFFOLD%20WRITE`,
      autoWorkflowRootFolderId: AUTO_WORKFLOW_ROOT_FOLDER_ID,
      note: "Approved scaffold GET is constrained to the existing AUTO WORKFLOW root folder. No outside/root-level folder creation is allowed. files=false creates the folder tree without starter docs."
    },
    note: "GET supports dry-runs and guarded AUTO WORKFLOW approved scaffold execution. POST executes approved canonical Drive file operations or validates custom Drive payloads."
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, productionActionAllowed: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  if (payload.mode === "approved_write" && payload.tool === "run_drive_job") {
    const requestedRootFolderId = getPayloadRootFolderId(payload);
    const rootBlocker = assertAutoWorkflowRoot(requestedRootFolderId);
    if (rootBlocker) return rootBlocker;

    try {
      const result = await runApprovedDriveScaffoldWrite({
        ...buildApprovedDriveScaffoldPayload(),
        ...payload,
        root_folder_id: requestedRootFolderId
      });
      return NextResponse.json(result, { status: result.ok ? 200 : 409 });
    } catch (error) {
      return scaffoldErrorResponse(error);
    }
  }

  if (payload.mode === "approved_write" && typeof payload.tool === "string" && APPROVED_TOOL_NAMES.has(payload.tool)) {
    try {
      const result = await runApprovedDriveToolWrite(payload);
      return NextResponse.json(result, { status: result.ok ? 200 : 409 });
    } catch (error) {
      return scaffoldErrorResponse(error);
    }
  }

  if ((payload.tool === "drive_list_folder" || payload.tool === "drive_list_tree") && payload.mode !== "approved_write") {
    try {
      const result = await runApprovedDriveToolWrite(payload);
      return NextResponse.json(result, { status: result.ok ? 200 : 409 });
    } catch (error) {
      return scaffoldErrorResponse(error);
    }
  }

  const result = await runWave2DriveDryRun(payload);
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}

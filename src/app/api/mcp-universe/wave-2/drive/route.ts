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

export const runtime = "nodejs";

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

export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get("dryRun");
  const approvalProbe = request.nextUrl.searchParams.get("approvalProbe");
  const approvedScaffold = request.nextUrl.searchParams.get("approvedScaffold");

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

  if (approvedScaffold === "1") {
    try {
      const filesEnabled = request.nextUrl.searchParams.get("files") !== "false";
      const result = await runApprovedDriveScaffoldWrite({
        ...buildApprovedDriveScaffoldPayload(),
        approved: request.nextUrl.searchParams.get("approved") === "true",
        approvalId: request.nextUrl.searchParams.get("approvalId") ?? undefined,
        approvalPhrase: request.nextUrl.searchParams.get("approvalPhrase") ?? undefined,
        root_folder_id: getRequestedRootFolderId(request),
        create_readme_files: filesEnabled,
        create_admin_control_pack: filesEnabled
      });
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
    sampleDryRun: "/api/mcp-universe/wave-2/drive?dryRun=sample",
    fullScaffoldDryRun: "/api/mcp-universe/wave-2/drive?dryRun=fullScaffold",
    createFolderDryRun: "/api/mcp-universe/wave-2/drive?dryRun=createFolder",
    approvalProbe: "/api/mcp-universe/wave-2/drive?approvalProbe=1",
    approvedScaffoldPost: {
      method: "POST",
      required: {
        mode: "approved_write",
        tool: "run_drive_job",
        approved: true,
        approvalPhrase: "APPROVE DRIVE SCAFFOLD WRITE"
      },
      note: "Creates missing folders plus readable Google Docs README/admin-control files. No delete, rename, move, publish, deploy, payment, live social, adult-content, or customer-message action is performed."
    },
    approvedScaffoldGet: {
      method: "GET",
      path: "/api/mcp-universe/wave-2/drive?approvedScaffold=1&approved=true&rootFolderId=<folderId>&approvalId=<id>&approvalPhrase=APPROVE%20DRIVE%20SCAFFOLD%20WRITE",
      folderOnlyPath: "/api/mcp-universe/wave-2/drive?approvedScaffold=1&approved=true&files=false&rootFolderId=<folderId>&approvalId=<id>&approvalPhrase=APPROVE%20DRIVE%20SCAFFOLD%20WRITE",
      autoWorkflowFolderOnlyPath: "/api/mcp-universe/wave-2/drive?approvedScaffold=1&approved=true&files=false&rootFolderId=13VaSbBlwHGAV_8E48a-dpZD25iwQbWTM&approvalId=<id>&approvalPhrase=APPROVE%20DRIVE%20SCAFFOLD%20WRITE",
      note: "Fallback for tool runtimes that can fetch Vercel GET URLs but cannot issue POST. Same approval phrase and safety limits apply. files=false creates the folder tree without starter docs. rootFolderId lets AUTO WORKFLOW be scaffolded directly."
    },
    note: "GET supports canonical Eden/AUTO SOCIAL full scaffold dry-run and guarded approved scaffold execution. POST validates custom Drive payloads or executes the approved full scaffold writer when the exact approval payload is supplied."
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, productionActionAllowed: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  if (payload.mode === "approved_write" && payload.tool === "run_drive_job") {
    try {
      const result = await runApprovedDriveScaffoldWrite({
        ...buildApprovedDriveScaffoldPayload(),
        ...payload
      });
      return NextResponse.json(result, { status: result.ok ? 200 : 409 });
    } catch (error) {
      return scaffoldErrorResponse(error);
    }
  }

  const result = await runWave2DriveDryRun(payload);
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}

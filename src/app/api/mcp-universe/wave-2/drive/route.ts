import { NextRequest, NextResponse } from "next/server";
import { driveCreateFolder } from "@/lib/autobuilder-v2/drive-job-runner";
import { runWave2DriveDryRun, wave2DriveTools } from "@/lib/autobuilder-v2/mcp-universe/wave-2-adapters";

export const runtime = "nodejs";

const autoBuilderMasterFolderId = "1JAmLjo4UiD567C0Z_ogBxo3NELJK8L80";
const autoWorkflowFolderId = "13VaSbBlwHGAV_8E48a-dpZD25iwQbWTM";
const liveScaffoldApprovalId = "jeremy-auto-workflow-scaffold-20260609";

const autoWorkflowScaffold = [
  { name: "00_COMMAND_CENTER", children: ["Runbooks", "Daily Control", "Operator Notes"] },
  { name: "01_INTAKE_AND_DISCOVERY", children: ["Ideas", "Signals", "Requirements", "Source Context"] },
  { name: "02_WORKFLOW_LIBRARY", children: ["Universal Workflows", "Revenue Workflows", "Content Workflows", "Build Workflows"] },
  { name: "03_AUTOMATION_BLUEPRINTS", children: ["Trigger Maps", "Step Maps", "Data Contracts", "Fallback Paths"] },
  { name: "04_AGENT_ORCHESTRATION", children: ["Agent Roles", "Prompt Chains", "Handoffs", "Escalations"] },
  { name: "05_CONNECTOR_STACK", children: ["GitHub", "Vercel", "Supabase", "Google Drive", "Slack", "Shopify", "HeyGen"] },
  { name: "06_AUTO_BUILDER_HANDOFFS", children: ["Builder Packets", "PR Evidence", "Deployment Evidence", "Release Handoffs"] },
  { name: "07_AUTO_SOCIAL_HANDOFFS", children: ["Content Queue", "Approval Queue", "Publishing Receipts", "Winner Signals"] },
  { name: "08_CONTENT_TO_WORKFLOW_PIPELINE", children: ["Hooks", "Scripts", "Assets", "Repurposing", "Distribution"] },
  { name: "09_APPROVALS_AND_GOVERNANCE", children: ["Approval Requests", "Blocked Actions", "Policy", "Rollback Plans"] },
  { name: "10_RECEIPTS_AND_AUDIT", children: ["Dry Run Receipts", "Live Receipts", "Telemetry", "No Secret Evidence"] },
  { name: "11_ANALYTICS_AND_KPI", children: ["KPI Scorecards", "UTM Tracking", "Revenue Attribution", "Optimization Reviews"] },
  { name: "12_TEMPLATES_AND_PROMPTS", children: ["Workflow Prompts", "Agent Prompts", "Document Templates", "Checklist Templates"] },
  { name: "13_RELEASE_AND_DEPLOYMENT", children: ["Preview Evidence", "Production Gates", "Changelogs", "Post Release Reviews"] },
  { name: "14_RISK_RECOVERY", children: ["Risk Register", "Incident Notes", "Recovery Playbooks", "Kill Switches"] },
  { name: "15_BACKLOG_AND_REPLICATION", children: ["Backlog", "Replication Candidates", "Scale Reviews", "Archive"] }
] as const;

type CreatedFolderResult = {
  ok?: boolean;
  validation_status?: string;
  created_folder?: { id?: string; name?: string; webViewLink?: string; parents?: string[] };
  blocked_operations?: unknown[];
  failed_operations?: unknown[];
  receipts?: unknown[];
};

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

async function runAutoWorkflowScaffold(request: NextRequest) {
  const parentFolderId = request.nextUrl.searchParams.get("parentFolderId");
  const masterFolderId = request.nextUrl.searchParams.get("masterFolderId");
  const approvalId = request.nextUrl.searchParams.get("approvalId");

  if (parentFolderId !== autoWorkflowFolderId || masterFolderId !== autoBuilderMasterFolderId || approvalId !== liveScaffoldApprovalId) {
    return NextResponse.json({
      ok: false,
      productionActionAllowed: false,
      status: "blocked",
      blocker: "Approved Auto Workflow scaffold requires the exact master folder id, Auto Workflow parent folder id, and approval id.",
      expected: {
        masterFolderId: autoBuilderMasterFolderId,
        parentFolderId: autoWorkflowFolderId,
        approvalId: liveScaffoldApprovalId
      },
      noMutationPerformed: true
    }, { status: 409 });
  }

  const topLevelResults = [];
  const childResults = [];

  for (const section of autoWorkflowScaffold) {
    const top = await createApprovedFolder(section.name, autoWorkflowFolderId);
    topLevelResults.push(top);

    const topId = top.folder?.id;
    if (!top.ok || !topId) continue;

    for (const childName of section.children) {
      childResults.push(await createApprovedFolder(childName, topId));
    }
  }

  const allResults = [...topLevelResults, ...childResults];
  const failures = allResults.filter((item) => !item.ok);

  return NextResponse.json({
    ok: failures.length === 0,
    productionActionAllowed: true,
    status: failures.length === 0 ? "scaffold_created" : "partial_scaffold_created",
    approvalId,
    masterFolderId,
    parentFolderId,
    parentFolderUrl: `https://drive.google.com/drive/folders/${autoWorkflowFolderId}`,
    sourceGuide: {
      autoSocialWorkbook: "Eden Skye Auto Social MAX Revised OS v1 - 2026-06-07",
      autoSocialWorkbookId: "16abS0dwSDs1H33P4FE05RBBukWAHpxq1mWMq3B4H2qA"
    },
    createdCount: allResults.filter((item) => item.ok).length,
    failureCount: failures.length,
    topLevelResults,
    childResults,
    failures,
    noSupabaseSchemaChange: true,
    noCronActivation: true,
    noWorkflowActivation: true,
    noAdapterWidening: true
  }, { status: failures.length === 0 ? 200 : 207 });
}

export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get("dryRun");
  const approvalProbe = request.nextUrl.searchParams.get("approvalProbe");
  const liveScaffold = request.nextUrl.searchParams.get("liveScaffold");

  if (liveScaffold === "autoWorkflow") {
    return runAutoWorkflowScaffold(request);
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

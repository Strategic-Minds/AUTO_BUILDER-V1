import { NextResponse } from "next/server";

import { runExecutionWorker } from "@/lib/execution-worker";

export const runtime = "nodejs";
export const maxDuration = 300;

const folderManifest = [
  "AUTO SOCIAL/00 Source Truth",
  "AUTO SOCIAL/01 Builder Docs",
  "AUTO SOCIAL/02 Active Builds",
  "AUTO SOCIAL/03 Receipts",
  "AUTO SOCIAL/04 Delivery Assets",
  "AUTO SOCIAL/05 Governance",
  "AUTO SOCIAL/06 Workflow Spine/WF-001 PLAN",
  "AUTO SOCIAL/06 Workflow Spine/WF-002 DISCOVERY",
  "AUTO SOCIAL/06 Workflow Spine/WF-003 STRATEGY",
  "AUTO SOCIAL/06 Workflow Spine/WF-004 CREATE",
  "AUTO SOCIAL/06 Workflow Spine/WF-005 REVIEW",
  "AUTO SOCIAL/06 Workflow Spine/WF-006 SCHEDULE",
  "AUTO SOCIAL/06 Workflow Spine/WF-007 POST",
  "AUTO SOCIAL/06 Workflow Spine/WF-008 ANALYZE",
  "AUTO SOCIAL/06 Workflow Spine/WF-009 IMPROVE",
  "AUTO SOCIAL/07 Stack Registry",
  "AUTO SOCIAL/08 ENV Registry",
  "AUTO SOCIAL/09 Agent Registry",
  "AUTO SOCIAL/10 Content Calendar",
  "AUTO SOCIAL/11 Campaign Tracker",
  "AUTO SOCIAL/12 Publishing Queue",
  "AUTO SOCIAL/13 Model Systems",
  "AUTO SOCIAL/14 Media Engine/Image Prompts",
  "AUTO SOCIAL/14 Media Engine/Video Prompts",
  "AUTO SOCIAL/14 Media Engine/HeyGen Jobs",
  "AUTO SOCIAL/14 Media Engine/Higgsfield Jobs",
  "AUTO SOCIAL/14 Media Engine/Xyla Jobs",
  "AUTO SOCIAL/14 Media Engine/Generated Images",
  "AUTO SOCIAL/14 Media Engine/Generated Videos",
  "AUTO SOCIAL/15 Social Channels/Facebook",
  "AUTO SOCIAL/15 Social Channels/Instagram",
  "AUTO SOCIAL/15 Social Channels/Snapchat",
  "AUTO SOCIAL/15 Social Channels/Pinterest",
  "AUTO SOCIAL/15 Social Channels/TikTok",
  "AUTO SOCIAL/15 Social Channels/X",
  "AUTO SOCIAL/15 Social Channels/YouTube",
  "AUTO SOCIAL/16 Validation",
  "AUTO SOCIAL/17 Approval Requests",
  "AUTO SOCIAL/18 Legal Compliance",
  "AUTO SOCIAL/19 Financial Strategy",
  "AUTO SOCIAL/20 Business Plan",
  "EDEN SKYE STUDIOS/00 Source Truth",
  "EDEN SKYE STUDIOS/01 Builder Docs",
  "EDEN SKYE STUDIOS/02 Active Builds",
  "EDEN SKYE STUDIOS/03 Receipts",
  "EDEN SKYE STUDIOS/04 Delivery Assets",
  "EDEN SKYE STUDIOS/05 Governance",
  "EDEN SKYE STUDIOS/06 Business Control",
  "EDEN SKYE STUDIOS/07 Brand System",
  "EDEN SKYE STUDIOS/08 Website Mockups",
  "EDEN SKYE STUDIOS/09 Website Content Machine",
  "EDEN SKYE STUDIOS/10 Model System/00 Contact Sheets",
  "EDEN SKYE STUDIOS/10 Model System/01 Roster Preview",
  "EDEN SKYE STUDIOS/10 Model System/Male Models Primary/25-50",
  "EDEN SKYE STUDIOS/10 Model System/Male Models Primary/50-80",
  "EDEN SKYE STUDIOS/10 Model System/Male Models Primary/International 18-35",
  "EDEN SKYE STUDIOS/10 Model System/Female Models/25-50",
  "EDEN SKYE STUDIOS/10 Model System/Female Models/50-80",
  "EDEN SKYE STUDIOS/10 Model System/Female Models/International 18-35",
  "EDEN SKYE STUDIOS/10 Model System/Mature Models 50-80",
  "EDEN SKYE STUDIOS/10 Model System/International Models 18-35",
  "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Luxury Lifestyle",
  "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/AI Business",
  "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Men's Style",
  "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Travel POV",
  "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Fitness",
  "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Wealth Mindset",
  "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Eden Closet",
  "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Black Card",
  "EDEN SKYE STUDIOS/10 Model System/Model Registry",
  "EDEN SKYE STUDIOS/10 Model System/Shopify Card Map",
  "EDEN SKYE STUDIOS/10 Model System/Xyla Feed Records",
  "EDEN SKYE STUDIOS/10 Model System/Metricool Draft Prompts",
  "EDEN SKYE STUDIOS/11 Eden Closet Black Card",
  "EDEN SKYE STUDIOS/12 18 Plus Membership Routing",
  "EDEN SKYE STUDIOS/13 Xyla Feeds",
  "EDEN SKYE STUDIOS/14 Media Generation/Image Prompts",
  "EDEN SKYE STUDIOS/14 Media Generation/Video Prompts",
  "EDEN SKYE STUDIOS/14 Media Generation/HeyGen",
  "EDEN SKYE STUDIOS/14 Media Generation/Higgsfield",
  "EDEN SKYE STUDIOS/14 Media Generation/Xyla",
  "EDEN SKYE STUDIOS/14 Media Generation/Generated Images",
  "EDEN SKYE STUDIOS/14 Media Generation/Generated Videos",
  "EDEN SKYE STUDIOS/15 Content Calendar",
  "EDEN SKYE STUDIOS/16 Metricool Drafts",
  "EDEN SKYE STUDIOS/17 Supabase Runtime",
  "EDEN SKYE STUDIOS/18 Social Channels/Facebook",
  "EDEN SKYE STUDIOS/18 Social Channels/Instagram",
  "EDEN SKYE STUDIOS/18 Social Channels/Snapchat",
  "EDEN SKYE STUDIOS/18 Social Channels/Pinterest",
  "EDEN SKYE STUDIOS/18 Social Channels/TikTok",
  "EDEN SKYE STUDIOS/18 Social Channels/X",
  "EDEN SKYE STUDIOS/18 Social Channels/YouTube",
  "EDEN SKYE STUDIOS/19 Analytics Optimization",
  "EDEN SKYE STUDIOS/20 Validation",
  "EDEN SKYE STUDIOS/21 Approval Requests",
  "EDEN SKYE STUDIOS/22 Website Build Packets"
];

const blockedActions = ["delete", "rename_existing", "move_existing", "publish", "deploy", "payment", "live_social"];

function summarizeReceipt(receipt: Record<string, unknown>) {
  const folderResults = Array.isArray(receipt.folder_results) ? receipt.folder_results : [];
  let exists = 0;
  let wouldCreate = 0;
  let missing = 0;
  let created = 0;

  for (const result of folderResults) {
    if (!result || typeof result !== "object" || !("steps" in result) || !Array.isArray(result.steps)) continue;
    for (const step of result.steps) {
      if (!step || typeof step !== "object" || !("status" in step)) continue;
      if (step.status === "exists") exists += 1;
      if (step.status === "would_create") wouldCreate += 1;
      if (step.status === "missing") missing += 1;
      if (step.status === "created") created += 1;
    }
  }

  return {
    job_id: receipt.job_id,
    mode: receipt.mode,
    status: receipt.status,
    folder_manifest_count: receipt.folder_manifest_count,
    upload_file_count: receipt.upload_file_count,
    step_counts: { exists, would_create: wouldCreate, missing, created },
    blocked_count: Array.isArray(receipt.blocked) ? receipt.blocked.length : 0,
    timestamp: receipt.timestamp
  };
}

function readChunk(url: URL) {
  const requestedChunk = Number(url.searchParams.get("chunk") ?? "0");
  const requestedSize = Number(url.searchParams.get("size") ?? "10");
  const size = Number.isFinite(requestedSize) ? Math.min(Math.max(Math.floor(requestedSize), 1), 20) : 10;
  const chunk = Number.isFinite(requestedChunk) ? Math.max(Math.floor(requestedChunk), 0) : 0;
  const start = chunk * size;
  const end = Math.min(start + size, folderManifest.length);
  return {
    chunk,
    size,
    start,
    end,
    total: folderManifest.length,
    total_chunks: Math.ceil(folderManifest.length / size),
    manifest: folderManifest.slice(start, end)
  };
}

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ status: "blocked", reason: "Drive scaffold approved-write route is disabled in production." }, { status: 403 });
  }

  const url = new URL(request.url);
  const chunkInfo = readChunk(url);
  if (chunkInfo.manifest.length === 0) {
    return NextResponse.json({
      status: "ok",
      action: "drive.runDriveJob",
      summary: {
        job_id: "master-auto-builder-drive-scaffold-001-approved-write",
        mode: "approved_write",
        status: "approved_write_complete",
        folder_manifest_count: 0,
        upload_file_count: 0,
        step_counts: { exists: 0, would_create: 0, missing: 0, created: 0 },
        blocked_count: 0,
        timestamp: new Date().toISOString()
      },
      chunk: chunkInfo,
      complete: true
    });
  }

  const result = await runExecutionWorker({
    action: "drive.runDriveJob",
    approved: true,
    token: process.env.AUTO_BUILDER_WORKER_TOKEN,
    payload: {
      job_id: `master-auto-builder-drive-scaffold-001-approved-write-chunk-${chunkInfo.chunk}`,
      mode: "approved_write",
      root_folder_id: "1JAmLjo4UiD567C0Z_ogBxo3NELJK8L80",
      root_folder_name: "MASTER AUTO BUILDER",
      create_missing_folders: true,
      write_receipts: false,
      validate_tree: true,
      folder_manifest: chunkInfo.manifest,
      blocked_actions: blockedActions
    }
  });

  const summary = summarizeReceipt(result.receipt);
  return NextResponse.json(
    {
      status: result.status,
      action: result.action,
      summary,
      chunk: chunkInfo,
      complete: chunkInfo.end >= chunkInfo.total,
      next_chunk_url: chunkInfo.end >= chunkInfo.total ? null : `/api/cron/drive-scaffold-approved-write?chunk=${chunkInfo.chunk + 1}&size=${chunkInfo.size}`,
      approval_record: "Operator replied APPROVED after dry-run PASS for PR #21 97-path scaffold.",
      mutation_scope: "Create missing folders only. No uploads, moves, deletes, publishing, deployment, payment, or live social action.",
      error: result.status === "error" ? result.receipt.message : undefined,
      blocked_reason: result.status === "blocked" ? result.receipt.reason : undefined
    },
    { status: result.status === "error" ? 500 : result.status === "blocked" ? 403 : 200 }
  );
}

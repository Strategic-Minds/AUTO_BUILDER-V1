import { createMcpUniverseReceipt, recordMcpUniverseReceipt } from "./receipts";

export const wave2DriveTools = [
  "run_drive_job",
  "drive_list_tree",
  "drive_create_folder",
  "drive_upload_file",
  "drive_upload_image",
  "drive_move_file",
  "drive_move_folder",
  "drive_write_receipt"
] as const;

export const wave2VideoTools = [
  "run_video_job",
  "video_generate_draft",
  "video_lipsync_draft",
  "video_translate_draft",
  "video_status",
  "video_list_assets",
  "video_write_receipt",
  "video_quarantine_asset",
  "video_approve_asset"
] as const;

export const EDEN_SKYE_FULL_SCAFFOLD_MANIFEST = [
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
] as const;

type Wave2Mode = "dry_run" | "approved_write" | "approved_generation";

type DriveUploadMode = "raw" | "native_google_docs" | "native_google_sheets" | "native_google_slides";

type DriveJobInput = {
  mode?: Wave2Mode;
  tool?: string;
  approved?: boolean;
  approvalId?: string;
  sourceFileRef?: string;
  targetFolderIdOrUrl?: string;
  targetName?: string;
  uploadMode?: DriveUploadMode;
  idempotencyKey?: string;
  job_id?: string;
  root_folder_id?: string;
  root_folder_name?: string;
  create_missing_folders?: boolean;
  folder_manifest?: string[];
  upload_files?: unknown[];
  move_files?: unknown[];
  move_folders?: unknown[];
  write_receipts?: boolean;
  validate_tree?: boolean;
  blocked_actions?: string[];
};

type VideoJobInput = {
  mode?: Wave2Mode;
  tool?: string;
  approved?: boolean;
  approvalId?: string;
  provider?: "heygen" | "xyla" | "shopify_xyla" | "metricool" | "manual";
  modelId?: string;
  avatarId?: string;
  voiceId?: string;
  script?: string;
  aspectRatio?: "9:16" | "1:1" | "16:9";
  durationTargetSeconds?: number;
  platformTarget?: "instagram" | "tiktok" | "youtube_shorts" | "facebook" | "pinterest" | "website";
  driveTargetFolderIdOrUrl?: string;
  contentSafetyClass?: "public_safe" | "sensitive_review" | "quarantine";
};

function boolEnv(name: string) {
  return Boolean(process.env[name]);
}

function approvalMissing(input: { approved?: boolean; approvalId?: string }) {
  return input.approved !== true || typeof input.approvalId !== "string" || input.approvalId.length < 4;
}

function hasFolderManifest(input: DriveJobInput) {
  return Array.isArray(input.folder_manifest) && input.folder_manifest.length > 0;
}

function validateDriveDryRun(input: DriveJobInput) {
  const tool = input.tool ?? "drive_upload_file";
  const missing: string[] = [];

  if (!wave2DriveTools.includes(tool as (typeof wave2DriveTools)[number])) missing.push("known Drive tool");

  if (tool === "run_drive_job") {
    if (!input.root_folder_id && !input.targetFolderIdOrUrl) missing.push("root_folder_id or targetFolderIdOrUrl");
    if (input.create_missing_folders && !hasFolderManifest(input)) missing.push("folder_manifest");
    return missing;
  }

  if (["drive_upload_file", "drive_upload_image"].includes(tool) && !input.sourceFileRef) missing.push("sourceFileRef");
  if (["drive_upload_file", "drive_upload_image", "drive_create_folder"].includes(tool) && !input.targetFolderIdOrUrl) missing.push("targetFolderIdOrUrl");
  if (["drive_create_folder", "drive_upload_file", "drive_upload_image"].includes(tool) && !input.targetName) missing.push("targetName");
  if (tool === "drive_upload_file" && !input.uploadMode) missing.push("uploadMode");

  return missing;
}

function validateVideoDryRun(input: VideoJobInput) {
  const tool = input.tool ?? "video_generate_draft";
  const missing: string[] = [];

  if (!wave2VideoTools.includes(tool as (typeof wave2VideoTools)[number])) missing.push("known video tool");
  if (["video_generate_draft", "run_video_job"].includes(tool) && !input.provider) missing.push("provider");
  if (["video_generate_draft", "run_video_job"].includes(tool) && !input.modelId) missing.push("modelId");
  if (["video_generate_draft", "run_video_job"].includes(tool) && !input.script) missing.push("script");
  if (["video_generate_draft", "run_video_job"].includes(tool) && !input.aspectRatio) missing.push("aspectRatio");
  if (["video_generate_draft", "run_video_job"].includes(tool) && !input.platformTarget) missing.push("platformTarget");
  if (["video_generate_draft", "run_video_job"].includes(tool) && !input.contentSafetyClass) missing.push("contentSafetyClass");

  return missing;
}

export function buildEdenSkyeFullScaffoldDriveJob(): DriveJobInput {
  return {
    job_id: "master-auto-builder-drive-scaffold-001",
    mode: "dry_run",
    tool: "run_drive_job",
    root_folder_id: "1JAmLjo4UiD567C0Z_ogBxo3NELJK8L80",
    root_folder_name: "MASTER AUTO BUILDER",
    create_missing_folders: true,
    folder_manifest: [...EDEN_SKYE_FULL_SCAFFOLD_MANIFEST],
    upload_files: [],
    move_files: [],
    move_folders: [],
    write_receipts: true,
    validate_tree: true,
    blocked_actions: ["delete", "rename_existing", "move_existing", "publish", "deploy", "payment", "live_social"],
    idempotencyKey: "master-auto-builder-drive-scaffold-001-full-dry-run"
  };
}

export function getWave2Health() {
  return {
    ok: true,
    productionActionAllowed: false,
    secretsExposed: false,
    googleDrive: {
      tools: wave2DriveTools,
      readEnvReady: boolEnv("GOOGLE_CLIENT_EMAIL") && boolEnv("GOOGLE_PRIVATE_KEY"),
      fullScaffoldDryRun: "ready",
      createFolder: "dry_run_ready",
      uploadFile: "dry_run_ready",
      uploadImage: "dry_run_ready",
      nativeDocsImport: "dry_run_ready",
      nativeSheetsImport: "dry_run_ready",
      nativeSlidesImport: "dry_run_ready",
      writeReceipt: "ready"
    },
    videoGeneration: {
      tools: wave2VideoTools,
      heygenEnvReady: boolEnv("HEYGEN_API_KEY"),
      xylaEnvReady: boolEnv("XYLA_API_KEY") || (boolEnv("SHOPIFY_ADMIN_TOKEN") && (boolEnv("SHOPIFY_SHOP") || boolEnv("SHOPIFY_STORE_DOMAIN"))),
      metricoolEnvReady: (boolEnv("METRICOOL_API_URL") || boolEnv("METRICOOL_BASE_URL")) && (boolEnv("METRICOOL_API_TOKEN") || boolEnv("METRICOOL_API_KEY") || boolEnv("METRICOOL_TOKEN")),
      readProviders: true,
      createDraftVideo: "dry_run_ready",
      pollStatus: "dry_run_ready",
      writeReceipt: "ready",
      driveArchive: "blocked_until_drive_approved_write",
      quarantine: "ready",
      approvalGate: true
    }
  };
}

export async function runWave2DriveDryRun(input: DriveJobInput) {
  const mode = input.mode ?? "dry_run";
  const tool = input.tool ?? "drive_upload_file";
  const missing = validateDriveDryRun({ ...input, tool });
  const blocked = mode !== "dry_run" && approvalMissing(input);
  const liveWriteUnavailable = mode !== "dry_run" && !process.env.WAVE2_DRIVE_APPROVED_WRITE_ENABLED;
  const status = missing.length > 0 || blocked || liveWriteUnavailable ? "blocked" : "dry_run_pass";
  const blocker = missing.length > 0
    ? `Missing required fields: ${missing.join(", ")}`
    : blocked
      ? "Approved Drive write requested without approved=true and approvalId."
      : liveWriteUnavailable
        ? "Approved Drive writes remain disabled until WAVE2_DRIVE_APPROVED_WRITE_ENABLED is configured and operator approval is recorded."
        : null;

  const receipt = createMcpUniverseReceipt({
    mcpId: "wave-2-drive-adapter",
    category: "system",
    action: `${tool}_${mode}`,
    autonomyLevel: mode === "dry_run" ? 2 : 4,
    riskClass: mode === "dry_run" ? "low" : "high",
    approvalState: status === "blocked" ? "blocked" : "not_required",
    target: "/api/mcp-universe/wave-2/drive",
    resultSummary: status === "dry_run_pass" ? "Drive Wave 2 payload validated in dry-run mode; no Drive mutation performed." : "Drive Wave 2 request blocked before mutation.",
    validationStatus: status === "dry_run_pass" ? "passed" : "blocked",
    rollbackRef: null,
    nextAction: status === "dry_run_pass" ? "Run approved Drive write only after explicit operator approval." : "Fix blocker, then rerun dry-run.",
    inputs: { ...input, secretValues: "redacted" }
  });
  const recorded = await recordMcpUniverseReceipt(receipt);
  const folderManifestCount = Array.isArray(input.folder_manifest) ? input.folder_manifest.length : 0;

  return {
    ok: status === "dry_run_pass",
    productionActionAllowed: false,
    status,
    tool,
    mode,
    blocker,
    receiptId: receipt.receiptId,
    result: {
      jobId: input.job_id ?? null,
      rootFolderId: input.root_folder_id ?? null,
      rootFolderName: input.root_folder_name ?? null,
      wouldCreateMissingFolders: tool === "run_drive_job" && input.create_missing_folders === true,
      folderManifestCount,
      sampleFolders: input.folder_manifest?.slice(0, 8) ?? [],
      uploadFileCount: Array.isArray(input.upload_files) ? input.upload_files.length : input.sourceFileRef ? 1 : 0,
      moveFileCount: Array.isArray(input.move_files) ? input.move_files.length : 0,
      moveFolderCount: Array.isArray(input.move_folders) ? input.move_folders.length : 0,
      wouldCreateFolder: tool === "drive_create_folder",
      wouldUploadFile: tool === "drive_upload_file",
      wouldUploadImage: tool === "drive_upload_image",
      uploadMode: input.uploadMode ?? null,
      targetFolderIdOrUrl: input.targetFolderIdOrUrl ?? input.root_folder_id ?? null,
      targetName: input.targetName ?? null,
      validateTree: input.validate_tree ?? false,
      writeReceipts: input.write_receipts ?? false,
      blockedActions: input.blocked_actions ?? [],
      noMutationPerformed: true
    },
    recorded
  };
}

export async function runWave2VideoDryRun(input: VideoJobInput) {
  const mode = input.mode ?? "dry_run";
  const tool = input.tool ?? "video_generate_draft";
  const missing = validateVideoDryRun({ ...input, tool });
  const blocked = mode !== "dry_run" && approvalMissing(input);
  const liveGenerationUnavailable = mode !== "dry_run" && !process.env.WAVE2_VIDEO_APPROVED_GENERATION_ENABLED;
  const status = missing.length > 0 || blocked || liveGenerationUnavailable ? "blocked" : "dry_run_pass";
  const blocker = missing.length > 0
    ? `Missing required fields: ${missing.join(", ")}`
    : blocked
      ? "Approved video generation requested without approved=true and approvalId."
      : liveGenerationUnavailable
        ? "Approved video generation remains disabled until WAVE2_VIDEO_APPROVED_GENERATION_ENABLED is configured and operator approval is recorded."
        : null;

  const receipt = createMcpUniverseReceipt({
    mcpId: "wave-2-video-adapter",
    category: "system",
    action: `${tool}_${mode}`,
    autonomyLevel: mode === "dry_run" ? 2 : 4,
    riskClass: mode === "dry_run" ? "low" : "high",
    approvalState: status === "blocked" ? "blocked" : "not_required",
    target: "/api/mcp-universe/wave-2/video",
    resultSummary: status === "dry_run_pass" ? "Video Wave 2 payload validated in dry-run mode; no paid generation performed." : "Video Wave 2 request blocked before generation.",
    validationStatus: status === "dry_run_pass" ? "passed" : "blocked",
    rollbackRef: null,
    nextAction: status === "dry_run_pass" ? "Request operator approval before any paid/provider-side generation." : "Fix blocker, then rerun dry-run.",
    inputs: { ...input, secretValues: "redacted" }
  });
  const recorded = await recordMcpUniverseReceipt(receipt);

  return {
    ok: status === "dry_run_pass",
    productionActionAllowed: false,
    status,
    tool,
    mode,
    blocker,
    receiptId: receipt.receiptId,
    result: {
      provider: input.provider ?? null,
      modelId: input.modelId ?? null,
      avatarId: input.avatarId ?? null,
      voiceId: input.voiceId ?? null,
      aspectRatio: input.aspectRatio ?? null,
      durationTargetSeconds: input.durationTargetSeconds ?? null,
      platformTarget: input.platformTarget ?? null,
      contentSafetyClass: input.contentSafetyClass ?? null,
      noGenerationPerformed: true,
      draftOnly: true,
      publicApproved: false
    },
    recorded
  };
}

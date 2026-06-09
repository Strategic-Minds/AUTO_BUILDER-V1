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
};

type VideoJobInput = {
  mode?: Wave2Mode;
  tool?: string;
  approved?: boolean;
  approvalId?: string;
  provider?: "heygen" | "xyla" | "manual";
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

function validateDriveDryRun(input: DriveJobInput) {
  const tool = input.tool ?? "drive_upload_file";
  const missing: string[] = [];

  if (!wave2DriveTools.includes(tool as (typeof wave2DriveTools)[number])) missing.push("known Drive tool");
  if (["drive_upload_file", "drive_upload_image", "run_drive_job"].includes(tool) && !input.sourceFileRef) missing.push("sourceFileRef");
  if (["drive_upload_file", "drive_upload_image", "drive_create_folder", "run_drive_job"].includes(tool) && !input.targetFolderIdOrUrl) missing.push("targetFolderIdOrUrl");
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

export function getWave2Health() {
  return {
    ok: true,
    productionActionAllowed: false,
    secretsExposed: false,
    googleDrive: {
      tools: wave2DriveTools,
      readEnvReady: boolEnv("GOOGLE_CLIENT_EMAIL") && boolEnv("GOOGLE_PRIVATE_KEY"),
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
      xylaEnvReady: boolEnv("XYLA_API_KEY"),
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
    nextAction: status === "dry_run_pass" ? "Run approved sandbox upload only after explicit operator approval." : "Fix blocker, then rerun dry-run.",
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
      wouldCreateFolder: tool === "drive_create_folder",
      wouldUploadFile: tool === "drive_upload_file" || tool === "run_drive_job",
      wouldUploadImage: tool === "drive_upload_image",
      uploadMode: input.uploadMode ?? null,
      targetFolderIdOrUrl: input.targetFolderIdOrUrl ?? null,
      targetName: input.targetName ?? null,
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

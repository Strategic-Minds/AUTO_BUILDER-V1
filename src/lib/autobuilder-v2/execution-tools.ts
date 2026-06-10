import { driveCreateFolder as createDriveFolderWithAdapter, runDriveJob } from "./drive-job-runner";
import {
  createGithubRepo as createGithubRepoWithAdapter,
  createVercelProject as createVercelProjectWithAdapter,
  runPlatformProvisioningJob
} from "./platform-provisioning-runner";
import { runUniversalJob as runUniversalJobWithFallbacks } from "./universal-job-runner";

export const jobModes = ["read", "dry_run", "draft", "execute", "rollback"] as const;
export type JobMode = (typeof jobModes)[number];
type DriveRunMode = JobMode | "approved_write";

export type UniversalJobInput = {
  job_id: string;
  mode?: JobMode;
  action: string;
  target_system?: string;
  command_folder_id?: string;
  payload?: Record<string, unknown>;
  receipt?: Record<string, unknown>;
  rollback?: Record<string, unknown>;
};

export type ToolResult = {
  job_id: string;
  status: string;
  mode: JobMode;
  action?: string;
  target_system?: string;
  timestamp: string;
  receipt?: Record<string, unknown>;
  rollback?: Record<string, unknown>;
  data?: Record<string, unknown>;
  errors?: string[];
};

type JsonRecord = Record<string, unknown>;

export const defaultCommandFolderId = "13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr";

export const readInspectionToolNames = [
  "health_check",
  "get_repo_summary",
  "list_repo_files",
  "read_bootstrap_status",
  "read_text_file"
] as const;

export const autoBuilder2ExecutionToolNames = [
  "run_job",
  "run_universal_job",
  "run_drive_job",
  "drive_list_tree",
  "drive_create_folder",
  "drive_move_folder",
  "drive_move_file",
  "drive_write_receipt",
  "run_platform_provisioning_job",
  "create_github_repo",
  "create_vercel_project",
  "create_vercel_workflow",
  "create_vercel_agent",
  "create_ai_gateway",
  "rollback"
] as const;

export const expectedCallableMcpToolNames = [
  ...readInspectionToolNames,
  ...autoBuilder2ExecutionToolNames
] as const;

export const requiredEnvNames = [
  "AUTO_BUILDER_OPERATOR_TOKEN",
  "AUTO_BUILDER_BRIDGE_TOKEN",
  "GOOGLE_CLIENT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_DRIVE_ROOT_FOLDER_ID",
  "GITHUB_TOKEN",
  "GITHUB_ORG",
  "VERCEL_TOKEN",
  "VERCEL_TEAM_ID",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SHOPIFY_SHOP",
  "SHOPIFY_ADMIN_TOKEN",
  "AI_GATEWAY_API_KEY",
  "OPENAI_API_KEY",
  "GROQ_API_KEY"
] as const;

export const activeOperatingMap = {
  autoBuilderControlPlane: "Strategic-Minds/AUTO_BUILDER",
  edenAppRepo: "Strategic-Minds/EDENSKYESTUDIOS",
  vercelApp: "edenskyestudios",
  supabaseProject: "Strategic Minds Advisory",
  shopifyStore: "Eden Skye Studios",
  driveCommandFolder: "V2 MASTER AUTO BUILDER",
  driveCommandFolderId: defaultCommandFolderId
} as const;

const secretKeyPattern = /authorization|bearer|connection[_-]?string|password|private[_-]?key|secret|token|api[_-]?key/i;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function boolValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function recordArray(value: unknown): JsonRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord);
}

function normalizeMode(mode: unknown, fallback: JobMode = "dry_run"): JobMode {
  if (mode === "approved_write") return "execute";
  return typeof mode === "string" && jobModes.includes(mode as JobMode) ? (mode as JobMode) : fallback;
}

function normalizeDriveMode(mode: unknown): DriveRunMode {
  return mode === "approved_write" ? "approved_write" : normalizeMode(mode);
}

function existingRunnerMode(mode: JobMode): "dry_run" | "approval_gated" | "execute" {
  if (mode === "execute") return "execute";
  if (mode === "rollback") return "approval_gated";
  return "dry_run";
}

function commandFolderId(input: JsonRecord): string {
  return stringValue(input.command_folder_id) ?? stringValue(input.root_folder_id) ?? defaultCommandFolderId;
}

function jobId(input: JsonRecord, fallbackPrefix: string): string {
  return stringValue(input.job_id) ?? `${fallbackPrefix}-${Date.now()}`;
}

function secretValues() {
  return requiredEnvNames
    .map((name) => process.env[name])
    .filter((value): value is string => Boolean(value && value.length >= 8));
}

export function sanitizeForResponse(value: unknown): unknown {
  if (typeof value === "string") {
    return secretValues().includes(value) ? "[redacted]" : value;
  }

  if (Array.isArray(value)) return value.map((item) => sanitizeForResponse(item));

  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      secretKeyPattern.test(key) ? "[redacted]" : sanitizeForResponse(item)
    ])
  );
}

function sanitizeRecord(value: JsonRecord | undefined): JsonRecord {
  const sanitized = sanitizeForResponse(value ?? {});
  return isRecord(sanitized) ? sanitized : {};
}

function receiptFor(input: JsonRecord, status = "receipt_planned"): JsonRecord {
  const existing = isRecord(input.receipt) ? input.receipt : {};
  return sanitizeRecord({
    required: true,
    command_folder_id: commandFolderId(input),
    status,
    ...existing
  });
}

function rollbackFor(input: JsonRecord, status = "rollback_metadata_planned"): JsonRecord {
  const existing = isRecord(input.rollback) ? input.rollback : {};
  return sanitizeRecord({
    available: normalizeMode(input.mode) !== "read",
    status,
    ...existing
  });
}

export function result(input: {
  job_id: string;
  mode?: JobMode;
  action?: string;
  target_system?: string;
  status?: string;
  command_folder_id?: string;
  data?: JsonRecord;
  receipt?: JsonRecord;
  rollback?: JsonRecord;
  errors?: string[];
}): ToolResult {
  const mode = input.mode ?? "dry_run";

  return {
    job_id: input.job_id,
    status: input.status ?? (mode === "dry_run" ? "dry_run_complete" : "accepted"),
    mode,
    action: input.action,
    target_system: input.target_system,
    timestamp: new Date().toISOString(),
    receipt: sanitizeRecord(
      input.receipt ?? {
        required: true,
        command_folder_id: input.command_folder_id ?? defaultCommandFolderId,
        status: "receipt_planned"
      }
    ),
    rollback: sanitizeRecord(
      input.rollback ?? {
        available: mode !== "read",
        status: "rollback_metadata_planned"
      }
    ),
    data: sanitizeRecord(input.data),
    errors: input.errors ?? []
  };
}

function actionNamesFrom(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value) || value.length === 0) return fallback;

  const names = value
    .map((item) => {
      if (typeof item === "string") return item;
      if (isRecord(item)) return stringValue(item.action) ?? stringValue(item.type) ?? stringValue(item.name);
      return undefined;
    })
    .filter((item): item is string => Boolean(item));

  return names.length ? names : fallback;
}

function providerStatus(value: unknown, fallback: string): string {
  if (!isRecord(value)) return fallback;
  const validationStatus = stringValue(value.validation_status);
  if (validationStatus) return validationStatus;
  const status = stringValue(value.status);
  if (status) return status;
  return fallback;
}

function folderManifestRecords(input: JsonRecord): JsonRecord[] {
  const manifest = stringArray(input.folder_manifest);
  if (manifest.length === 0) return recordArray(input.folders);
  const rootFolderId = commandFolderId(input);
  return manifest.map((name) => ({ name, parent_folder_id: rootFolderId, path: name }));
}

function isApprovedDriveManifestWrite(input: JsonRecord, driveMode: DriveRunMode) {
  return driveMode === "approved_write" && boolValue(input.approved) === true && Boolean(stringValue(input.approvalId));
}

async function executeApprovedFolderManifest(input: JsonRecord) {
  const rootFolderId = commandFolderId(input);
  const folders = folderManifestRecords(input);
  const created: unknown[] = [];
  const failed: unknown[] = [];

  for (const folder of folders) {
    const folderName = stringValue(folder.name) ?? stringValue(folder.path) ?? "unnamed-folder";
    const parentFolderId = stringValue(folder.parent_folder_id) ?? rootFolderId;
    const providerResult = await createDriveFolderWithAdapter({
      root_folder_id: parentFolderId,
      name: folderName,
      parent_folder_id: parentFolderId,
      dry_run: false,
      approved_actions: ["create_missing_folders"],
      approval_phrase: "APPROVE DRIVE FOLDER CREATE"
    });
    const providerRecord = providerResult as JsonRecord;
    if (providerRecord.ok === true || providerRecord.validation_status === "created") created.push(providerResult);
    else failed.push(providerResult);
  }

  return { created, failed, requestedCount: folders.length };
}

export function runJob(input: UniversalJobInput & JsonRecord): ToolResult {
  const mode = normalizeMode(input.mode);
  const targetSystem = input.target_system ?? stringValue(input.provider) ?? "universal";
  const action = input.action ?? stringValue(input.objective) ?? "run_job";
  const payload = isRecord(input.payload) ? input.payload : {};

  if (mode === "rollback") {
    return rollbackTool({
      job_id: input.job_id,
      mode,
      original_job_id: stringValue(payload.original_job_id) ?? input.job_id,
      rollback_type: action,
      rollback_payload: payload,
      command_folder_id: input.command_folder_id
    });
  }

  const providerResult = runUniversalJobWithFallbacks({
    job_id: input.job_id,
    mode: existingRunnerMode(mode),
    provider: targetSystem,
    objective: action,
    root_resource_id: stringValue(input.root_resource_id) ?? stringValue(payload.root_resource_id),
    actions: stringArray(input.actions).length ? stringArray(input.actions) : [action],
    blocked_actions: stringArray(input.blocked_actions),
    approval_required: boolValue(input.approval_required),
    fallbacks: stringArray(input.fallbacks),
    payload
  });

  return result({
    job_id: input.job_id,
    mode,
    action,
    target_system: targetSystem,
    command_folder_id: input.command_folder_id,
    data: {
      routed_to: "run_universal_job",
      provider_result: providerResult
    },
    receipt: receiptFor(input),
    rollback: rollbackFor(input)
  });
}

export function runUniversalJob(input: UniversalJobInput & JsonRecord): ToolResult {
  return runJob({
    ...input,
    action: input.action,
    target_system: input.target_system ?? stringValue(input.provider) ?? "universal"
  });
}

export async function runDriveJobTool(input: JsonRecord): Promise<ToolResult> {
  const driveMode = normalizeDriveMode(input.mode);
  const mode = normalizeMode(input.mode);
  const actions = actionNamesFrom(input.drive_actions ?? input.actions, [input.create_missing_folders === true ? "create_missing_folders" : "validate_tree", "write_receipts"]);
  const folders = folderManifestRecords(input).map((folder) => ({
    name: stringValue(folder.name) ?? "unnamed-folder",
    parent_folder_id: stringValue(folder.parent_folder_id) ?? commandFolderId(input),
    path: stringValue(folder.path)
  }));
  const providerResult = runDriveJob({
    job_id: jobId(input, "drive-job"),
    mode: mode === "read" ? "validate_only" : "missing_only",
    root_folder_id: commandFolderId(input),
    dry_run: driveMode !== "approved_write" && mode !== "execute",
    actions,
    blocked_actions: stringArray(input.blocked_actions),
    folders,
    files: recordArray(input.files).map((file) => ({
      name: stringValue(file.name) ?? "unnamed-file",
      source_path: stringValue(file.source_path),
      mime_type: stringValue(file.mime_type),
      parent_folder_id: stringValue(file.parent_folder_id)
    })),
    images: recordArray(input.images).map((image) => ({
      name: stringValue(image.name) ?? "unnamed-image",
      source_path: stringValue(image.source_path),
      mime_type: stringValue(image.mime_type),
      parent_folder_id: stringValue(image.parent_folder_id)
    })),
    moves: recordArray(input.moves).map((move) => ({
      item_id: stringValue(move.item_id) ?? "unknown",
      from_folder_id: stringValue(move.from_folder_id),
      to_folder_id: stringValue(move.to_folder_id) ?? "unknown",
      item_type: stringValue(move.item_type) === "folder" ? "folder" : "file"
    })),
    receipt_folder_id: stringValue(input.receipt_folder_id)
  });

  const approvedManifestRequested = input.create_missing_folders === true && folders.length > 0 && driveMode === "approved_write";
  const approvedManifestGate = isApprovedDriveManifestWrite(input, driveMode);
  const approvedManifestResult = approvedManifestRequested && approvedManifestGate
    ? await executeApprovedFolderManifest(input)
    : null;
  const manifestBlocked = approvedManifestRequested && !approvedManifestGate
    ? "approved_write folder_manifest execution requires approved=true and approvalId."
    : null;

  return result({
    job_id: jobId(input, "drive-job"),
    mode,
    action: "run_drive_job",
    target_system: "google_drive",
    command_folder_id: commandFolderId(input),
    status: approvedManifestResult
      ? approvedManifestResult.failed.length === 0 ? "created" : "partial_failure"
      : manifestBlocked ? "blocked" : undefined,
    data: {
      drive_actions: sanitizeForResponse(input.drive_actions ?? input.actions ?? actions),
      folder_manifest: sanitizeForResponse(input.folder_manifest ?? []),
      provider_result: providerResult,
      approved_manifest_result: sanitizeForResponse(approvedManifestResult),
      blocker: manifestBlocked
    },
    receipt: receiptFor(input, approvedManifestResult ? "receipt_required_after_approved_write" : undefined),
    rollback: rollbackFor(input)
  });
}

export function driveListTreeTool(input: JsonRecord): ToolResult {
  const folderId = stringValue(input.folder_id) ?? stringValue(input.root_folder_id) ?? commandFolderId(input);
  const providerPlan = runDriveJob({
    job_id: jobId(input, "drive-list-tree"),
    root_folder_id: folderId,
    dry_run: true,
    actions: ["list_tree", "validate_tree"]
  });

  return result({
    job_id: jobId(input, "drive-list-tree"),
    mode: "read",
    action: "drive_list_tree",
    target_system: "google_drive",
    command_folder_id: commandFolderId(input),
    status: "not_implemented",
    data: {
      folder_id: folderId,
      max_depth: input.max_depth ?? 3,
      adapter_required: "Wire Google Drive files.list scoped by parent folder before returning a live tree.",
      planned_fallback: providerPlan
    },
    receipt: receiptFor(input, "read_receipt_planned"),
    rollback: { available: false, status: "not_required_for_read" }
  });
}

export async function driveCreateFolderTool(input: JsonRecord): Promise<ToolResult> {
  const mode = normalizeMode(input.mode);
  const folderName = stringValue(input.folder_name) ?? stringValue(input.name) ?? "";
  const parentFolderId = stringValue(input.parent_folder_id) ?? stringValue(input.root_folder_id) ?? commandFolderId(input);

  if (mode !== "execute") {
    return result({
      job_id: jobId(input, "drive-create-folder"),
      mode,
      action: "drive_create_folder",
      target_system: "google_drive",
      command_folder_id: commandFolderId(input),
      data: {
        would_create_folder: folderName,
        parent_folder_id: parentFolderId
      },
      receipt: receiptFor(input),
      rollback: {
        available: false,
        status: "not_required_for_dry_run"
      }
    });
  }

  const providerResult = await createDriveFolderWithAdapter({
    root_folder_id: parentFolderId,
    name: folderName,
    parent_folder_id: parentFolderId,
    dry_run: false,
    approved_actions: stringArray(input.approved_actions),
    approval_phrase: stringValue(input.approval_phrase)
  });
  const providerResultRecord = providerResult as JsonRecord;
  const createdFolder = isRecord(providerResultRecord.created_folder) ? providerResultRecord.created_folder : undefined;

  return result({
    job_id: jobId(input, "drive-create-folder"),
    mode,
    action: "drive_create_folder",
    target_system: "google_drive",
    command_folder_id: commandFolderId(input),
    status: providerStatus(providerResult, "accepted"),
    data: {
      adapter: "google_drive_files_create",
      provider_result: providerResult
    },
    receipt: receiptFor(input, "receipt_required_after_execute"),
    rollback: {
      available: true,
      status: "delete_created_folder_if_created",
      created_folder_id: createdFolder?.id
    }
  });
}

function driveMoveTool(input: JsonRecord, itemType: "file" | "folder"): ToolResult {
  const mode = normalizeMode(input.mode);
  const itemId = stringValue(input[itemType === "file" ? "file_id" : "folder_id"]) ?? stringValue(input.item_id) ?? "unknown";
  const destinationParentFolderId = stringValue(input.destination_parent_folder_id) ?? stringValue(input.to_folder_id) ?? "unknown";
  const currentParentFolderId = stringValue(input.current_parent_folder_id) ?? stringValue(input.from_folder_id);
  const action = itemType === "file" ? "drive_move_file" : "drive_move_folder";
  const wouldMoveKey = itemType === "file" ? "would_move_file" : "would_move_folder";

  if (mode === "execute" || mode === "rollback") {
    return result({
      job_id: jobId(input, action),
      mode,
      action,
      target_system: "google_drive",
      command_folder_id: commandFolderId(input),
      status: "not_implemented",
      data: {
        adapter_required: "Wire Google Drive files.update with addParents/removeParents before live Drive moves.",
        item_id: itemId,
        destination_parent_folder_id: destinationParentFolderId,
        current_parent_folder_id: currentParentFolderId
      },
      receipt: receiptFor(input),
      rollback: {
        available: Boolean(currentParentFolderId),
        status: currentParentFolderId ? "rollback_parent_available" : "current_parent_folder_id_required_for_rollback",
        current_parent_folder_id: currentParentFolderId
      }
    });
  }

  return result({
    job_id: jobId(input, action),
    mode,
    action,
    target_system: "google_drive",
    command_folder_id: commandFolderId(input),
    data: {
      [wouldMoveKey]: itemId,
      destination_parent_folder_id: destinationParentFolderId,
      current_parent_folder_id: currentParentFolderId
    },
    receipt: receiptFor(input),
    rollback: {
      available: Boolean(currentParentFolderId),
      status: currentParentFolderId ? "rollback_parent_planned" : "current_parent_folder_id_required_for_rollback",
      restore_parent_folder_id: currentParentFolderId
    }
  });
}

export const driveMoveFileTool = (input: JsonRecord) => driveMoveTool(input, "file");
export const driveMoveFolderTool = (input: JsonRecord) => driveMoveTool(input, "folder");

export function driveWriteReceiptTool(input: JsonRecord): ToolResult {
  const mode = normalizeMode(input.mode);

  return result({
    job_id: jobId(input, "drive-write-receipt"),
    mode,
    action: "drive_write_receipt",
    target_system: "google_drive",
    command_folder_id: commandFolderId(input),
    status: mode === "execute" ? "receipt_planned" : undefined,
    data: {
      receipt_planned: true,
      receipt_folder_id: stringValue(input.receipt_folder_id),
      system: stringValue(input.system) ?? "auto_builder",
      action: stringValue(input.action) ?? "drive_write_receipt",
      status: stringValue(input.status) ?? "planned",
      summary: stringValue(input.summary) ?? "Receipt planned.",
      inputs: sanitizeForResponse(input.inputs ?? {}),
      outputs: sanitizeForResponse(input.outputs ?? {}),
      adapter_note: "Direct Drive receipt-file writes are not wired here; this tool returns a safe receipt plan."
    },
    receipt: receiptFor(input, "receipt_planned"),
    rollback: rollbackFor(input, "receipt_rollback_not_required")
  });
}

export async function runPlatformProvisioningJobTool(input: JsonRecord): Promise<ToolResult> {
  const mode = normalizeMode(input.mode);
  const actions = actionNamesFrom(input.platform_actions ?? input.actions, ["create_vercel_project"]);

  if (mode !== "execute") {
    return result({
      job_id: jobId(input, "platform-provisioning"),
      mode,
      action: "run_platform_provisioning_job",
      target_system: "platform_provisioning",
      command_folder_id: commandFolderId(input),
      data: {
        planned_platform_actions: sanitizeForResponse(input.platform_actions ?? actions),
        dry_run_only: true
      },
      receipt: receiptFor(input),
      rollback: rollbackFor(input)
    });
  }

  const providerResult = await runPlatformProvisioningJob({
    job_id: jobId(input, "platform-provisioning"),
    mode: "execute",
    actions,
    name: stringValue(input.name),
    description: stringValue(input.description),
    github_owner: stringValue(input.owner) ?? stringValue(input.github_owner),
    github_repo: stringValue(input.repo_name) ?? stringValue(input.github_repo),
    github_private: stringValue(input.visibility) !== "public",
    vercel_team_id: stringValue(input.team_id) ?? stringValue(input.vercel_team_id),
    vercel_project_name: stringValue(input.project_name) ?? stringValue(input.vercel_project_name),
    framework: stringValue(input.framework),
    git_repository_url: stringValue(input.git_repo) ?? stringValue(input.git_repository_url),
    root_directory: stringValue(input.root_directory),
    workflow_name: stringValue(input.workflow_name),
    workflow_entrypoint: stringValue(input.route) ?? stringValue(input.workflow_entrypoint),
    workflow_topics: stringArray(input.workflow_topics),
    agent_name: stringValue(input.agent_name),
    approved_actions: stringArray(input.approved_actions),
    blocked_actions: stringArray(input.blocked_actions)
  });

  return result({
    job_id: jobId(input, "platform-provisioning"),
    mode,
    action: "run_platform_provisioning_job",
    target_system: "platform_provisioning",
    command_folder_id: commandFolderId(input),
    status: providerStatus(providerResult, "accepted"),
    data: { provider_result: providerResult },
    receipt: receiptFor(input, "receipt_required_after_execute"),
    rollback: rollbackFor(input)
  });
}

export async function createGithubRepoTool(input: JsonRecord): Promise<ToolResult> {
  const mode = normalizeMode(input.mode);
  const owner = stringValue(input.owner) ?? stringValue(input.github_owner) ?? process.env.GITHUB_ORG ?? "unknown-owner";
  const repoName = stringValue(input.repo_name) ?? stringValue(input.github_repo) ?? stringValue(input.name) ?? "unknown-repo";
  const visibility = stringValue(input.visibility) ?? "private";

  if (mode !== "execute") {
    return result({
      job_id: jobId(input, "create-github-repo"),
      mode,
      action: "create_github_repo",
      target_system: "github",
      command_folder_id: commandFolderId(input),
      data: {
        would_create_repo: `${owner}/${repoName}`,
        visibility,
        initialize_readme: boolValue(input.initialize_readme) ?? true
      },
      receipt: receiptFor(input),
      rollback: {
        available: true,
        status: "delete_repo_if_created",
        repo: `${owner}/${repoName}`
      }
    });
  }

  const providerResult = await createGithubRepoWithAdapter({
    job_id: jobId(input, "create-github-repo"),
    mode: "execute",
    name: repoName,
    description: stringValue(input.description),
    github_owner: owner,
    github_repo: repoName,
    github_private: visibility !== "public",
    approved_actions: stringArray(input.approved_actions),
    blocked_actions: stringArray(input.blocked_actions)
  });

  return result({
    job_id: jobId(input, "create-github-repo"),
    mode,
    action: "create_github_repo",
    target_system: "github",
    command_folder_id: commandFolderId(input),
    status: providerStatus(providerResult, "accepted"),
    data: { provider_result: providerResult },
    receipt: receiptFor(input, "receipt_required_after_execute"),
    rollback: {
      available: true,
      status: "delete_repo_if_created",
      repo: `${owner}/${repoName}`
    }
  });
}

export async function createVercelProjectTool(input: JsonRecord): Promise<ToolResult> {
  const mode = normalizeMode(input.mode);
  const teamId = stringValue(input.team_id) ?? stringValue(input.vercel_team_id) ?? process.env.VERCEL_TEAM_ID ?? "unknown-team";
  const projectName = stringValue(input.project_name) ?? stringValue(input.vercel_project_name) ?? stringValue(input.name) ?? "unknown-project";

  if (mode !== "execute") {
    return result({
      job_id: jobId(input, "create-vercel-project"),
      mode,
      action: "create_vercel_project",
      target_system: "vercel",
      command_folder_id: commandFolderId(input),
      data: {
        would_create_vercel_project: projectName,
        team_id: teamId,
        git_repo: stringValue(input.git_repo),
        framework: stringValue(input.framework) ?? "nextjs",
        root_directory: stringValue(input.root_directory)
      },
      receipt: receiptFor(input),
      rollback: {
        available: true,
        status: "delete_project_if_created",
        project_name: projectName
      }
    });
  }

  const providerResult = await createVercelProjectWithAdapter({
    job_id: jobId(input, "create-vercel-project"),
    mode: "execute",
    name: projectName,
    description: stringValue(input.description),
    vercel_team_id: teamId,
    vercel_project_name: projectName,
    framework: stringValue(input.framework),
    git_repository_url: stringValue(input.git_repo) ?? stringValue(input.git_repository_url),
    root_directory: stringValue(input.root_directory),
    approved_actions: stringArray(input.approved_actions),
    blocked_actions: stringArray(input.blocked_actions)
  });

  return result({
    job_id: jobId(input, "create-vercel-project"),
    mode,
    action: "create_vercel_project",
    target_system: "vercel",
    command_folder_id: commandFolderId(input),
    status: providerStatus(providerResult, "accepted"),
    data: { provider_result: providerResult },
    receipt: receiptFor(input, "receipt_required_after_execute"),
    rollback: {
      available: true,
      status: "delete_project_if_created",
      project_name: projectName
    }
  });
}

export function createVercelWorkflowTool(input: JsonRecord): ToolResult {
  const mode = normalizeMode(input.mode);
  const workflowName = stringValue(input.workflow_name) ?? "auto-builder-workflow";
  const route = stringValue(input.route) ?? "/api/workflows/auto-builder";
  const schedule = stringValue(input.schedule) ?? "manual";

  return result({
    job_id: jobId(input, "create-vercel-workflow"),
    mode,
    action: "create_vercel_workflow",
    target_system: "vercel",
    command_folder_id: commandFolderId(input),
    status: mode === "execute" ? "not_implemented" : undefined,
    data: {
      would_create_workflow: workflowName,
      team_id: stringValue(input.team_id),
      project_id: stringValue(input.project_id),
      route,
      schedule,
      timezone: stringValue(input.timezone) ?? "UTC",
      adapter_required: mode === "execute" ? "Wire Vercel workflow/cron provisioning adapter." : undefined
    },
    receipt: receiptFor(input),
    rollback: {
      available: true,
      status: "delete_workflow_or_cron_if_created",
      workflow_name: workflowName
    }
  });
}

export function createVercelAgentTool(input: JsonRecord): ToolResult {
  const mode = normalizeMode(input.mode);
  const agentName = stringValue(input.agent_name) ?? "auto-builder-agent";

  return result({
    job_id: jobId(input, "create-vercel-agent"),
    mode,
    action: "create_vercel_agent",
    target_system: "vercel",
    command_folder_id: commandFolderId(input),
    status: mode === "execute" ? "not_implemented" : undefined,
    data: {
      would_create_agent: agentName,
      team_id: stringValue(input.team_id),
      project_id: stringValue(input.project_id),
      agent_scope: stringValue(input.agent_scope) ?? "project",
      allowed_tools: stringArray(input.allowed_tools),
      adapter_required: mode === "execute" ? "Wire Vercel agent provisioning adapter when provider support is available." : undefined
    },
    receipt: receiptFor(input),
    rollback: {
      available: true,
      status: "delete_agent_if_created",
      agent_name: agentName
    }
  });
}

export function createAiGatewayTool(input: JsonRecord): ToolResult {
  const mode = normalizeMode(input.mode);
  const gatewayName = stringValue(input.gateway_name) ?? stringValue(input.ai_gateway_key_name) ?? "auto-builder-ai-gateway";

  return result({
    job_id: jobId(input, "create-ai-gateway"),
    mode,
    action: "create_ai_gateway",
    target_system: "ai_gateway",
    command_folder_id: commandFolderId(input),
    status: mode === "execute" ? "not_implemented" : undefined,
    data: {
      would_create_ai_gateway: gatewayName,
      project_id: stringValue(input.project_id),
      providers: stringArray(input.providers),
      models: stringArray(input.models),
      adapter_required: mode === "execute" ? "Wire AI Gateway provisioning adapter to AI_GATEWAY_API_KEY." : undefined
    },
    receipt: receiptFor(input),
    rollback: {
      available: true,
      status: "delete_gateway_or_key_if_created",
      gateway_name: gatewayName
    }
  });
}

export function rollbackTool(input: JsonRecord): ToolResult {
  const mode = normalizeMode(input.mode);
  const originalJobId = stringValue(input.original_job_id) ?? "unknown-original-job";
  const rollbackType = stringValue(input.rollback_type) ?? "manual";
  const rollbackPayload = isRecord(input.rollback_payload) ? input.rollback_payload : {};

  return result({
    job_id: jobId(input, "rollback"),
    mode: mode === "rollback" ? "rollback" : "dry_run",
    action: "rollback",
    target_system: "auto_builder",
    command_folder_id: commandFolderId(input),
    status: mode === "rollback" ? "not_implemented" : "dry_run_complete",
    data: {
      rollback_plan: {
        original_job_id: originalJobId,
        rollback_type: rollbackType,
        rollback_payload: sanitizeForResponse(rollbackPayload),
        note: "Rollback routing is visible now; provider-specific rollback handlers must be wired before live rollback."
      }
    },
    receipt: receiptFor(input),
    rollback: {
      available: mode === "rollback",
      status: mode === "rollback" ? "provider_rollback_adapter_required" : "rollback_plan_only"
    }
  });
}

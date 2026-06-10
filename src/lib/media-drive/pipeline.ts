import { MediaDriveClient, isGoogleDriveLiveConfigured } from './google-drive-client';
import { MediaImageClient, isImageGenerationLiveConfigured } from './image-client';
import { assertMediaDriveAllowed } from './governance';
import { createMediaDriveReceipt, persistMediaDriveReceipt } from './receipts';
import type { MediaDriveAdapterMode, MediaDriveToolName, MediaDriveToolResult } from './types';

const ROUTE = '/api/mcp-media-drive';
const WRITE_TOOLS = new Set<MediaDriveToolName>([
  'image_generate_asset',
  'drive_upload_image',
  'drive_upload_file',
  'drive_create_folder_tree',
  'drive_move_file',
  'drive_move_folder',
  'drive_copy_file',
  'drive_write_receipt'
]);

function booleanArg(args: Record<string, unknown>, key: string) {
  return args[key] === true || args[key] === 'true';
}

function approvalState(args: Record<string, unknown>, tool: MediaDriveToolName) {
  const approvedWrite = booleanArg(args, 'approved_write');
  const approvedWriteDryRun = booleanArg(args, 'approved_write_dry_run') || booleanArg(args, 'dry_run');
  const liveEnabled = process.env.MEDIA_DRIVE_LIVE_ENABLED === '1';
  const liveWritesEnabled = process.env.MEDIA_DRIVE_APPROVED_WRITE_ENABLED === '1';
  const expectedToken = process.env.MEDIA_DRIVE_APPROVED_WRITE_TOKEN;
  const approvedWriteTokenRequired = Boolean(expectedToken);
  const approvedWriteTokenValid = !expectedToken || args.approved_write_token === expectedToken;
  const isWriteTool = WRITE_TOOLS.has(tool);
  const canMutate = isWriteTool && liveEnabled && liveWritesEnabled && approvedWrite && approvedWriteTokenValid && !approvedWriteDryRun;

  return {
    approvedWrite,
    approvedWriteDryRun,
    approvedWriteTokenRequired,
    approvedWriteTokenValid,
    liveEnabled,
    liveWritesEnabled,
    isWriteTool,
    canMutate
  };
}

function adapterModeFor(state: ReturnType<typeof approvalState>, liveConfigured: boolean): MediaDriveAdapterMode {
  if (state.approvedWriteDryRun) return 'approved_write_dry_run';
  if (state.canMutate && liveConfigured) return 'live_adapter_mutation';
  if (state.liveEnabled && liveConfigured) return 'live_adapter_ready';
  return 'scaffold_planned';
}

async function buildResult(input: {
  tool: MediaDriveToolName;
  args: Record<string, unknown>;
  data: Record<string, unknown>;
  adapterMode: MediaDriveAdapterMode;
  liveMutation: boolean;
  implementationStatus: string;
  status?: MediaDriveToolResult['status'];
  summary?: string;
}) {
  const receipt = createMediaDriveReceipt({
    tool: input.tool,
    actionClass: 'LOGGED',
    projectSlug: String(input.args.project_slug ?? 'unscoped'),
    targetType: input.tool,
    targetId: String(input.args.file_id ?? input.args.folder_id ?? input.args.target_id ?? input.data.asset_id ?? input.data.id ?? input.data.copied_file_id ?? 'planned'),
    targetName: String(input.args.filename ?? input.args.asset_name ?? input.data.name ?? input.tool),
    targetUrl: typeof input.data.webViewLink === 'string' ? input.data.webViewLink : typeof input.data.planned_url === 'string' ? input.data.planned_url : undefined,
    folderId: String(input.args.folder_id ?? input.args.to_folder_id ?? ''),
    inputsSummary: input.args,
    outputsSummary: input.data,
    status: input.status ?? (input.liveMutation ? 'ok' : input.adapterMode === 'approved_write_dry_run' ? 'dry_run' : 'planned'),
    summary: input.summary ?? `${input.tool} completed through the gated Media Drive Pipeline adapter.`,
    nextAction: input.liveMutation
      ? 'Validate durable receipt lookup and rollback path before production approval.'
      : 'Keep operation non-mutating until live adapter, approved-write, and durable receipt checks pass.'
  });

  const receiptPersistence = await persistMediaDriveReceipt(receipt, {
    tool: input.tool,
    adapter_mode: input.adapterMode,
    live_mutation: input.liveMutation,
    require_durable_receipt: booleanArg(input.args, 'require_durable_receipt')
  });
  const durableReceiptRequired = booleanArg(input.args, 'require_durable_receipt');
  const persistenceFailed = durableReceiptRequired && !receiptPersistence.persisted;
  const state = approvalState(input.args, input.tool);

  return {
    status: persistenceFailed ? 'error' as const : input.status ?? (input.liveMutation ? 'ok' as const : input.adapterMode === 'approved_write_dry_run' ? 'ok' as const : 'planned' as const),
    route: ROUTE,
    tool: input.tool,
    mode: 'autonomous_logged' as const,
    adapterMode: input.adapterMode,
    liveMutation: input.liveMutation,
    implementationStatus: persistenceFailed ? 'durable_receipt_persistence_failed' : input.implementationStatus,
    approval: {
      approvedWrite: state.approvedWrite,
      approvedWriteDryRun: state.approvedWriteDryRun,
      approvedWriteTokenRequired: state.approvedWriteTokenRequired,
      approvedWriteTokenValid: state.approvedWriteTokenValid,
      liveEnabled: state.liveEnabled,
      liveWritesEnabled: state.liveWritesEnabled
    },
    data: input.data,
    receipt,
    receiptPersistence
  } satisfies MediaDriveToolResult;
}

export async function runMediaDriveTool(tool: MediaDriveToolName, args: Record<string, unknown>): Promise<MediaDriveToolResult> {
  const gate = assertMediaDriveAllowed({
    tool,
    source_folder_path: String(args.source_folder_path ?? ''),
    target_folder_path: String(args.target_folder_path ?? ''),
    public_share: args.public_share === true,
    permission_change: args.permission_change === true,
    delete_action: args.delete_action === true,
    overwrite_existing: args.overwrite_existing === true,
    external_send: args.external_send === true,
    contains_secret: args.contains_secret === true,
    spend_cents: typeof args.spend_cents === 'number' ? args.spend_cents : undefined,
    budget_cents: typeof args.budget_cents === 'number' ? args.budget_cents : undefined
  });

  if (!gate.allowed) {
    const receipt = createMediaDriveReceipt({
      tool,
      actionClass: 'HARD_GATED',
      projectSlug: String(args.project_slug ?? 'unscoped'),
      targetType: tool,
      targetId: String(args.file_id ?? args.folder_id ?? args.target_id ?? 'blocked'),
      inputsSummary: args,
      outputsSummary: { reasons: gate.reasons },
      status: 'blocked',
      summary: `${tool} blocked by Media Drive hard gate.`,
      hardGateReason: gate.reasons.join(','),
      nextAction: 'Return hard gate result and do not mutate.'
    });
    const receiptPersistence = await persistMediaDriveReceipt(receipt, {
      tool,
      adapter_mode: 'scaffold_planned',
      live_mutation: false,
      hard_gated: true,
      require_durable_receipt: booleanArg(args, 'require_durable_receipt')
    });

    return {
      status: 'hard_gated',
      route: ROUTE,
      tool,
      mode: 'autonomous_logged',
      adapterMode: 'scaffold_planned',
      liveMutation: false,
      reasons: gate.reasons,
      receipt,
      receiptPersistence
    };
  }

  const state = approvalState(args, tool);
  if (state.approvedWrite && !state.approvedWriteTokenValid) {
    const receipt = createMediaDriveReceipt({
      tool,
      actionClass: 'HARD_GATED',
      projectSlug: String(args.project_slug ?? 'unscoped'),
      targetType: tool,
      targetId: String(args.file_id ?? args.folder_id ?? args.target_id ?? 'blocked'),
      inputsSummary: args,
      outputsSummary: { reason: 'approved_write_token_invalid' },
      status: 'blocked',
      summary: `${tool} blocked because approved-write token validation failed.`,
      hardGateReason: 'approved_write_token_invalid',
      nextAction: 'Retry only from an approved cloud context with the correct token.'
    });
    const receiptPersistence = await persistMediaDriveReceipt(receipt, {
      tool,
      adapter_mode: 'scaffold_planned',
      live_mutation: false,
      hard_gated: true,
      require_durable_receipt: booleanArg(args, 'require_durable_receipt')
    });

    return {
      status: 'hard_gated',
      route: ROUTE,
      tool,
      mode: 'autonomous_logged',
      adapterMode: 'scaffold_planned',
      liveMutation: false,
      reasons: ['approved_write_token_invalid'],
      receipt,
      receiptPersistence
    };
  }

  const googleDriveConfigured = isGoogleDriveLiveConfigured();
  const imageConfigured = isImageGenerationLiveConfigured();
  const needsImage = tool === 'image_generate_asset';
  const liveConfigured = needsImage ? imageConfigured : googleDriveConfigured;
  const adapterMode = adapterModeFor(state, liveConfigured);
  const useLiveDrive = adapterMode === 'live_adapter_mutation' || (tool === 'drive_download_file' && state.liveEnabled && googleDriveConfigured && !state.approvedWriteDryRun);
  const useLiveImage = adapterMode === 'live_adapter_mutation' && needsImage;

  const drive = new MediaDriveClient({ live: useLiveDrive });
  const image = new MediaImageClient({ live: useLiveImage });
  let data: Record<string, unknown> = {};

  try {
    if (tool === 'image_generate_asset') {
      data = await image.generateAsset({
        projectSlug: String(args.project_slug),
        assetName: String(args.asset_name),
        prompt: String(args.prompt),
        size: args.size as '1024x1024' | '1024x1536' | '1536x1024' | undefined,
        format: args.format as 'png' | 'jpg' | 'webp' | undefined
      }) as unknown as Record<string, unknown>;
    }

    if (tool === 'drive_create_folder_tree') {
      data = await drive.createFolderTree(args.tree as string[], String(args.root_folder_id ?? drive.rootFolderId)) as unknown as Record<string, unknown>;
    }

    if (tool === 'drive_upload_image' || tool === 'drive_upload_file') {
      data = await drive.uploadFile({
        sourceFileRef: String(args.source_file_ref),
        filename: String(args.filename),
        mimeType: String(args.mime_type ?? 'application/octet-stream'),
        folderId: String(args.folder_id)
      }) as unknown as Record<string, unknown>;
    }

    if (tool === 'drive_download_file') {
      data = await drive.downloadFile({
        fileId: String(args.file_id),
        destinationName: typeof args.destination_name === 'string' ? args.destination_name : undefined,
        exportMimeType: typeof args.export_mime_type === 'string' ? args.export_mime_type : undefined
      }) as unknown as Record<string, unknown>;
    }

    if (tool === 'drive_move_file') {
      data = await drive.moveFile({
        fileId: String(args.file_id),
        fromFolderId: typeof args.from_folder_id === 'string' ? args.from_folder_id : undefined,
        toFolderId: String(args.to_folder_id)
      }) as unknown as Record<string, unknown>;
    }

    if (tool === 'drive_move_folder') {
      data = await drive.moveFolder({
        folderId: String(args.folder_id),
        fromFolderId: typeof args.from_folder_id === 'string' ? args.from_folder_id : undefined,
        toFolderId: String(args.to_folder_id)
      }) as unknown as Record<string, unknown>;
    }

    if (tool === 'drive_copy_file') {
      data = await drive.copyFile({
        fileId: String(args.file_id),
        toFolderId: String(args.to_folder_id),
        newName: typeof args.new_name === 'string' ? args.new_name : undefined
      }) as unknown as Record<string, unknown>;
    }

    if (tool === 'drive_write_receipt') {
      data = {
        receipt_id: `AUTO_BUILDER_RECEIPT_${Date.now()}`,
        receipt_file_id: useLiveDrive ? 'telemetry-persisted-receipt' : 'planned-receipt-file',
        receipt_url: useLiveDrive ? undefined : 'https://drive.google.com/file/d/planned-receipt-file/view',
        created_at: new Date().toISOString(),
        live: useLiveDrive
      };
    }

    data = {
      ...data,
      adapter_mode: adapterMode,
      live_drive_configured: googleDriveConfigured,
      live_image_configured: imageConfigured,
      approved_write_dry_run: state.approvedWriteDryRun
    };

    return buildResult({
      tool,
      args,
      data,
      adapterMode,
      liveMutation: adapterMode === 'live_adapter_mutation' && state.isWriteTool,
      implementationStatus: adapterMode === 'live_adapter_mutation'
        ? 'live_adapter_executed'
        : adapterMode === 'approved_write_dry_run'
          ? 'approved_write_dry_run_validated'
          : liveConfigured
            ? 'live_adapter_configured_but_not_mutating'
            : 'scaffolded_client_adapter',
      summary: `${tool} completed through the gated Media Drive Pipeline adapter in ${adapterMode} mode.`
    });
  } catch (error) {
    const data = {
      adapter_mode: adapterMode,
      live_drive_configured: googleDriveConfigured,
      live_image_configured: imageConfigured,
      error: error instanceof Error ? error.message : 'unknown_media_drive_adapter_error'
    };

    return buildResult({
      tool,
      args,
      data,
      adapterMode,
      liveMutation: false,
      implementationStatus: 'media_drive_adapter_error',
      status: 'error',
      summary: `${tool} failed inside the gated Media Drive Pipeline adapter.`
    });
  }
}

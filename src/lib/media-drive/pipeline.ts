import { MediaDriveClient } from './google-drive-client';
import { MediaImageClient } from './image-client';
import { assertMediaDriveAllowed } from './governance';
import { createMediaDriveReceipt } from './receipts';
import type { MediaDriveToolName, MediaDriveToolResult } from './types';

const ROUTE = '/api/mcp-media-drive';

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

    return {
      status: 'hard_gated',
      route: ROUTE,
      tool,
      mode: 'autonomous_logged',
      liveMutation: false,
      reasons: gate.reasons,
      receipt
    };
  }

  const drive = new MediaDriveClient();
  const image = new MediaImageClient();
  let data: Record<string, unknown> = {};

  if (tool === 'image_generate_asset') {
    data = await image.generateAsset({
      projectSlug: String(args.project_slug),
      assetName: String(args.asset_name),
      prompt: String(args.prompt),
      size: args.size as '1024x1024' | '1024x1536' | '1536x1024' | undefined,
      format: args.format as 'png' | 'jpg' | 'webp' | undefined
    });
  }

  if (tool === 'drive_create_folder_tree') {
    data = await drive.createFolderTree(args.tree as string[], String(args.root_folder_id ?? drive.rootFolderId));
  }

  if (tool === 'drive_upload_image' || tool === 'drive_upload_file') {
    data = await drive.uploadFile({
      sourceFileRef: String(args.source_file_ref),
      filename: String(args.filename),
      mimeType: String(args.mime_type ?? 'application/octet-stream'),
      folderId: String(args.folder_id)
    });
  }

  if (tool === 'drive_download_file') {
    data = await drive.downloadFile({
      fileId: String(args.file_id),
      destinationName: typeof args.destination_name === 'string' ? args.destination_name : undefined,
      exportMimeType: typeof args.export_mime_type === 'string' ? args.export_mime_type : undefined
    });
  }

  if (tool === 'drive_move_file') {
    data = await drive.moveFile({
      fileId: String(args.file_id),
      fromFolderId: typeof args.from_folder_id === 'string' ? args.from_folder_id : undefined,
      toFolderId: String(args.to_folder_id)
    });
  }

  if (tool === 'drive_move_folder') {
    data = await drive.moveFolder({
      folderId: String(args.folder_id),
      fromFolderId: typeof args.from_folder_id === 'string' ? args.from_folder_id : undefined,
      toFolderId: String(args.to_folder_id)
    });
  }

  if (tool === 'drive_copy_file') {
    data = await drive.copyFile({
      fileId: String(args.file_id),
      toFolderId: String(args.to_folder_id),
      newName: typeof args.new_name === 'string' ? args.new_name : undefined
    });
  }

  if (tool === 'drive_write_receipt') {
    data = {
      receipt_id: `AUTO_BUILDER_RECEIPT_${Date.now()}`,
      receipt_file_id: 'planned-receipt-file',
      receipt_url: 'https://drive.google.com/file/d/planned-receipt-file/view',
      created_at: new Date().toISOString()
    };
  }

  const receipt = createMediaDriveReceipt({
    tool,
    actionClass: 'LOGGED',
    projectSlug: String(args.project_slug ?? 'unscoped'),
    targetType: tool,
    targetId: String(args.file_id ?? args.folder_id ?? args.target_id ?? data.asset_id ?? data.id ?? 'planned'),
    targetName: String(args.filename ?? args.asset_name ?? tool),
    folderId: String(args.folder_id ?? args.to_folder_id ?? ''),
    inputsSummary: args,
    outputsSummary: data,
    status: 'planned',
    summary: `${tool} completed through the scaffolded Media Drive Pipeline adapter.`,
    nextAction: 'Wire live Google Drive and image-generation adapters, then run smoke tests.'
  });

  return {
    status: 'planned',
    route: ROUTE,
    tool,
    mode: 'autonomous_logged',
    liveMutation: false,
    implementationStatus: 'scaffolded_client_adapter',
    data,
    receipt
  };
}

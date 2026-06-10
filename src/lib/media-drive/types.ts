export type MediaDriveActionClass = 'AUTONOMOUS' | 'LOGGED' | 'HARD_GATED';

export type MediaDriveRisk =
  | 'logged_read'
  | 'logged_drive_write'
  | 'logged_drive_write_high'
  | 'hard_gated';

export type MediaDriveToolName =
  | 'image_generate_asset'
  | 'drive_upload_image'
  | 'drive_upload_file'
  | 'drive_download_file'
  | 'drive_create_folder_tree'
  | 'drive_move_file'
  | 'drive_move_folder'
  | 'drive_copy_file'
  | 'drive_write_receipt';

export type MediaDriveAdapterMode =
  | 'scaffold_planned'
  | 'approved_write_dry_run'
  | 'live_adapter_ready'
  | 'live_adapter_mutation';

export type MediaDriveReceiptPersistence = {
  enabled: boolean;
  attempted: boolean;
  persisted: boolean;
  telemetry_key?: string;
  store?: 'supabase_runtime_telemetry_events';
  error?: string;
};

export type MediaDriveReceipt = {
  receipt_id: string;
  timestamp: string;
  operator: 'AUTO_BUILDER_2';
  connector: 'AUTO_BUILDER_2';
  tool: MediaDriveToolName | string;
  action_class: MediaDriveActionClass;
  project_slug: string;
  target: {
    type: string;
    id: string;
    name: string;
    url?: string;
    folder_id?: string;
  };
  inputs_summary: Record<string, unknown>;
  outputs_summary: Record<string, unknown>;
  status: string;
  summary: string;
  risk: 'low' | 'medium' | 'high';
  hard_gate_triggered: boolean;
  hard_gate_reason?: string;
  rollback_or_inspection_path: string;
  next_action: string;
};

export type MediaDriveToolResult = {
  status: 'planned' | 'ok' | 'hard_gated' | 'error';
  route: string;
  tool: string;
  mode: 'autonomous_logged';
  adapterMode: MediaDriveAdapterMode;
  liveMutation: boolean;
  implementationStatus?: string;
  approval?: {
    approvedWrite: boolean;
    approvedWriteDryRun: boolean;
    approvedWriteTokenRequired: boolean;
    approvedWriteTokenValid: boolean;
    liveEnabled: boolean;
    liveWritesEnabled: boolean;
  };
  receipt: MediaDriveReceipt;
  receiptPersistence?: MediaDriveReceiptPersistence;
  data?: Record<string, unknown>;
  reasons?: string[];
};

export const MEDIA_DRIVE_TOOLS: Array<{
  name: MediaDriveToolName;
  description: string;
  risk: MediaDriveRisk;
}> = [
  { name: 'image_generate_asset', description: 'Generate an image asset and return a receipt-ready file reference payload.', risk: 'logged_drive_write' },
  { name: 'drive_upload_image', description: 'Upload a generated or local image file to Google Drive.', risk: 'logged_drive_write' },
  { name: 'drive_upload_file', description: 'Upload a generic file to Google Drive without forcing Workspace conversion.', risk: 'logged_drive_write' },
  { name: 'drive_download_file', description: 'Download or export a Drive file into the runtime workspace.', risk: 'logged_read' },
  { name: 'drive_create_folder_tree', description: 'Create or resolve a nested Google Drive folder tree under a root folder.', risk: 'logged_drive_write' },
  { name: 'drive_move_file', description: 'Move a Google Drive file from one parent folder to another.', risk: 'logged_drive_write' },
  { name: 'drive_move_folder', description: 'Move an AUTO BUILDER managed Google Drive folder to another parent folder.', risk: 'logged_drive_write_high' },
  { name: 'drive_copy_file', description: 'Copy a Drive file into a target folder while preserving the source.', risk: 'logged_drive_write' },
  { name: 'drive_write_receipt', description: 'Write a structured receipt to the project receipt folder.', risk: 'logged_drive_write' }
];

export const MEDIA_DRIVE_HARD_GATES = [
  'public_share',
  'permission_change',
  'delete',
  'source_truth_move',
  'client_delivery_overwrite',
  'secret_exposure',
  'external_send',
  'spend_over_budget'
] as const;

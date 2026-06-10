import type { MediaDriveActionClass, MediaDriveReceipt, MediaDriveReceiptPersistence, MediaDriveToolName } from './types';

const SECRET_KEY_PARTS = ['token', 'secret', 'private_key', 'api_key', 'service_role_key', 'password'];

export function sanitizeReceiptPayload(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      const normalized = key.toLowerCase();
      const shouldRedact = SECRET_KEY_PARTS.some((part) => normalized.includes(part));
      return [key, shouldRedact ? '[REDACTED]' : value];
    })
  );
}

export function createMediaDriveReceipt(input: {
  tool: MediaDriveToolName | string;
  actionClass: MediaDriveActionClass;
  projectSlug?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  targetUrl?: string;
  folderId?: string;
  inputsSummary?: Record<string, unknown>;
  outputsSummary?: Record<string, unknown>;
  status?: string;
  summary?: string;
  hardGateReason?: string;
  rollbackOrInspectionPath?: string;
  nextAction?: string;
}): MediaDriveReceipt {
  const actionClass = input.actionClass;
  const timestamp = new Date().toISOString();

  return {
    receipt_id: `AUTO_BUILDER_RECEIPT_${Date.now()}`,
    timestamp,
    operator: 'AUTO_BUILDER_2',
    connector: 'AUTO_BUILDER_2',
    tool: input.tool,
    action_class: actionClass,
    project_slug: input.projectSlug ?? 'unscoped',
    target: {
      type: input.targetType ?? String(input.tool),
      id: input.targetId ?? 'pending',
      name: input.targetName ?? String(input.tool),
      url: input.targetUrl,
      folder_id: input.folderId
    },
    inputs_summary: sanitizeReceiptPayload(input.inputsSummary ?? {}),
    outputs_summary: sanitizeReceiptPayload(input.outputsSummary ?? {}),
    status: input.status ?? (actionClass === 'HARD_GATED' ? 'blocked' : 'planned'),
    summary: input.summary ?? `${input.tool} recorded by AUTO_BUILDER_2 Media Drive Pipeline.`,
    risk: actionClass === 'HARD_GATED' ? 'high' : input.tool === 'drive_move_folder' ? 'medium' : 'low',
    hard_gate_triggered: actionClass === 'HARD_GATED',
    hard_gate_reason: input.hardGateReason,
    rollback_or_inspection_path: input.rollbackOrInspectionPath ?? '/api/mcp-media-drive-smoke',
    next_action: input.nextAction ?? 'Continue pipeline validation.'
  };
}

export async function persistMediaDriveReceipt(
  receipt: MediaDriveReceipt,
  context: Record<string, unknown> = {}
): Promise<MediaDriveReceiptPersistence> {
  const enabled = process.env.MEDIA_DRIVE_RECEIPT_PERSISTENCE_ENABLED === '1' || context.require_durable_receipt === true;
  if (!enabled) return { enabled: false, attempted: false, persisted: false };

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return {
      enabled: true,
      attempted: false,
      persisted: false,
      store: 'supabase_runtime_telemetry_events',
      telemetry_key: receipt.receipt_id,
      error: 'missing_supabase_receipt_env'
    };
  }

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/runtime_telemetry_events`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        authorization: `Bearer ${supabaseKey}`,
        'content-type': 'application/json',
        prefer: 'return=representation'
      },
      body: JSON.stringify({
        telemetry_key: receipt.receipt_id,
        event_status: receipt.status,
        event_payload: {
          kind: 'media_drive_receipt',
          receipt,
          context: sanitizeReceiptPayload(context)
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        enabled: true,
        attempted: true,
        persisted: false,
        store: 'supabase_runtime_telemetry_events',
        telemetry_key: receipt.receipt_id,
        error: text || `supabase_http_${response.status}`
      };
    }

    return {
      enabled: true,
      attempted: true,
      persisted: true,
      store: 'supabase_runtime_telemetry_events',
      telemetry_key: receipt.receipt_id
    };
  } catch (error) {
    return {
      enabled: true,
      attempted: true,
      persisted: false,
      store: 'supabase_runtime_telemetry_events',
      telemetry_key: receipt.receipt_id,
      error: error instanceof Error ? error.message : 'unknown_receipt_persistence_error'
    };
  }
}

export function serializeReceipt(receipt: MediaDriveReceipt, format: 'json' | 'markdown' = 'json'): string {
  if (format === 'json') return JSON.stringify(receipt, null, 2);

  return [
    `# AUTO BUILDER Receipt ${receipt.receipt_id}`,
    '',
    `- Timestamp: ${receipt.timestamp}`,
    `- Tool: ${receipt.tool}`,
    `- Action Class: ${receipt.action_class}`,
    `- Project: ${receipt.project_slug}`,
    `- Status: ${receipt.status}`,
    `- Risk: ${receipt.risk}`,
    `- Hard Gate Triggered: ${receipt.hard_gate_triggered}`,
    '',
    '## Summary',
    receipt.summary,
    '',
    '## Target',
    '```json',
    JSON.stringify(receipt.target, null, 2),
    '```',
    '',
    '## Inputs Summary',
    '```json',
    JSON.stringify(receipt.inputs_summary, null, 2),
    '```',
    '',
    '## Outputs Summary',
    '```json',
    JSON.stringify(receipt.outputs_summary, null, 2),
    '```',
    '',
    `Rollback or Inspection Path: ${receipt.rollback_or_inspection_path}`,
    `Next Action: ${receipt.next_action}`
  ].join('\n');
}

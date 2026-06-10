export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Risk = 'logged_read' | 'logged_drive_write' | 'logged_drive_write_high' | 'hard_gated';
type ActionClass = 'AUTONOMOUS' | 'LOGGED' | 'HARD_GATED';

type ToolRecord = {
  name: string;
  group: 'media_drive_pipeline';
  description: string;
  risk: Risk;
};

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? '13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr';
const ROUTE = '/api/mcp-media-drive';

const mediaDriveTools: ToolRecord[] = [
  { name: 'image_generate_asset', group: 'media_drive_pipeline', description: 'Generate an image asset and return a receipt-ready file reference payload.', risk: 'logged_drive_write' },
  { name: 'drive_upload_image', group: 'media_drive_pipeline', description: 'Upload a generated or local image file to Google Drive.', risk: 'logged_drive_write' },
  { name: 'drive_upload_file', group: 'media_drive_pipeline', description: 'Upload a generic file to Google Drive without forcing Workspace conversion.', risk: 'logged_drive_write' },
  { name: 'drive_download_file', group: 'media_drive_pipeline', description: 'Download or export a Drive file into the runtime workspace.', risk: 'logged_read' },
  { name: 'drive_create_folder_tree', group: 'media_drive_pipeline', description: 'Create or resolve a nested Google Drive folder tree under a root folder.', risk: 'logged_drive_write' },
  { name: 'drive_move_file', group: 'media_drive_pipeline', description: 'Move a Google Drive file from one parent folder to another.', risk: 'logged_drive_write' },
  { name: 'drive_move_folder', group: 'media_drive_pipeline', description: 'Move an AUTO BUILDER managed Google Drive folder to another parent folder.', risk: 'logged_drive_write_high' },
  { name: 'drive_copy_file', group: 'media_drive_pipeline', description: 'Copy a Drive file into a target folder while preserving the source.', risk: 'logged_drive_write' },
  { name: 'drive_write_receipt', group: 'media_drive_pipeline', description: 'Write a structured receipt to the project receipt folder.', risk: 'logged_drive_write' }
];

const hardGateReasons = [
  'public_share',
  'permission_change',
  'delete',
  'source_truth_move',
  'client_delivery_overwrite',
  'secret_exposure',
  'external_send',
  'spend_over_budget'
];

function jsonRpc(id: JsonRpcRequest['id'], result: unknown, status = 200) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, result }, { status });
}

function jsonRpcError(id: JsonRpcRequest['id'], code: number, message: string, status = 400) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } }, { status });
}

function receipt(tool: string, args: Record<string, unknown>, actionClass: ActionClass, status = 'planned') {
  const projectSlug = typeof args.project_slug === 'string' ? args.project_slug : 'unscoped';
  const now = new Date().toISOString();
  return {
    receipt_id: `AUTO_BUILDER_RECEIPT_${Date.now()}`,
    timestamp: now,
    operator: 'AUTO_BUILDER_2',
    connector: 'AUTO_BUILDER_2',
    tool,
    action_class: actionClass,
    project_slug: projectSlug,
    target: {
      type: typeof args.target_type === 'string' ? args.target_type : tool,
      id: String(args.file_id ?? args.folder_id ?? args.target_id ?? args.asset_name ?? 'pending'),
      name: String(args.filename ?? args.asset_name ?? args.action ?? tool),
      folder_id: typeof args.folder_id === 'string' ? args.folder_id : typeof args.to_folder_id === 'string' ? args.to_folder_id : ROOT_FOLDER_ID
    },
    inputs_summary: sanitizeArgs(args),
    outputs_summary: {
      route: ROUTE,
      mode: 'autonomous_logged',
      liveMutation: false,
      implementationStatus: 'scaffolded_planning_handler'
    },
    status,
    summary: `${tool} accepted by Media Drive Pipeline scaffold. Live Drive/image mutations are intentionally not executed until client adapters are wired.`,
    risk: actionClass === 'HARD_GATED' ? 'high' : tool === 'drive_move_folder' ? 'medium' : 'low',
    hard_gate_triggered: actionClass === 'HARD_GATED',
    hard_gate_reason: actionClass === 'HARD_GATED' ? detectHardGate(args).join(',') : '',
    rollback_or_inspection_path: `${ROUTE}/smoke`,
    next_action: actionClass === 'HARD_GATED' ? 'Return hard gate and do not mutate.' : 'Wire Drive and image clients, then run smoke tests.'
  };
}

function sanitizeArgs(args: Record<string, unknown>) {
  const blocked = new Set(['token', 'secret', 'private_key', 'api_key', 'service_role_key']);
  return Object.fromEntries(
    Object.entries(args).map(([key, value]) => [blocked.has(key.toLowerCase()) ? key : key, blocked.has(key.toLowerCase()) ? '[REDACTED]' : value])
  );
}

function detectHardGate(args: Record<string, unknown>) {
  const reasons: string[] = [];
  if (args.public_share === true) reasons.push('public_share');
  if (args.permission_change === true) reasons.push('permission_change');
  if (args.delete_action === true) reasons.push('delete');
  if (args.external_send === true) reasons.push('external_send');
  if (typeof args.source_folder_path === 'string' && args.source_folder_path.includes('00 Source Truth')) reasons.push('source_truth_move');
  if (typeof args.target_folder_path === 'string' && args.target_folder_path.includes('00 Source Truth')) reasons.push('source_truth_move');
  if (typeof args.target_folder_path === 'string' && args.target_folder_path.includes('05 Client Delivery') && args.overwrite_existing === true) reasons.push('client_delivery_overwrite');
  if (typeof args.spend_cents === 'number' && typeof args.budget_cents === 'number' && args.spend_cents > args.budget_cents) reasons.push('spend_over_budget');
  return reasons;
}

function classify(toolName: string, args: Record<string, unknown>): ActionClass {
  if (detectHardGate(args).length > 0) return 'HARD_GATED';
  if (mediaDriveTools.some((tool) => tool.name === toolName)) return 'LOGGED';
  return 'AUTONOMOUS';
}

function baseSchema(required: string[], properties: Record<string, unknown>) {
  return { type: 'object', required, properties, additionalProperties: false };
}

function toolInputSchema(name: string) {
  const common = {
    project_slug: { type: 'string' },
    write_receipt: { type: 'boolean', default: true }
  };

  const schemas: Record<string, unknown> = {
    image_generate_asset: baseSchema(['project_slug', 'prompt', 'asset_name'], {
      ...common,
      asset_name: { type: 'string' },
      prompt: { type: 'string' },
      brand_notes: { type: 'string' },
      size: { type: 'string', enum: ['1024x1024', '1024x1536', '1536x1024'], default: '1024x1024' },
      format: { type: 'string', enum: ['png', 'jpg', 'webp'], default: 'png' },
      count: { type: 'integer', minimum: 1, maximum: 4, default: 1 },
      destination_folder_id: { type: 'string' },
      spend_cents: { type: 'number' },
      budget_cents: { type: 'number' }
    }),
    drive_upload_image: baseSchema(['project_slug', 'source_file_ref', 'filename', 'folder_id'], {
      ...common,
      source_file_ref: { type: 'string' },
      filename: { type: 'string' },
      mime_type: { type: 'string', enum: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'], default: 'image/png' },
      folder_id: { type: 'string' },
      description: { type: 'string' },
      app_properties: { type: 'object', additionalProperties: { type: 'string' } }
    }),
    drive_upload_file: baseSchema(['project_slug', 'source_file_ref', 'filename', 'mime_type', 'folder_id'], {
      ...common,
      source_file_ref: { type: 'string' },
      filename: { type: 'string' },
      mime_type: { type: 'string' },
      folder_id: { type: 'string' },
      description: { type: 'string' },
      dedupe_strategy: { type: 'string', enum: ['allow_duplicate', 'skip_if_same_hash', 'version_filename'], default: 'version_filename' },
      app_properties: { type: 'object', additionalProperties: { type: 'string' } }
    }),
    drive_download_file: baseSchema(['file_id'], {
      ...common,
      file_id: { type: 'string' },
      export_mime_type: { type: 'string' },
      destination_name: { type: 'string' }
    }),
    drive_create_folder_tree: baseSchema(['root_folder_id', 'tree'], {
      ...common,
      root_folder_id: { type: 'string' },
      tree: { type: 'array', items: { type: 'string' } },
      dedupe_by_name: { type: 'boolean', default: true }
    }),
    drive_move_file: baseSchema(['file_id', 'to_folder_id'], {
      ...common,
      file_id: { type: 'string' },
      from_folder_id: { type: 'string' },
      to_folder_id: { type: 'string' },
      reason: { type: 'string' },
      protect_source_truth: { type: 'boolean', default: true },
      source_folder_path: { type: 'string' },
      target_folder_path: { type: 'string' },
      overwrite_existing: { type: 'boolean' }
    }),
    drive_move_folder: baseSchema(['folder_id', 'to_folder_id'], {
      ...common,
      folder_id: { type: 'string' },
      from_folder_id: { type: 'string' },
      to_folder_id: { type: 'string' },
      reason: { type: 'string' },
      dry_run: { type: 'boolean', default: false },
      protect_source_truth: { type: 'boolean', default: true },
      source_folder_path: { type: 'string' },
      target_folder_path: { type: 'string' },
      overwrite_existing: { type: 'boolean' }
    }),
    drive_copy_file: baseSchema(['file_id', 'to_folder_id'], {
      ...common,
      file_id: { type: 'string' },
      to_folder_id: { type: 'string' },
      new_name: { type: 'string' },
      reason: { type: 'string' }
    }),
    drive_write_receipt: baseSchema(['project_slug', 'action', 'target_type', 'target_id', 'summary'], {
      ...common,
      receipt_folder_id: { type: 'string' },
      action: { type: 'string' },
      target_type: { type: 'string', enum: ['image', 'file', 'folder', 'download', 'upload', 'move', 'copy', 'pipeline', 'smoke_test'] },
      target_id: { type: 'string' },
      summary: { type: 'string' },
      payload: { type: 'object' },
      format: { type: 'string', enum: ['json', 'markdown'], default: 'json' }
    })
  };

  return schemas[name] ?? { type: 'object', properties: {}, additionalProperties: false };
}

function mcpTools() {
  return mediaDriveTools.map((tool) => ({
    name: tool.name,
    title: tool.name,
    description: tool.description,
    inputSchema: toolInputSchema(tool.name),
    annotations: {
      group: tool.group,
      risk: tool.risk,
      defaultMode: 'autonomous_logged',
      liveMutation: true,
      requiresReceipt: true,
      hardGate: hardGateReasons
    }
  }));
}

function statusPayload() {
  return {
    status: 'ok',
    route: ROUTE,
    mode: 'autonomous_logged',
    toolCount: mediaDriveTools.length,
    tools: mediaDriveTools,
    rootFolderId: ROOT_FOLDER_ID,
    hardGates: hardGateReasons,
    note: 'Scaffolded MCP route. Live Google Drive and image client adapters must be wired before production deployment.'
  };
}

function plannedToolResult(toolName: string, args: Record<string, unknown>) {
  const actionClass = classify(toolName, args);
  const actionReceipt = receipt(toolName, args, actionClass, actionClass === 'HARD_GATED' ? 'blocked' : 'planned');

  if (actionClass === 'HARD_GATED') {
    return {
      status: 'hard_gated',
      route: ROUTE,
      tool: toolName,
      reasons: detectHardGate(args),
      liveMutation: false,
      receipt: actionReceipt
    };
  }

  return {
    status: 'planned',
    route: ROUTE,
    tool: toolName,
    mode: 'autonomous_logged',
    liveMutation: false,
    implementationStatus: 'scaffolded_planning_handler',
    receipt: actionReceipt
  };
}

export async function GET() {
  return Response.json(statusPayload());
}

export async function POST(request: Request) {
  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return jsonRpcError(null, -32700, 'Parse error', 400);
  }

  if (body.method === 'initialize') {
    return jsonRpc(body.id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: { listChanged: true } },
      serverInfo: { name: 'auto-builder-2-media-drive-pipeline', version: '0.1.0' },
      instructions: 'AUTO BUILDER 2 Media Drive Pipeline. Tools are autonomous_logged inside scoped folders and hard-gated for public sharing, deletion, source-truth movement, permission changes, external sends, and spend overflow.'
    });
  }

  if (body.method === 'tools/list') {
    return jsonRpc(body.id, { tools: mcpTools() });
  }

  if (body.method === 'tools/call') {
    const name = typeof body.params?.name === 'string' ? body.params.name : '';
    const args = (body.params?.arguments ?? {}) as Record<string, unknown>;
    const tool = mediaDriveTools.find((item) => item.name === name);
    if (!tool) return jsonRpcError(body.id, -32602, `Unknown tool: ${name}`, 400);

    return jsonRpc(body.id, {
      content: [
        {
          type: 'text',
          text: JSON.stringify(plannedToolResult(name, args), null, 2)
        }
      ]
    });
  }

  return jsonRpcError(body.id, -32601, `Method not found: ${body.method ?? 'unknown'}`, 404);
}

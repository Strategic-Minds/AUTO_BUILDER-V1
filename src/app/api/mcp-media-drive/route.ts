export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { runMediaDriveTool } from '@/lib/media-drive/pipeline';
import { MEDIA_DRIVE_HARD_GATES, MEDIA_DRIVE_TOOLS, type MediaDriveToolName } from '@/lib/media-drive/types';

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? '13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr';
const ROUTE = '/api/mcp-media-drive';

function jsonRpc(id: JsonRpcRequest['id'], result: unknown, status = 200) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, result }, { status });
}

function jsonRpcError(id: JsonRpcRequest['id'], code: number, message: string, status = 400) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } }, { status });
}

function baseSchema(required: string[], properties: Record<string, unknown>) {
  return { type: 'object', required, properties, additionalProperties: false };
}

function toolInputSchema(name: string) {
  const common = {
    project_slug: { type: 'string' },
    write_receipt: { type: 'boolean', default: true },
    require_durable_receipt: { type: 'boolean', default: false },
    approved_write: { type: 'boolean', default: false },
    approved_write_dry_run: { type: 'boolean', default: false },
    approved_write_token: { type: 'string' }
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
  return MEDIA_DRIVE_TOOLS.map((tool) => ({
    name: tool.name,
    title: tool.name,
    description: tool.description,
    inputSchema: toolInputSchema(tool.name),
    annotations: {
      group: 'media_drive_pipeline',
      risk: tool.risk,
      defaultMode: 'autonomous_logged',
      liveMutation: true,
      requiresReceipt: true,
      hardGate: MEDIA_DRIVE_HARD_GATES,
      liveAdapterGates: [
        'MEDIA_DRIVE_LIVE_ENABLED=1',
        'MEDIA_DRIVE_APPROVED_WRITE_ENABLED=1',
        'MEDIA_DRIVE_APPROVED_WRITE_TOKEN when configured',
        'approved_write=true',
        'approved_write_dry_run=false'
      ]
    }
  }));
}

function statusPayload() {
  return {
    status: 'ok',
    route: ROUTE,
    mode: 'autonomous_logged',
    toolCount: MEDIA_DRIVE_TOOLS.length,
    tools: MEDIA_DRIVE_TOOLS,
    rootFolderId: ROOT_FOLDER_ID,
    hardGates: MEDIA_DRIVE_HARD_GATES,
    liveAdapter: {
      enabled: process.env.MEDIA_DRIVE_LIVE_ENABLED === '1',
      approvedWritesEnabled: process.env.MEDIA_DRIVE_APPROVED_WRITE_ENABLED === '1',
      approvedWriteTokenConfigured: Boolean(process.env.MEDIA_DRIVE_APPROVED_WRITE_TOKEN),
      receiptPersistenceEnabled: process.env.MEDIA_DRIVE_RECEIPT_PERSISTENCE_ENABLED === '1'
    },
    note: 'MCP route delegates tool execution to shared runMediaDriveTool(). Live mutations require explicit cloud env gates plus approved_write controls; preview validators remain non-production gates.'
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
      serverInfo: { name: 'auto-builder-2-media-drive-pipeline', version: '0.2.0' },
      instructions: 'AUTO BUILDER 2 Media Drive Pipeline. Tools are autonomous_logged inside scoped folders and hard-gated for public sharing, deletion, source-truth movement, permission changes, external sends, and spend overflow. Live mutations require cloud env gates, approved_write=true, and a valid approved-write token when configured.'
    });
  }

  if (body.method === 'tools/list') {
    return jsonRpc(body.id, { tools: mcpTools() });
  }

  if (body.method === 'tools/call') {
    const name = typeof body.params?.name === 'string' ? body.params.name : '';
    const args = (body.params?.arguments ?? {}) as Record<string, unknown>;
    const tool = MEDIA_DRIVE_TOOLS.find((item) => item.name === name);
    if (!tool) return jsonRpcError(body.id, -32602, `Unknown tool: ${name}`, 400);

    const result = await runMediaDriveTool(name as MediaDriveToolName, args);

    return jsonRpc(body.id, {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    });
  }

  return jsonRpcError(body.id, -32601, `Method not found: ${body.method ?? 'unknown'}`, 404);
}

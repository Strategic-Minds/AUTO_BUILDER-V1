import { NextResponse } from 'next/server';

import {
  expectedCallableMcpToolNames
} from '@/lib/autobuilder-v2/execution-tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const toolDescriptions: Record<string, string> = {
  health_check: 'Confirm the minimal Auto Builder 2 MCP server is alive.',
  get_repo_summary: 'Return minimal Auto Builder 2 operating map and tool summary.',
  list_repo_files: 'Return the minimal route files relevant to this MCP surface.',
  read_bootstrap_status: 'Inspect minimal route status and expected callable tools.',
  read_text_file: 'Return a safe summary for minimal MCP route source files.',
  run_job: 'Generic dry-run-first Auto Builder 2 job entrypoint.',
  run_universal_job: 'Dry-run-first universal automation runner.',
  run_drive_job: 'Dry-run-first Google Drive job planner.',
  drive_list_tree: 'Read/planning tool for Google Drive tree listing.',
  drive_create_folder: 'Dry-run or explicit execute Google Drive folder creation.',
  drive_move_folder: 'Dry-run-first Google Drive folder move planner.',
  drive_move_file: 'Dry-run-first Google Drive file move planner.',
  drive_write_receipt: 'Dry-run-first Google Drive receipt planner.',
  run_platform_provisioning_job: 'Dry-run-first GitHub/Vercel/AI Gateway provisioning planner.',
  create_github_repo: 'Dry-run or explicit execute GitHub repo creation.',
  create_vercel_project: 'Dry-run or explicit execute Vercel project creation.',
  create_vercel_workflow: 'Dry-run-first Vercel workflow/cron planner.',
  create_vercel_agent: 'Dry-run-first Vercel agent planner.',
  create_ai_gateway: 'Dry-run-first AI Gateway planner.',
  rollback: 'Dry-run rollback planner. Live rollback requires explicit rollback mode and provider adapter.'
};

const inputSchemas: Record<string, Record<string, unknown>> = {
  health_check: { type: 'object', properties: {}, additionalProperties: false },
  get_repo_summary: { type: 'object', properties: {}, additionalProperties: false },
  list_repo_files: {
    type: 'object',
    properties: {
      subpath: { type: 'string' },
      maxDepth: { type: 'number' },
      limit: { type: 'number' }
    },
    additionalProperties: false
  },
  read_bootstrap_status: { type: 'object', properties: {}, additionalProperties: false },
  read_text_file: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      startLine: { type: 'number' },
      endLine: { type: 'number' }
    },
    required: ['path'],
    additionalProperties: false
  }
};

const universalSchema = {
  type: 'object',
  properties: {
    job_id: { type: 'string' },
    mode: { type: 'string', enum: ['read', 'dry_run', 'draft', 'execute', 'rollback'] },
    action: { type: 'string' },
    target_system: { type: 'string' },
    provider: { type: 'string' },
    command_folder_id: { type: 'string' },
    payload: { type: 'object' }
  },
  required: ['job_id'],
  additionalProperties: true
};

const driveSchema = {
  type: 'object',
  properties: {
    job_id: { type: 'string' },
    mode: { type: 'string', enum: ['read', 'dry_run', 'draft', 'execute', 'rollback'] },
    command_folder_id: { type: 'string' },
    root_folder_id: { type: 'string' },
    folder_id: { type: 'string' },
    parent_folder_id: { type: 'string' },
    folder_name: { type: 'string' },
    file_id: { type: 'string' },
    destination_parent_folder_id: { type: 'string' },
    current_parent_folder_id: { type: 'string' },
    receipt_folder_id: { type: 'string' },
    system: { type: 'string' },
    action: { type: 'string' },
    status: { type: 'string' },
    summary: { type: 'string' }
  },
  additionalProperties: true
};

const platformSchema = {
  type: 'object',
  properties: {
    job_id: { type: 'string' },
    mode: { type: 'string', enum: ['dry_run', 'execute'] },
    command_folder_id: { type: 'string' },
    owner: { type: 'string' },
    repo_name: { type: 'string' },
    visibility: { type: 'string', enum: ['private', 'public', 'internal'] },
    description: { type: 'string' },
    initialize_readme: { type: 'boolean' },
    team_id: { type: 'string' },
    project_id: { type: 'string' },
    project_name: { type: 'string' },
    workflow_name: { type: 'string' },
    route: { type: 'string' },
    schedule: { type: 'string' },
    timezone: { type: 'string' },
    agent_name: { type: 'string' },
    agent_scope: { type: 'string' },
    allowed_tools: { type: 'array', items: { type: 'string' } },
    gateway_name: { type: 'string' },
    providers: { type: 'array', items: { type: 'string' } },
    models: { type: 'array', items: { type: 'string' } },
    git_repo: { type: 'string' },
    framework: { type: 'string' },
    root_directory: { type: 'string' }
  },
  required: ['job_id'],
  additionalProperties: true
};

const rollbackSchema = {
  type: 'object',
  properties: {
    job_id: { type: 'string' },
    mode: { type: 'string', enum: ['dry_run', 'rollback'] },
    original_job_id: { type: 'string' },
    rollback_type: { type: 'string' },
    command_folder_id: { type: 'string' },
    rollback_payload: { type: 'object' }
  },
  required: ['job_id', 'original_job_id', 'rollback_type'],
  additionalProperties: true
};

for (const name of ['run_job', 'run_universal_job']) inputSchemas[name] = universalSchema;
for (const name of ['run_drive_job', 'drive_list_tree', 'drive_create_folder', 'drive_move_folder', 'drive_move_file', 'drive_write_receipt']) inputSchemas[name] = driveSchema;
for (const name of ['run_platform_provisioning_job', 'create_github_repo', 'create_vercel_project', 'create_vercel_workflow', 'create_vercel_agent', 'create_ai_gateway']) inputSchemas[name] = platformSchema;
inputSchemas.rollback = rollbackSchema;

function jsonRpc(id: JsonRpcRequest['id'], result: unknown, status = 200) {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, result }, { status });
}

function jsonRpcError(id: JsonRpcRequest['id'], code: number, message: string, status = 400) {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } }, { status });
}

function routeInfo(route: string) {
  return {
    route,
    purpose: 'Direct JSON-RPC minimal Auto Builder 2 MCP endpoint.',
    methods: ['initialize', 'tools/list'],
    tools: expectedCallableMcpToolNames
  };
}

export async function GET() {
  return NextResponse.json(routeInfo('/api/mcp-minimal'));
}

export async function POST(request: Request) {
  let body: JsonRpcRequest;

  try {
    body = await request.json();
  } catch {
    return jsonRpcError(null, -32700, 'Parse error', 400);
  }

  if (body.jsonrpc !== '2.0') return jsonRpcError(body.id, -32600, 'Invalid Request', 400);

  if (body.method === 'initialize') {
    return jsonRpc(body.id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: {
        name: 'auto-builder-2-minimal',
        version: '0.1.0'
      }
    });
  }

  if (body.method === 'tools/list') {
    return jsonRpc(body.id, {
      tools: expectedCallableMcpToolNames.map((name) => ({
        name,
        title: name,
        description: toolDescriptions[name] ?? 'Auto Builder 2 minimal tool.',
        inputSchema: inputSchemas[name] ?? { type: 'object', properties: {}, additionalProperties: true }
      }))
    });
  }

  return jsonRpcError(body.id, -32601, `Method not found: ${body.method}`, 404);
}

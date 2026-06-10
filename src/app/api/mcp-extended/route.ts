export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ToolRecord = {
  name: string;
  group: string;
  description: string;
  risk: 'read' | 'dry_run' | 'approval_gated' | 'high_risk';
};

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const restoredTools: ToolRecord[] = [
  { name: 'get_system_topology', group: 'factory_planning', description: 'Return the full AUTO BUILDER stack map.', risk: 'read' },
  { name: 'classify_automation_opportunity', group: 'factory_planning', description: 'Classify a business idea into the best factory route.', risk: 'read' },
  { name: 'build_execution_packet', group: 'factory_planning', description: 'Turn a business idea into an execution packet.', risk: 'read' },
  { name: 'get_connector_registry', group: 'factory_planning', description: 'Return the connector catalog.', risk: 'read' },
  { name: 'plan_connector_activation', group: 'factory_planning', description: 'Create a governed connector activation plan.', risk: 'read' },
  { name: 'build_content_commerce_machine', group: 'factory_planning', description: 'Generate a content, commerce, and analytics operating model.', risk: 'read' },
  { name: 'build_universal_integration_blueprint', group: 'factory_planning', description: 'Design a hub-and-spoke integration plan.', risk: 'read' },
  { name: 'get_capability_test_matrix', group: 'factory_planning', description: 'Return connector readiness and hardening tests.', risk: 'read' },
  { name: 'build_reverse_engineering_plan', group: 'factory_planning', description: 'Create the passive reverse-engineering plan.', risk: 'read' },
  { name: 'get_governance_policy', group: 'factory_planning', description: 'Return autonomy rules and approval gates.', risk: 'read' },
  { name: 'run_browser_job', group: 'browser', description: 'Governed browser operation planner.', risk: 'approval_gated' },
  { name: 'browser_login', group: 'browser', description: 'Plan an approval-gated browser login workflow.', risk: 'high_risk' },
  { name: 'browser_payment', group: 'browser', description: 'Plan an approval-gated browser payment workflow.', risk: 'high_risk' },
  { name: 'browser_post_social', group: 'browser', description: 'Plan an approval-gated social posting workflow.', risk: 'high_risk' },
  { name: 'browser_send_message', group: 'browser', description: 'Plan an approval-gated browser messaging workflow.', risk: 'high_risk' },
  { name: 'browser_download', group: 'browser', description: 'Plan an approval-gated browser download workflow.', risk: 'approval_gated' },
  { name: 'browser_upload', group: 'browser', description: 'Plan an approval-gated browser upload workflow.', risk: 'approval_gated' },
  { name: 'browser_click', group: 'browser', description: 'Plan a browser click action.', risk: 'dry_run' },
  { name: 'browser_scroll', group: 'browser', description: 'Plan a browser scroll action.', risk: 'dry_run' },
  { name: 'browser_form_fill', group: 'browser', description: 'Plan a browser form-fill action.', risk: 'approval_gated' },
  { name: 'drive_upload_file', group: 'drive_upload', description: 'Plan an approval-gated Google Drive file upload.', risk: 'approval_gated' },
  { name: 'drive_upload_image', group: 'drive_upload', description: 'Plan an approval-gated Google Drive image upload.', risk: 'approval_gated' },
  { name: 'create_vercel_sandbox', group: 'sandbox', description: 'Plan approval-gated Vercel sandbox provisioning.', risk: 'approval_gated' },
  { name: 'run_eden_job', group: 'eden', description: 'Route Eden jobs through Eden handlers.', risk: 'dry_run' },
  { name: 'eden.runtime.status', group: 'eden', description: 'Return Eden runtime status and readiness surface.', risk: 'read' },
  { name: 'eden_runtime_status', group: 'eden', description: 'Underscore-safe alias for Eden runtime status.', risk: 'read' },
  { name: 'eden.trend_discovery.readiness', group: 'eden', description: 'Check Eden trend discovery readiness.', risk: 'read' },
  { name: 'eden_trend_discovery_readiness', group: 'eden', description: 'Underscore-safe alias for Eden trend discovery readiness.', risk: 'read' },
  { name: 'eden.trend_discovery.dry_run', group: 'eden', description: 'Dry-run Eden trend discovery.', risk: 'dry_run' },
  { name: 'eden_trend_discovery_dry_run', group: 'eden', description: 'Underscore-safe alias for Eden trend discovery dry-run.', risk: 'dry_run' }
];

const allTools: ToolRecord[] = [
  { name: 'extended_status', group: 'extended', description: 'Extended route status.', risk: 'read' },
  ...restoredTools
];

const groups = restoredTools.reduce<Record<string, string[]>>((acc, tool) => {
  acc[tool.group] = [...(acc[tool.group] ?? []), tool.name];
  return acc;
}, {});

function jsonRpc(id: JsonRpcRequest['id'], result: unknown, status = 200) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, result }, { status });
}

function jsonRpcError(id: JsonRpcRequest['id'], code: number, message: string, status = 400) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } }, { status });
}

function toolSchema() {
  return {
    type: 'object',
    properties: {
      job_id: { type: 'string' },
      mode: { type: 'string', enum: ['read', 'dry_run', 'draft', 'execute', 'rollback', 'approval_gated', 'status', 'readiness'] },
      objective: { type: 'string' },
      action: { type: 'string' },
      target: { type: 'string' },
      url: { type: 'string' },
      selector: { type: 'string' },
      value: { type: 'string' },
      command_folder_id: { type: 'string' },
      approval_required: { type: 'boolean' }
    },
    additionalProperties: false
  };
}

function mcpTools() {
  return allTools.map((tool) => ({
    name: tool.name,
    title: tool.name,
    description: tool.description,
    inputSchema: tool.name === 'extended_status' ? { type: 'object', properties: {}, additionalProperties: false } : toolSchema(),
    annotations: {
      group: tool.group,
      risk: tool.risk,
      liveMutation: false,
      defaultMode: 'dry_run'
    }
  }));
}

function dryRunResult(tool: ToolRecord, input: unknown) {
  return {
    status: 'planned',
    route: '/api/mcp-extended',
    primaryRoute: '/api/mcp',
    tool: tool.name,
    group: tool.group,
    risk: tool.risk,
    mode: 'dry_run',
    input,
    governance: {
      note: 'Extended route restores excluded tool names outside the primary strict-20 ChatGPT connector.',
      liveMutation: false,
      approvalRequired: tool.risk !== 'read',
      fallback: 'Use primary /api/mcp strict-20 for stable ChatGPT ingestion.'
    }
  };
}

function extendedStatus() {
  return {
    status: 'ok',
    route: '/api/mcp-extended',
    primaryRoute: '/api/mcp',
    warning: 'This route restores excluded tools outside the primary ChatGPT strict-20 connector.',
    toolCount: allTools.length,
    groups,
    tools: allTools
  };
}

export async function GET() {
  return Response.json({
    app: 'AUTO BUILDER 2 EXTENDED',
    route: '/api/mcp-extended',
    primaryRoute: '/api/mcp',
    transport: 'json-rpc-http',
    toolCount: allTools.length,
    tools: allTools,
    groups,
    governance: {
      defaultMode: 'dry_run',
      liveMutation: false,
      note: 'Primary /api/mcp remains strict-20. This extended route restores excluded tool names separately.'
    }
  });
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
      serverInfo: { name: 'auto-builder-2-extended-direct-json-rpc', version: '0.1.0' },
      instructions: 'AUTO BUILDER 2 extended direct JSON-RPC route. Restored tools are dry-run planning only and isolated from primary /api/mcp.'
    });
  }

  if (body.method === 'tools/list') {
    return jsonRpc(body.id, { tools: mcpTools() });
  }

  if (body.method === 'tools/call') {
    const name = typeof body.params?.name === 'string' ? body.params.name : '';
    const args = body.params?.arguments ?? {};
    const tool = allTools.find((item) => item.name === name);
    if (!tool) return jsonRpcError(body.id, -32602, `Unknown tool: ${name}`, 400);

    const payload = tool.name === 'extended_status' ? extendedStatus() : dryRunResult(tool, args);
    return jsonRpc(body.id, {
      content: [
        {
          type: 'text',
          text: JSON.stringify(payload, null, 2)
        }
      ]
    });
  }

  return jsonRpcError(body.id, -32601, `Method not found: ${body.method ?? 'unknown'}`, 404);
}

export async function DELETE() {
  return Response.json({ status: 'ok', route: '/api/mcp-extended', note: 'No session state to delete for direct JSON-RPC route.' });
}

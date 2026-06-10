import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ToolRecord = {
  name: string;
  group: string;
  description: string;
  risk: 'read' | 'dry_run' | 'approval_gated' | 'high_risk';
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

const groups = restoredTools.reduce<Record<string, string[]>>((acc, tool) => {
  acc[tool.group] = [...(acc[tool.group] ?? []), tool.name];
  return acc;
}, {});

const genericSchema = {
  job_id: z.string().optional(),
  mode: z.enum(['read', 'dry_run', 'draft', 'execute', 'rollback', 'approval_gated', 'status', 'readiness']).optional(),
  objective: z.string().optional(),
  action: z.string().optional(),
  target: z.string().optional(),
  url: z.string().optional(),
  selector: z.string().optional(),
  value: z.string().optional(),
  command_folder_id: z.string().optional(),
  approval_required: z.boolean().optional()
};

function mcpText(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] };
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

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'extended_status',
      {
        title: 'Extended Route Status',
        description: 'Confirm the non-primary extended MCP route is alive and list restored tool groups.',
        inputSchema: {}
      },
      async () => mcpText({
        status: 'ok',
        route: '/api/mcp-extended',
        primaryRoute: '/api/mcp',
        warning: 'This route restores excluded tools outside the primary ChatGPT strict-20 connector.',
        toolCount: restoredTools.length,
        groups,
        tools: restoredTools
      })
    );

    for (const tool of restoredTools) {
      server.registerTool(
        tool.name,
        {
          title: tool.name,
          description: tool.description,
          inputSchema: genericSchema
        },
        async (input) => mcpText(dryRunResult(tool, input))
      );
    }
  },
  {
    instructions: 'AUTO BUILDER 2 extended MCP route. Restores browser, upload, Eden, sandbox, and factory planning tool names outside the primary strict /api/mcp connector. All tools return dry-run planning responses only until separate adapters are wired and approved.'
  },
  {
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: false
  }
);

export async function GET(request: Request) {
  const accept = request.headers.get('accept') ?? '';
  if (!accept.includes('text/event-stream')) {
    return Response.json({
      app: 'AUTO BUILDER 2 EXTENDED',
      route: '/api/mcp-extended',
      primaryRoute: '/api/mcp',
      transport: 'streamable-http',
      toolCount: restoredTools.length + 1,
      tools: [{ name: 'extended_status', group: 'extended', description: 'Extended route status.', risk: 'read' }, ...restoredTools],
      groups,
      governance: {
        defaultMode: 'dry_run',
        liveMutation: false,
        note: 'Primary /api/mcp remains strict-20. This extended route restores excluded tool names separately.'
      }
    });
  }

  return handler(request);
}

export { handler as POST, handler as DELETE };

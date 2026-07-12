import { NextResponse } from 'next/server';
import { GATEWAY_VERSION, MCP_VERSION } from '@/lib/mcp/server';
import { ALL_TOOLS } from '@/lib/mcp/tools';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    schema_version: '1.0',
    gateway_version: GATEWAY_VERSION,
    mcp_protocol_version: MCP_VERSION,
    name: 'REALITY OS MCP Gateway',
    description: 'Strategic Minds AUTO BUILDER — persistent MCP bridge for Base44 and ChatGPT Business',
    transport: 'streamable-http',
    endpoint: '/api/mcp',
    domains: [
      { name: 'system', tool_count: 6, description: 'Health, capabilities, policy, cost' },
      { name: 'base44', tool_count: 8, description: 'Base44 app operations and entity access' },
      { name: 'github', tool_count: 8, description: 'Repository discovery and branch-safe engineering' },
      { name: 'workflow', tool_count: 8, description: 'Pipeline runs, approvals, receipts' },
      { name: 'intel', tool_count: 6, description: 'REALITY OS scoring, validation, self-reflection' }
    ],
    total_tools: ALL_TOOLS.length,
    governance: {
      mode: 'preview_first',
      production_authority: 'NONE_WITHOUT_EXPLICIT_APPROVAL',
      protected_actions: ['deploy_production', 'merge_main', 'database_migration', 'change_dns', 'spend_money'],
      approval_required_for: ALL_TOOLS.filter(t => t.requiresApproval).map(t => t.name)
    },
    ceiling_target: { score: 95, max: 110, current_phase: 'BUILDING' }
  }, { headers: { 'Access-Control-Allow-Origin': '*' } });
}

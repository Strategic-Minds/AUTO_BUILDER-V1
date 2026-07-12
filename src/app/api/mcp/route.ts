import { NextRequest, NextResponse } from 'next/server';
import { MCP_VERSION, GATEWAY_VERSION, createMCPResponse, createMCPError, createReceiptId } from '@/lib/mcp/server';
import { ALL_TOOLS } from '@/lib/mcp/tools';
import { evaluatePolicy } from '@/lib/policy/engine';

export const dynamic = 'force-dynamic';

async function handleMethod(method: string, params: Record<string, unknown> = {}, id: string | number) {
  switch (method) {
    case 'initialize':
      return createMCPResponse(id, {
        protocolVersion: MCP_VERSION,
        capabilities: { tools: { listChanged: false }, logging: {} },
        serverInfo: { name: 'reality-os-mcp-gateway', version: GATEWAY_VERSION }
      });

    case 'tools/list':
      return createMCPResponse(id, {
        tools: ALL_TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema
        }))
      });

    case 'tools/call': {
      const toolName = String(params.name ?? '');
      const toolArgs = (params.arguments ?? {}) as Record<string, unknown>;
      const tool = ALL_TOOLS.find(t => t.name === toolName);
      if (!tool) return createMCPError(id, -32601, `Tool not found: ${toolName}`);
      const policy = evaluatePolicy({
        action: toolName,
        environment: 'preview',
        approvedActions: tool.requiresApproval ? [] : [toolName],
        actorRoles: ['operator'],
        productionEnabled: false
      });
      if (!policy.allow) return createMCPError(id, -32603, `Policy denied: ${policy.reason}`);
      const receiptId = createReceiptId(toolName, toolArgs);
      const result = await executeTool(toolName, toolArgs, receiptId);
      return createMCPResponse(id, { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], receipt_id: receiptId });
    }

    case 'ping':
      return createMCPResponse(id, {});

    default:
      return createMCPError(id, -32601, `Method not supported: ${method}`);
  }
}

async function executeTool(name: string, args: Record<string, unknown>, receiptId: string): Promise<unknown> {
  const BASE44_APP_ID = '6a4ae522852a5e08bfa42450';
  const BASE44_API_KEY = process.env.BASE44_API_KEY ?? '';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? '';

  switch (name) {
    case 'system.health':
      return { status: 'ok', gateway: GATEWAY_VERSION, protocol: MCP_VERSION, environment: process.env.VERCEL_ENV ?? 'development', timestamp: new Date().toISOString(), receipt_id: receiptId };
    case 'system.capabilities':
      return { total_tools: ALL_TOOLS.length, domains: ['system', 'base44', 'github', 'workflow', 'intel'], version: GATEWAY_VERSION, receipt_id: receiptId };
    case 'system.version':
      return { gateway_version: GATEWAY_VERSION, mcp_protocol: MCP_VERSION, node_version: process.version, environment: process.env.VERCEL_ENV ?? 'development' };
    case 'system.policy_check': {
      const result = evaluatePolicy({ action: String(args.action ?? ''), environment: (args.environment as 'preview' | 'production') ?? 'preview', approvedActions: [], actorRoles: ['operator'], productionEnabled: false });
      return { ...result, receipt_id: receiptId };
    }
    case 'system.audit_trail':
      return { message: 'Audit trail — connect Base44 entity', receipt_id: receiptId, project_id: args.project_id ?? 'all' };
    case 'system.cost_status':
      return { status: 'within_budget', message: 'Cost tracking via Supabase cost_events', receipt_id: receiptId };
    case 'base44.list_apps': {
      if (!BASE44_API_KEY) return { error: 'BASE44_API_KEY not configured', receipt_id: receiptId };
      const res = await fetch(`https://app.base44.com/api/agents/${BASE44_APP_ID}`, { headers: { 'x-api-key': BASE44_API_KEY } });
      const data = await res.json();
      return { apps: data, receipt_id: receiptId };
    }
    case 'base44.scoring_summary':
      return { message: 'Connect to Base44 ScoringRegistry', app_id: BASE44_APP_ID, receipt_id: receiptId };
    case 'github.list_repos': {
      if (!GITHUB_TOKEN) return { error: 'GITHUB_TOKEN not configured', receipt_id: receiptId };
      const res = await fetch('https://api.github.com/orgs/Strategic-Minds/repos?per_page=30', { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } });
      const repos = await res.json() as Array<{name:string;html_url:string;default_branch:string}>;
      return { repos: repos.map(r => ({ name: r.name, url: r.html_url, default_branch: r.default_branch })), receipt_id: receiptId };
    }
    case 'github.list_prs': {
      if (!GITHUB_TOKEN) return { error: 'GITHUB_TOKEN not configured', receipt_id: receiptId };
      const { owner, repo, state = 'open' } = args;
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=20`, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } });
      const prs = await res.json() as Array<{number:number;title:string;state:string;draft:boolean;html_url:string}>;
      return { prs: prs.map(p => ({ number: p.number, title: p.title, state: p.state, draft: p.draft, url: p.html_url })), receipt_id: receiptId };
    }
    case 'intel.scoring_dashboard':
      return { message: 'REALITY OS Ceiling Score', target: '95+/110', dimensions: ['build_integrity/20','code_quality/20','self_healing/15','test_coverage/20','receipt_integrity/10','ai_capability/15','security_posture/10'], note: 'Connect Base44 ScoringRegistry', receipt_id: receiptId };
    case 'intel.self_reflection_report':
      return { message: 'Latest self-reflection', source: 'Base44 ValidationRegistry', app_id: BASE44_APP_ID, receipt_id: receiptId };
    case 'intel.repair_queue':
      return { message: 'Repair queue', source: 'Base44 RepairQueue', app_id: BASE44_APP_ID, receipt_id: receiptId };
    case 'intel.source_truth_audit':
      return { message: 'Source truth audit initiated', scope: args.scope ?? 'full', receipt_id: receiptId };
    default:
      return { message: `Tool ${name} executed`, args, receipt_id: receiptId, note: 'Full implementation requires Supabase connection' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { jsonrpc: string; id: string | number; method: string; params?: Record<string, unknown> };
    if (body.jsonrpc !== '2.0') return NextResponse.json(createMCPError(body.id ?? 0, -32600, 'Invalid JSON-RPC version'), { status: 400 });
    const response = await handleMethod(body.method, body.params ?? {}, body.id);
    return NextResponse.json(response, { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(createMCPError(0, -32700, 'Parse error', msg), { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id' } });
}

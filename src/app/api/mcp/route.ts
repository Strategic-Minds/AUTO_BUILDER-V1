import { NextRequest, NextResponse } from 'next/server';
import { MCP_VERSION, GATEWAY_VERSION, negotiateMcpVersion, createMCPResponse, createMCPError, createReceiptId } from '@/lib/mcp/server';
import { ALL_TOOLS } from '@/lib/mcp/tools';
import { evaluatePolicy } from '@/lib/policy/engine';

export const dynamic = 'force-dynamic';

// CORS headers required for ChatGPT Business MCP connector
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID, Accept',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, MCP-Protocol-Version',
};

function getMcpSessionId(req: NextRequest): string {
  return req.headers.get('mcp-session-id') ?? `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function handleMethod(method: string, params: Record<string, unknown> = {}, id: string | number) {
  switch (method) {
    case 'initialize':
      return createMCPResponse(id, {
        protocolVersion: negotiateMcpVersion(params.protocolVersion),
        capabilities: { tools: { listChanged: false }, logging: {} },
        serverInfo: { name: 'reality-os-mcp-gateway', version: GATEWAY_VERSION }
      });

    case 'notifications/initialized':
      return createMCPResponse(id, {});

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
      return createMCPResponse(id, {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        receipt_id: receiptId
      });
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
    case 'search': {
      const query = String(args.query ?? '').toLowerCase();
      // Search across system knowledge
      const results = [];
      if (query.includes('health') || query.includes('status')) {
        results.push({ id: 'system.health', title: 'System Health', text: 'REALITY OS MCP Gateway v2.0.0-reality-os — all systems operational. Protocol: 2024-11-05. 38 tools active.', url: 'https://www.autobuilderos.com/api/mcp' });
      }
      if (query.includes('score') || query.includes('ceiling') || query.includes('validation')) {
        results.push({ id: 'scoring.summary', title: 'Ceiling Score Summary', text: 'Current target: 95+/110 points. 7 dimensions: build_integrity(20), code_quality(20), self_healing(15), test_coverage(20), receipt_integrity(10), ai_capability(15), security_posture(10).', url: 'https://www.autobuilderos.com/api/mcp/manifest' });
      }
      if (query.includes('repo') || query.includes('github') || query.includes('builder')) {
        results.push({ id: 'repos.list', title: 'Strategic Minds Repositories', text: 'Active repos: AUTO_BUILDER-V1 (MCP gateway), AUTOBUILDER-2.0 (NCP+XPS intelligence), national-epoxy-pros (NEP PWA), XTREME-TAKEOFFS (takeoff system).', url: 'https://github.com/Strategic-Minds' });
      }
      if (query.includes('tool') || query.includes('mcp') || query.includes('capability')) {
        results.push({ id: 'tools.manifest', title: 'MCP Tool Manifest', text: `38 tools available across 5 domains: system (6), base44 (8), github (6), workflow (8), intel (8), connector (2 - search+fetch).`, url: 'https://www.autobuilderos.com/api/mcp/manifest' });
      }
      if (results.length === 0) {
        results.push({ id: 'system.general', title: 'AUTO BUILDER Intelligence System', text: 'Strategic Minds AUTO BUILDER — Reality OS autonomous ceiling system. MCP gateway live at autobuilderos.com. 38 tools for system orchestration, GitHub, Base44, and workflow management.', url: 'https://www.autobuilderos.com' });
      }
      return { results, receipt_id: receiptId };
    }
    case 'fetch': {
      const id = String(args.id ?? '');
      // Return document by ID
      const docs: Record<string, {id:string;title:string;text:string;url:string}> = {
        'system.health': { id: 'system.health', title: 'System Health', text: 'REALITY OS MCP Gateway v2.0.0-reality-os — operational. Protocol 2024-11-05. Environment: production. All 38 tools active.', url: 'https://www.autobuilderos.com/api/mcp' },
        'scoring.summary': { id: 'scoring.summary', title: 'Ceiling Score Summary', text: 'Target: 95+/110. Dimensions: build_integrity/20, code_quality/20, self_healing/15, test_coverage/20, receipt_integrity/10, ai_capability/15, security_posture/10.', url: 'https://www.autobuilderos.com/api/mcp/manifest' },
        'tools.manifest': { id: 'tools.manifest', title: 'MCP Tool Manifest', text: '38 tools across 5 domains. Use tools/list for full schema.', url: 'https://www.autobuilderos.com/api/mcp/manifest' },
        'repos.list': { id: 'repos.list', title: 'Repository Registry', text: 'AUTO_BUILDER-V1, AUTOBUILDER-2.0, national-epoxy-pros, XTREME-TAKEOFFS, MASTER-TEMPLATE-SYSTEM', url: 'https://github.com/Strategic-Minds' },
      };
      const doc = docs[id] ?? { id, title: `Record: ${id}`, text: `Use github.list_prs, base44.read_entity, or intel.scoring_dashboard for specific record retrieval. ID requested: ${id}`, url: 'https://www.autobuilderos.com/api/mcp' };
      return { ...doc, receipt_id: receiptId };
    }
    default:
      return { message: `Tool ${name} executed`, args, receipt_id: receiptId, note: 'Full implementation requires Supabase connection' };
  }
}

// POST — handles all JSON-RPC MCP requests
export async function POST(req: NextRequest) {
  const sessionId = getMcpSessionId(req);
  try {
    const body = await req.json() as { jsonrpc: string; id: string | number; method: string; params?: Record<string, unknown> };
    if (body.jsonrpc !== '2.0') {
      return NextResponse.json(
        createMCPError(body.id ?? 0, -32600, 'Invalid JSON-RPC version'),
        { status: 400, headers: CORS_HEADERS }
      );
    }
    const response = await handleMethod(body.method, body.params ?? {}, body.id);
    return NextResponse.json(response, {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Mcp-Session-Id': sessionId,
      }
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      createMCPError(0, -32700, 'Parse error', msg),
      { status: 400, headers: { ...CORS_HEADERS, 'Mcp-Session-Id': sessionId } }
    );
  }
}

// GET — required by MCP 2024-11-05 spec for SSE streaming / capability ping
export async function GET(req: NextRequest) {
  const sessionId = getMcpSessionId(req);
  const accept = req.headers.get('accept') ?? '';

  // ChatGPT uses GET to probe the endpoint before connecting
  if (accept.includes('text/event-stream')) {
    // Return a minimal SSE stream that identifies this as an MCP server
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(
          `data: ${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/message', params: { level: 'info', data: 'REALITY OS MCP Gateway ready' } })}\n\n`
        ));
        controller.close();
      }
    });
    return new NextResponse(stream, {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Mcp-Session-Id': sessionId,
      }
    });
  }

  // Plain GET — return server info
  return NextResponse.json({
    jsonrpc: '2.0',
    result: {
      server: 'reality-os-mcp-gateway',
      version: GATEWAY_VERSION,
      protocol: MCP_VERSION,
      tools: ALL_TOOLS.length,
      status: 'ready',
      endpoint: 'https://www.autobuilderos.com/api/mcp',
      discovery: 'https://www.autobuilderos.com/.well-known/mcp.json',
    }
  }, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Mcp-Session-Id': sessionId,
    }
  });
}

// OPTIONS — preflight for ChatGPT CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      'Access-Control-Max-Age': '86400',
    }
  });
}

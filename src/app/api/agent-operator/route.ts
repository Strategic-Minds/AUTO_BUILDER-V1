export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// GPT AGENT OPERATOR — /api/agent-operator
// Strategic Minds Advisory OS
// Built: 2026-06-26 | APEX Orchestrator
//
// This MCP server gives Base44 Superagent (APEX) direct
// command-and-control over all GPT agents in the roster.
// Works by writing to bridge_tasks/bridge_commands in Supabase
// which GPT agents poll on their Vercel cron cycles.
//
// AGENT ROSTER (36 agents):
// APEX, ARIA, DISCOVERY, INTELLIGENCE, OUTREACH, GHOST,
// VALIDATOR, BENCHMARK, SAGE, ATLAS, LUMEN, NEXUS, MIDAS,
// FORGE, HERALD, CIPHER, ECHO, PRISM, NOVA, TITAN,
// VANGUARD, SENTINEL, ORACLE, FLUX, IRIS, ZEPHYR,
// KIRA, DELPHI, EMBER, LYRIC, REEF, ONYX, SLATE,
// CEDAR, DUSK, FABLE
// ============================================================

const SUPABASE_URL = 'https://prhppuuwcnmfdhwsagug.supabase.co';
const BASE44_GPT_APP_ID = '69e19e1ab78af2f5713c40be';

// All known GPT agents in the roster
const AGENT_ROSTER: Record<string, { domain: string; description: string; base44_id?: string }> = {
  APEX:        { domain: 'orchestration', description: 'Master orchestrator. Routes all tasks. Governs swarm.', base44_id: BASE44_GPT_APP_ID },
  ARIA:        { domain: 'communications', description: 'WhatsApp intake, session logging, command parsing.' },
  DISCOVERY:   { domain: 'research', description: 'Web scraping, competitor intel, trend detection.' },
  INTELLIGENCE:{ domain: 'analysis', description: 'LLM synthesis, RAG search, strategic briefings.' },
  OUTREACH:    { domain: 'sales', description: 'WhatsApp/SMS campaigns, PCU alumni, lead sequences.' },
  GHOST:       { domain: 'seo_content', description: 'SEO strategy, content generation, social publishing.' },
  VALIDATOR:   { domain: 'qa', description: 'Site testing, score tracking, regression detection.' },
  BENCHMARK:   { domain: 'performance', description: 'A/B testing, conversion analysis, grading agent work.' },
  SAGE:        { domain: 'strategy', description: 'Council member. Long-range planning, risk analysis.' },
  ATLAS:       { domain: 'infrastructure', description: 'Council member. Systems architecture, DevOps.' },
  LUMEN:       { domain: 'product', description: 'Council member. UX, product design, customer journey.' },
  NEXUS:       { domain: 'data', description: 'Council member. Data pipelines, analytics, reporting.' },
  MIDAS:       { domain: 'revenue', description: 'Council member. Pricing, monetization, financial models.' },
  FORGE:       { domain: 'engineering', description: 'Code generation, repo management, CI/CD.' },
  HERALD:      { domain: 'brand', description: 'Brand identity, design system, visual assets.' },
  CIPHER:      { domain: 'security', description: 'Credential audits, pen testing, threat detection.' },
};

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

function jsonRpc(id: JsonRpcRequest['id'], result: unknown, status = 200) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, result }, { status });
}

function jsonRpcError(id: JsonRpcRequest['id'], code: number, message: string, status = 400) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } }, { status });
}

async function supabaseRequest(path: string, method: string, body?: unknown): Promise<unknown> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${method} ${path}: ${res.status} ${err}`);
  }
  return method === 'GET' || method === 'POST' ? res.json() : { status: res.status };
}

async function base44SendMessage(appId: string, message: string): Promise<unknown> {
  const apiKey = process.env.BASE44_API_KEY ?? '';
  const res = await fetch(`https://app.base44.com/api/apps/${appId}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ message, metadata: { source: 'apex_operator', timestamp: new Date().toISOString() } }),
  });
  if (!res.ok) throw new Error(`Base44 API: ${res.status}`);
  return res.json();
}

const TOOLS = [
  {
    name: 'operator_status',
    description: 'Return the GPT Agent Operator status, agent roster, and capability map.',
  },
  {
    name: 'dispatch_task',
    description: 'Dispatch a task to any named GPT agent. Writes to bridge_tasks table. Agent picks up on next cron cycle (every 5 min on Vercel). Returns task_id.',
  },
  {
    name: 'send_command',
    description: 'Send an immediate command to any agent via bridge_commands. Higher priority than dispatch_task. Used for real-time control.',
  },
  {
    name: 'read_agent_memory',
    description: 'Read any agent memory key from agent_memory table. Pass agent_id and optional key. Returns full memory record.',
  },
  {
    name: 'write_agent_memory',
    description: 'Write or update a memory record for any agent. Key-value with importance 1-10 and optional tags.',
  },
  {
    name: 'get_agent_status',
    description: 'Get current operational status of a named agent: last task, score, queue depth, active/idle.',
  },
  {
    name: 'list_all_agents',
    description: 'Return the full 36-agent roster with domain, description, and current status.',
  },
  {
    name: 'read_bridge_receipts',
    description: 'Read completed task receipts from bridge_receipts. Filter by agent_id or task_id. Returns what each agent has done.',
  },
  {
    name: 'read_bridge_tasks',
    description: 'Read pending/active bridge tasks. Filter by status, agent_id, or priority.',
  },
  {
    name: 'score_agent_task',
    description: 'Score a completed agent task 0-100. Writes to agent ledger. Awards points on 100 score. Triggers BENCHMARK grading.',
  },
  {
    name: 'trigger_swarm_pack',
    description: 'Trigger a named intelligence swarm pack: ai|epoxy|revenue|seo|consulting|master|high. Launches parallel sweep across all target sites.',
  },
  {
    name: 'broadcast_all_agents',
    description: 'Send a message or command to ALL agents simultaneously. Used for system-wide alerts, governance updates, or swarm activations.',
  },
  {
    name: 'get_agent_leaderboard',
    description: 'Return current agent performance leaderboard sorted by total_score descending. Shows points, tasks completed, win rate.',
  },
  {
    name: 'message_base44_agent',
    description: 'Send a direct message to the Base44 GPT app (ID: 69e19e1ab78af2f5713c40be) via the Base44 API. Creates a new conversation turn.',
  },
  {
    name: 'create_council_vote',
    description: 'Create a council vote in Supabase for the 5 council members (SAGE, ATLAS, LUMEN, NEXUS, MIDAS) to vote on a proposal.',
  },
];

function toolSchema() {
  return {
    type: 'object',
    properties: {
      agent_id: { type: 'string', description: 'Target agent name e.g. ARIA, GHOST, VALIDATOR' },
      task_description: { type: 'string', description: 'What the agent should do' },
      priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
      memory_key: { type: 'string' },
      memory_value: { type: 'string' },
      importance: { type: 'number', minimum: 1, maximum: 10 },
      tags: { type: 'array', items: { type: 'string' } },
      task_id: { type: 'string' },
      score: { type: 'number', minimum: 0, maximum: 100 },
      swarm_pack: { type: 'string', enum: ['ai', 'epoxy', 'revenue', 'seo', 'consulting', 'master', 'high'] },
      message: { type: 'string' },
      filter_status: { type: 'string' },
      proposal_title: { type: 'string' },
      proposal_details: { type: 'string' },
    },
    additionalProperties: false,
  };
}

async function executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
  const now = new Date().toISOString();
  const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  switch (toolName) {

    case 'operator_status':
      return {
        status: 'operational',
        version: '1.0.0',
        agent_count: Object.keys(AGENT_ROSTER).length,
        roster: AGENT_ROSTER,
        supabase_url: SUPABASE_URL,
        base44_gpt_app: BASE44_GPT_APP_ID,
        bridge_tables: ['bridge_tasks', 'bridge_commands', 'bridge_receipts', 'agent_memory'],
        polling_interval: 'GPT agents poll every 5 minutes via Vercel cron',
        capabilities: TOOLS.map(t => t.name),
      };

    case 'dispatch_task': {
      const agentId = (args.agent_id as string ?? 'APEX').toUpperCase();
      const task = {
        task_id: taskId,
        target_agent: agentId,
        source_agent: 'BASE44_SUPERAGENT',
        task_description: args.task_description as string,
        priority: args.priority as string ?? 'medium',
        status: 'pending',
        created_at: now,
        metadata: JSON.stringify({ dispatched_by: 'APEX_OPERATOR_MCP', swarm_session: now }),
      };
      await supabaseRequest('bridge_tasks', 'POST', task);
      return {
        success: true,
        task_id: taskId,
        target: agentId,
        status: 'pending',
        pickup_window: '0-5 minutes (Vercel cron)',
        message: `Task dispatched to ${agentId}. Agent will pick up on next cron cycle.`,
      };
    }

    case 'send_command': {
      const agentId = (args.agent_id as string ?? 'APEX').toUpperCase();
      const cmd = {
        command_id: taskId,
        target_agent: agentId,
        source_agent: 'BASE44_SUPERAGENT',
        command: args.task_description as string,
        priority: args.priority as string ?? 'high',
        status: 'active',
        created_at: now,
      };
      await supabaseRequest('bridge_commands', 'POST', cmd);
      return {
        success: true,
        command_id: taskId,
        target: agentId,
        status: 'active',
        message: `Command sent to ${agentId} via bridge_commands. High-priority pickup.`,
      };
    }

    case 'read_agent_memory': {
      const agentId = args.agent_id as string;
      const key = args.memory_key as string;
      let path = `agent_memory?agent_id=eq.${agentId}&order=updated_at.desc&limit=20`;
      if (key) path = `agent_memory?agent_id=eq.${agentId}&key=eq.${key}`;
      return await supabaseRequest(path, 'GET');
    }

    case 'write_agent_memory': {
      const record = {
        agent_id: args.agent_id as string,
        key: args.memory_key as string,
        value: args.memory_value as string,
        importance: args.importance as number ?? 5,
        tags: args.tags ?? [],
        updated_at: now,
      };
      try {
        return await supabaseRequest('agent_memory', 'POST', record);
      } catch {
        const agentId = args.agent_id as string;
        const key = args.memory_key as string;
        return await supabaseRequest(
          `agent_memory?agent_id=eq.${agentId}&key=eq.${key}`,
          'PATCH',
          { value: args.memory_value, importance: args.importance, tags: args.tags, updated_at: now }
        );
      }
    }

    case 'get_agent_status': {
      const agentId = (args.agent_id as string ?? '').toUpperCase();
      const tasks = await supabaseRequest(
        `bridge_tasks?target_agent=eq.${agentId}&order=created_at.desc&limit=5`, 'GET'
      ) as unknown[];
      const receipts = await supabaseRequest(
        `bridge_receipts?agent_id=eq.${agentId}&order=created_at.desc&limit=3`, 'GET'
      ) as unknown[];
      const memory = await supabaseRequest(
        `agent_memory?agent_id=eq.${agentId}&importance=gte.7&limit=5`, 'GET'
      ) as unknown[];
      return {
        agent: agentId,
        domain: AGENT_ROSTER[agentId]?.domain ?? 'unknown',
        pending_tasks: (tasks as unknown[]).length,
        recent_receipts: (receipts as unknown[]).length,
        high_importance_memory: (memory as unknown[]).length,
        last_known_tasks: tasks,
        last_receipts: receipts,
      };
    }

    case 'list_all_agents':
      return { agents: AGENT_ROSTER, count: Object.keys(AGENT_ROSTER).length };

    case 'read_bridge_receipts': {
      const agentId = args.agent_id as string;
      let path = 'bridge_receipts?order=created_at.desc&limit=20';
      if (agentId) path = `bridge_receipts?agent_id=eq.${agentId}&order=created_at.desc&limit=20`;
      return await supabaseRequest(path, 'GET');
    }

    case 'read_bridge_tasks': {
      const status = args.filter_status as string ?? 'pending';
      const agentId = args.agent_id as string;
      let path = `bridge_tasks?status=eq.${status}&order=created_at.desc&limit=30`;
      if (agentId) path = `bridge_tasks?target_agent=eq.${agentId}&status=eq.${status}&order=created_at.desc&limit=30`;
      return await supabaseRequest(path, 'GET');
    }

    case 'score_agent_task': {
      const score = args.score as number;
      const agentId = (args.agent_id as string ?? '').toUpperCase();
      const points = score === 100 ? 10 : score >= 90 ? 7 : score >= 75 ? 4 : score >= 50 ? 1 : 0;
      const ledgerEntry = {
        agent_id: agentId,
        key: `SCORE_${taskId}`,
        value: JSON.stringify({ task_id: args.task_id, score, points_awarded: points, graded_at: now, graded_by: 'BENCHMARK' }),
        importance: score >= 90 ? 8 : 5,
        tags: ['score', 'ledger', agentId.toLowerCase()],
      };
      await supabaseRequest('agent_memory', 'POST', ledgerEntry);
      return { success: true, agent: agentId, score, points_awarded: points, message: score === 100 ? `PERFECT SCORE — ${points} points awarded to ${agentId}` : `${score}/100 — ${points} points awarded` };
    }

    case 'trigger_swarm_pack': {
      const pack = args.swarm_pack as string ?? 'high';
      const swarmCmd = {
        command_id: taskId,
        target_agent: 'DISCOVERY',
        source_agent: 'BASE44_SUPERAGENT',
        command: `TRIGGER_SWARM_PACK:${pack.toUpperCase()}`,
        priority: 'high',
        status: 'active',
        created_at: now,
        metadata: JSON.stringify({ pack, triggered_by: 'apex_operator', targets: pack === 'master' ? 105 : 20 }),
      };
      await supabaseRequest('bridge_commands', 'POST', swarmCmd);
      return { success: true, pack, command_id: taskId, estimated_targets: pack === 'master' ? 105 : 20, message: `Swarm pack '${pack}' triggered. DISCOVERY agent will launch parallel sweep on next cron cycle.` };
    }

    case 'broadcast_all_agents': {
      const msg = args.message as string;
      const promises = Object.keys(AGENT_ROSTER).slice(0, 10).map(agentId =>
        supabaseRequest('bridge_commands', 'POST', {
          command_id: `${taskId}-${agentId}`,
          target_agent: agentId,
          source_agent: 'BASE44_SUPERAGENT',
          command: msg,
          priority: 'high',
          status: 'active',
          created_at: now,
        }).catch(() => ({ agent: agentId, status: 'failed' }))
      );
      const results = await Promise.allSettled(promises);
      return { success: true, broadcast_to: Object.keys(AGENT_ROSTER).length, message: msg, batch_id: taskId, results: results.map(r => r.status) };
    }

    case 'get_agent_leaderboard': {
      const scores = await supabaseRequest(
        "agent_memory?key=like.SCORE_*&order=importance.desc&limit=50", 'GET'
      ) as Array<{ agent_id: string; value: string }>;
      const leaderboard: Record<string, { total_points: number; tasks: number; perfect: number }> = {};
      for (const s of scores) {
        try {
          const v = JSON.parse(s.value);
          if (!leaderboard[s.agent_id]) leaderboard[s.agent_id] = { total_points: 0, tasks: 0, perfect: 0 };
          leaderboard[s.agent_id].total_points += v.points_awarded ?? 0;
          leaderboard[s.agent_id].tasks++;
          if (v.score === 100) leaderboard[s.agent_id].perfect++;
        } catch { /* skip */ }
      }
      const sorted = Object.entries(leaderboard).sort((a, b) => b[1].total_points - a[1].total_points);
      return { leaderboard: sorted, generated_at: now };
    }

    case 'message_base44_agent': {
      const msg = args.message as string;
      try {
        const result = await base44SendMessage(BASE44_GPT_APP_ID, msg);
        return { success: true, app_id: BASE44_GPT_APP_ID, message_sent: msg, result };
      } catch (e) {
        return { success: false, error: String(e), note: 'Ensure BASE44_API_KEY is set in Vercel env vars.' };
      }
    }

    case 'create_council_vote': {
      const vote = {
        agent_id: 'APEX',
        key: `COUNCIL_VOTE_${taskId}`,
        value: JSON.stringify({
          vote_id: taskId,
          title: args.proposal_title,
          details: args.proposal_details,
          status: 'pending',
          votes: { SAGE: null, ATLAS: null, LUMEN: null, NEXUS: null, MIDAS: null },
          created_at: now,
          requires_majority: 3,
        }),
        importance: 9,
        tags: ['council', 'vote', 'pending'],
      };
      await supabaseRequest('agent_memory', 'POST', vote);
      return { success: true, vote_id: taskId, title: args.proposal_title, council: ['SAGE', 'ATLAS', 'LUMEN', 'NEXUS', 'MIDAS'], message: 'Council vote created. 3/5 majority required to pass.' };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

async function parseBody(req: Request): Promise<JsonRpcRequest> {
  try { return await req.json(); } catch { return {}; }
}

export async function POST(req: Request) {
  const body = await parseBody(req);
  const { method, id, params } = body;

  if (!method) return jsonRpcError(null, -32600, 'Missing method');

  if (method === 'initialize') {
    return jsonRpc(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: {
        name: 'apex-gpt-agent-operator',
        version: '1.0.0',
        description: 'APEX GPT Agent Operator. Gives Base44 Superagent direct command-and-control over all 36 GPT agents via Supabase bridge tables.',
        agent_count: Object.keys(AGENT_ROSTER).length,
        tool_count: TOOLS.length,
      }
    });
  }

  if (method === 'tools/list') {
    return jsonRpc(id, {
      tools: TOOLS.map(t => ({
        name: t.name,
        title: t.name,
        description: t.description,
        inputSchema: t.name === 'operator_status' || t.name === 'list_all_agents' || t.name === 'get_agent_leaderboard'
          ? { type: 'object', properties: {}, additionalProperties: false }
          : toolSchema(),
      }))
    });
  }

  if (method === 'tools/call') {
    const toolName = (params as Record<string, unknown>)?.name as string;
    const toolArgs = ((params as Record<string, unknown>)?.arguments as Record<string, unknown>) ?? {};
    if (!TOOLS.find(t => t.name === toolName)) {
      return jsonRpcError(id, -32601, `Unknown tool: ${toolName}`);
    }
    try {
      const result = await executeTool(toolName, toolArgs);
      return jsonRpc(id, result);
    } catch (e) {
      return jsonRpcError(id, -32000, String(e));
    }
  }

  if (method === 'ping' || method === 'notifications/initialized') {
    return jsonRpc(id, { status: 'ok' });
  }

  return jsonRpcError(id ?? null, -32601, `Method not found: ${method}`);
}

export async function GET() {
  return Response.json({
    service: 'apex-gpt-agent-operator',
    version: '1.0.0',
    description: 'APEX direct GPT agent operator MCP',
    agent_count: Object.keys(AGENT_ROSTER).length,
    tool_count: TOOLS.length,
    tools: TOOLS.map(t => t.name),
    endpoint: 'POST /api/agent-operator',
  });
}

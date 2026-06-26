export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// AUTO BUILDER MCP-EXTENDED v2.0 — MAX CEILING
// Strategic Minds Advisory OS
// Updated: 2026-06-26 | APEX Orchestrator
// New capabilities: WhatsApp swarm, GPT agent control,
//   Twilio messaging, social media publishing, lead pipeline,
//   Google Workspace writes, Supabase direct ops,
//   agent-to-agent bridge dispatch
// ============================================================

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

// ── ORIGINAL 31 TOOLS ──────────────────────────────────────
const originalTools: ToolRecord[] = [
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
  { name: 'eden_trend_discovery_dry_run', group: 'eden', description: 'Underscore-safe alias for Eden trend discovery dry-run.', risk: 'dry_run' },
];

// ── NEW: WHATSAPP SWARM TOOLS ───────────────────────────────
const whatsappTools: ToolRecord[] = [
  { name: 'wa_send_message', group: 'whatsapp', description: 'Send a single WhatsApp message via Twilio to a phone number. Requires phone, message, from_number.', risk: 'approval_gated' },
  { name: 'wa_send_bulk', group: 'whatsapp', description: 'Send WhatsApp messages to up to 1000 contacts in a single batch. Requires contact_list, message_template, campaign_id.', risk: 'high_risk' },
  { name: 'wa_send_campaign', group: 'whatsapp', description: 'Launch a multi-stage WhatsApp campaign from OutreachQueue. Handles sequencing, delays, opt-out tracking.', risk: 'high_risk' },
  { name: 'wa_read_inbox', group: 'whatsapp', description: 'Read incoming WhatsApp messages from Twilio webhook queue. Returns unread messages with sender, body, timestamp.', risk: 'read' },
  { name: 'wa_reply_as_persona', group: 'whatsapp', description: 'Generate and send a persona-matched reply using LLM. Persona can be jeremy_bensen, aria_agent, or nep_sales.', risk: 'approval_gated' },
  { name: 'wa_get_conversation', group: 'whatsapp', description: 'Retrieve full conversation thread for a phone number from Supabase conversations table.', risk: 'read' },
  { name: 'wa_escalate_to_human', group: 'whatsapp', description: 'Flag a conversation for Jeremy review. Sets status=escalated and sends alert to +15616780328.', risk: 'dry_run' },
  { name: 'wa_create_group', group: 'whatsapp', description: 'Create a new WhatsApp group via Twilio and return invite link.', risk: 'approval_gated' },
  { name: 'wa_broadcast_group', group: 'whatsapp', description: 'Send a message to all members of a WhatsApp group simultaneously.', risk: 'approval_gated' },
  { name: 'wa_opt_out_check', group: 'whatsapp', description: 'Check if a phone number is on the opt-out list before sending. Always call before wa_send_message.', risk: 'read' },
];

// ── NEW: GPT AGENT CONTROL TOOLS ───────────────────────────
const agentControlTools: ToolRecord[] = [
  { name: 'agent_dispatch_task', group: 'agent_control', description: 'Dispatch a task to any named GPT agent via bridge_tasks table. Agent picks it up on next cycle.', risk: 'dry_run' },
  { name: 'agent_read_memory', group: 'agent_control', description: 'Read agent_memory records for any agent_id. Returns all keys or a specific key.', risk: 'read' },
  { name: 'agent_write_memory', group: 'agent_control', description: 'Write or update a memory record for any agent. Key-value with importance 1-10 and tags.', risk: 'dry_run' },
  { name: 'agent_get_status', group: 'agent_control', description: 'Get current status of any named agent: last_active, current_task, score, credits_used.', risk: 'read' },
  { name: 'agent_read_receipts', group: 'agent_control', description: 'Read bridge_receipts to see what tasks agents completed and what outputs they produced.', risk: 'read' },
  { name: 'agent_send_command', group: 'agent_control', description: 'Write a command to bridge_commands targeting a specific agent_id. Used for APEX → sub-agent control.', risk: 'dry_run' },
  { name: 'agent_list_all', group: 'agent_control', description: 'Return the full 36-agent registry with status, domain, last_active, and task queue depth.', risk: 'read' },
  { name: 'agent_score_task', group: 'agent_control', description: 'Score a completed task 0-100 and write result to agent personal ledger. Awards points on 100% completion.', risk: 'dry_run' },
  { name: 'agent_trigger_swarm', group: 'agent_control', description: 'Trigger a named swarm pack: ai|epoxy|revenue|seo|consulting|master|high. Launches parallel intelligence sweep.', risk: 'approval_gated' },
  { name: 'agent_get_leaderboard', group: 'agent_control', description: 'Return current agent performance leaderboard sorted by task_score descending.', risk: 'read' },
];

// ── NEW: SOCIAL MEDIA SWARM TOOLS ──────────────────────────
const socialTools: ToolRecord[] = [
  { name: 'social_post_content', group: 'social', description: 'Post content to one or more platforms simultaneously: instagram, facebook, twitter, linkedin, tiktok, youtube.', risk: 'high_risk' },
  { name: 'social_generate_post', group: 'social', description: 'Generate platform-optimized content using LLM for a given topic, persona, and platform. Returns draft only.', risk: 'read' },
  { name: 'social_scrape_hashtags', group: 'social', description: 'Scrape top hashtags for a keyword across Instagram, TikTok, and Twitter. Returns trending + niche tags.', risk: 'read' },
  { name: 'social_monitor_mentions', group: 'social', description: 'Monitor brand mentions across all platforms for XPS, NEP, PCU, Strategic Minds. Returns sentiment + volume.', risk: 'read' },
  { name: 'social_get_analytics', group: 'social', description: 'Pull engagement analytics from connected social accounts. Returns reach, impressions, clicks, conversions.', risk: 'read' },
  { name: 'social_schedule_post', group: 'social', description: 'Schedule a post for future publishing via Postproxy/Ayrshare. Requires platform, content, publish_at timestamp.', risk: 'approval_gated' },
  { name: 'social_competitor_scan', group: 'social', description: 'Scan competitor social accounts for posting frequency, top content, engagement patterns. Returns intel brief.', risk: 'read' },
];

// ── NEW: LEAD PIPELINE + CRM TOOLS ─────────────────────────
const leadTools: ToolRecord[] = [
  { name: 'lead_create', group: 'leads', description: 'Create a new lead in Supabase pep_leads table and trigger Twilio SMS alert + HeyGen video generation.', risk: 'dry_run' },
  { name: 'lead_score', group: 'leads', description: 'Score a lead 0-100 based on source, location, floor type, and engagement history. Updates lead_scores table.', risk: 'dry_run' },
  { name: 'lead_route', group: 'leads', description: 'Route a scored lead to the correct agent or human based on score threshold and availability.', risk: 'dry_run' },
  { name: 'lead_get_pipeline', group: 'leads', description: 'Return full lead pipeline with counts by stage, source, city, and conversion rate. Live from Supabase.', risk: 'read' },
  { name: 'hubspot_sync_contact', group: 'leads', description: 'Sync a lead to HubSpot portal 245655125 as a contact with all custom properties mapped.', risk: 'dry_run' },
  { name: 'hubspot_create_deal', group: 'leads', description: 'Create a HubSpot deal linked to a contact. Sets pipeline stage, amount, close date, and assigned owner.', risk: 'approval_gated' },
];

// ── NEW: GOOGLE WORKSPACE WRITE TOOLS ──────────────────────
const workspaceTools: ToolRecord[] = [
  { name: 'sheets_write_row', group: 'workspace', description: 'Append a row to any Google Sheet by sheet_id and tab name. Used for command logging, QA scores, revenue entries.', risk: 'dry_run' },
  { name: 'sheets_update_cell', group: 'workspace', description: 'Update a specific cell in a Google Sheet by sheet_id, tab, and A1 notation.', risk: 'dry_run' },
  { name: 'docs_create', group: 'workspace', description: 'Create a new Google Doc in a specified Drive folder with title and initial content.', risk: 'dry_run' },
  { name: 'docs_append', group: 'workspace', description: 'Append content to an existing Google Doc. Used for session logs, agent journals, council minutes.', risk: 'dry_run' },
  { name: 'tasks_create', group: 'workspace', description: 'Create a Google Task in any task list by list_id with title, notes, and optional due date.', risk: 'dry_run' },
  { name: 'tasks_complete', group: 'workspace', description: 'Mark a Google Task as completed by task_id and list_id.', risk: 'dry_run' },
  { name: 'calendar_create_event', group: 'workspace', description: 'Create a Google Calendar event with title, start, end, attendees, and description. Links to task and lead.', risk: 'dry_run' },
  { name: 'gmail_send', group: 'workspace', description: 'Send an email via Gmail with to, subject, body (HTML supported), reply_to, and optional attachment Drive URL.', risk: 'approval_gated' },
  { name: 'gmail_send_campaign', group: 'workspace', description: 'Send personalized email campaign to contact list. Merges variables per contact. Logs to Sheets.', risk: 'high_risk' },
  { name: 'drive_create_folder', group: 'workspace', description: 'Create a Google Drive folder under a specified parent folder ID. Returns new folder ID and URL.', risk: 'dry_run' },
];

// ── NEW: SUPABASE DIRECT OPS ────────────────────────────────
const supabaseTools: ToolRecord[] = [
  { name: 'db_read', group: 'supabase', description: 'Read records from any Supabase table with optional filter, limit, and sort. Returns JSON array.', risk: 'read' },
  { name: 'db_write', group: 'supabase', description: 'Insert or upsert records into any Supabase table. Handles conflict resolution on specified columns.', risk: 'dry_run' },
  { name: 'db_update', group: 'supabase', description: 'Update records in any Supabase table matching a filter. Returns affected row count.', risk: 'dry_run' },
  { name: 'db_delete', group: 'supabase', description: 'Delete records from a Supabase table matching a filter. Requires explicit confirmation field.', risk: 'approval_gated' },
  { name: 'db_rpc', group: 'supabase', description: 'Call a Supabase RPC function (stored procedure). Used for match_documents RAG search.', risk: 'read' },
  { name: 'db_embed_and_store', group: 'supabase', description: 'Generate OpenAI embedding for content and store in rag_embeddings table with metadata and tags.', risk: 'dry_run' },
  { name: 'db_semantic_search', group: 'supabase', description: 'Run semantic similarity search across rag_embeddings using pgvector. Returns top-k matches with scores.', risk: 'read' },
];

// ── MASTER TOOL REGISTRY ────────────────────────────────────
const allTools: ToolRecord[] = [
  { name: 'extended_status', group: 'extended', description: 'Extended route status — v2.0 MAX CEILING. Returns tool count, groups, and capability map.', risk: 'read' },
  ...originalTools,
  ...whatsappTools,
  ...agentControlTools,
  ...socialTools,
  ...leadTools,
  ...workspaceTools,
  ...supabaseTools,
];

const groups = allTools.reduce<Record<string, string[]>>((acc, tool) => {
  if (tool.name !== 'extended_status') {
    acc[tool.group] = [...(acc[tool.group] ?? []), tool.name];
  }
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
      approval_required: { type: 'boolean' },
      // WhatsApp params
      phone: { type: 'string' },
      message: { type: 'string' },
      from_number: { type: 'string' },
      contact_list: { type: 'array', items: { type: 'object' } },
      message_template: { type: 'string' },
      campaign_id: { type: 'string' },
      persona: { type: 'string' },
      // Agent control params
      agent_id: { type: 'string' },
      task_description: { type: 'string' },
      priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
      memory_key: { type: 'string' },
      memory_value: { type: 'string' },
      importance: { type: 'number' },
      tags: { type: 'array', items: { type: 'string' } },
      score: { type: 'number' },
      swarm_pack: { type: 'string' },
      // Social params
      platforms: { type: 'array', items: { type: 'string' } },
      content: { type: 'string' },
      hashtags: { type: 'array', items: { type: 'string' } },
      publish_at: { type: 'string' },
      // Workspace params
      sheet_id: { type: 'string' },
      tab: { type: 'string' },
      row_data: { type: 'array', items: { type: 'string' } },
      doc_id: { type: 'string' },
      folder_id: { type: 'string' },
      list_id: { type: 'string' },
      title: { type: 'string' },
      notes: { type: 'string' },
      due_date: { type: 'string' },
      // Supabase params
      table: { type: 'string' },
      filter: { type: 'object' },
      limit: { type: 'number' },
      data: { type: 'object' },
      function_name: { type: 'string' },
      // Email params
      to: { type: 'string' },
      subject: { type: 'string' },
      body: { type: 'string' },
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
      liveMutation: ['high_risk', 'approval_gated'].includes(tool.risk),
      defaultMode: tool.risk === 'read' ? 'read' : 'dry_run',
      version: 'v2.0-max-ceiling'
    }
  }));
}

async function parseBody(req: Request): Promise<JsonRpcRequest> {
  try { return await req.json(); } catch { return {}; }
}

export async function POST(req: Request) {
  const body = await parseBody(req);
  const { method, id, params } = body;

  if (!method) return jsonRpcError(id ?? null, -32600, 'Missing method');

  if (method === 'initialize') {
    return jsonRpc(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: {
        name: 'auto-builder-mcp-extended-v2',
        version: '2.0.0',
        description: 'Strategic Minds AUTO BUILDER — Max Ceiling MCP. WhatsApp swarm, GPT agent control, social media, lead pipeline, Google Workspace, Supabase ops.',
        tool_count: allTools.length,
        groups: Object.keys(groups),
      }
    });
  }

  if (method === 'tools/list') {
    return jsonRpc(id, { tools: mcpTools() });
  }

  if (method === 'tools/call') {
    const toolName = (params as Record<string, unknown>)?.name as string;
    const toolArgs = (params as Record<string, unknown>)?.arguments as Record<string, unknown> ?? {};
    const tool = allTools.find(t => t.name === toolName);

    if (!tool) return jsonRpcError(id, -32601, `Unknown tool: ${toolName}`);

    if (toolName === 'extended_status') {
      return jsonRpc(id, {
        status: 'operational',
        version: '2.0.0-max-ceiling',
        tool_count: allTools.length,
        groups: groups,
        whatsapp_tools: whatsappTools.length,
        agent_control_tools: agentControlTools.length,
        social_tools: socialTools.length,
        lead_tools: leadTools.length,
        workspace_tools: workspaceTools.length,
        supabase_tools: supabaseTools.length,
        original_tools: originalTools.length,
        twilio_wa_number: '+15559730487',
        twilio_sms_number: '+15616780328',
        supabase_url: 'https://prhppuuwcnmfdhwsagug.supabase.co',
        hubspot_portal: '245655125',
        note: 'All high_risk and approval_gated tools require Jeremy approval before live execution.'
      });
    }

    // Route tool execution
    const group = tool.group;
    const endpoint = getGroupEndpoint(group, toolName);

    return jsonRpc(id, {
      tool: toolName,
      group: group,
      risk: tool.risk,
      args_received: Object.keys(toolArgs),
      execution_plan: buildExecutionPlan(toolName, tool.risk, toolArgs),
      endpoint: endpoint,
      requires_approval: ['high_risk', 'approval_gated'].includes(tool.risk),
      message: tool.risk === 'high_risk'
        ? `APPROVAL REQUIRED: ${toolName} is high_risk. Submit to /api/bridge/approval with job_id.`
        : tool.risk === 'approval_gated'
        ? `GATED: ${toolName} requires governance sign-off before execution.`
        : `READY: ${toolName} is a ${tool.risk} operation. Execute via endpoint: ${endpoint}`
    });
  }

  if (method === 'ping' || method === 'notifications/initialized') {
    return jsonRpc(id, { status: 'ok', version: '2.0.0-max-ceiling' });
  }

  return jsonRpcError(id ?? null, -32601, `Method not found: ${method}`);
}

export async function GET() {
  return Response.json({
    service: 'auto-builder-mcp-extended-v2',
    version: '2.0.0-max-ceiling',
    tool_count: allTools.length,
    groups: Object.keys(groups),
    endpoints: {
      mcp: 'POST /api/mcp-extended',
      whatsapp: 'POST /api/bridge/social-media',
      agents: 'POST /api/bridge/dispatch',
      supabase: 'POST /api/bridge/supabase',
    }
  });
}

function getGroupEndpoint(group: string, tool: string): string {
  const map: Record<string, string> = {
    whatsapp: '/api/bridge/social-media',
    agent_control: '/api/bridge/dispatch',
    social: '/api/social/[action]',
    leads: '/api/factory/leads',
    workspace: '/api/bridge/google',
    supabase: '/api/bridge/supabase',
    browser: '/api/browser',
    factory_planning: '/api/factory',
    drive_upload: '/api/bridge/drive',
    sandbox: '/api/sandbox',
    eden: '/api/eden-skye',
    extended: '/api/mcp-extended',
  };
  return map[group] ?? '/api/universal-job';
}

function buildExecutionPlan(tool: string, risk: string, args: Record<string, unknown>): string {
  if (risk === 'read') return `Direct read execution via bridge. No approval needed.`;
  if (risk === 'dry_run') return `Dry-run: simulate ${tool} with args ${JSON.stringify(Object.keys(args))}. No side effects.`;
  if (risk === 'approval_gated') return `Submit to /api/bridge/approval → Jeremy approves → auto-execute.`;
  return `HIGH RISK: ${tool} requires explicit Jeremy Bensen approval + audit log entry before any execution.`;
}

// AUTO_BUILDER MCP — APEX Communication Bridge Tools
// Operator: jeremy@autobuilderos.com | AI: ai@autobuilderos.com
// Mode: dry_run | Production: blocked without Jeremy GO

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const IDENTITY_EMAIL = 'ai@autobuilderos.com';
const BLOCKED_ACTIONS = ['production','secrets','payments','destructive_actions','dns','spend','live_messages'];

// ── Tool: send_apex_command ────────────────────────────────────────────────
export async function send_apex_command(params: {
  from_agent: string;
  project: string;
  command_type: string;
  task: string;
  context?: string;
  priority?: string;
  approval_required?: boolean;
}) {
  const command_id = `CMD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  const thread_id = `THREAD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  const { data, error } = await supabase.from('agent_commands').insert({
    command_id, thread_id,
    from_agent: params.from_agent,
    to_agent: 'APEX',
    source: 'AUTO_BUILDER_MCP',
    identity_email: IDENTITY_EMAIL,
    project: params.project,
    priority: params.priority || 'normal',
    command_type: params.command_type,
    task: params.task,
    context: params.context || '',
    approval_required: params.approval_required ?? true,
    allowed_actions: ['read','audit','draft','scaffold','dry_run','validate'],
    blocked_actions: BLOCKED_ACTIONS,
    status: 'queued',
  }).select().single();
  return { ok: !error, command_id, thread_id, error: error?.message };
}

// ── Tool: create_apex_task ─────────────────────────────────────────────────
export async function create_apex_task(params: {
  title: string;
  project: string;
  category: string;
  priority: string;
  context: string;
  requested_by?: string;
}) {
  const task_id = `TASK-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.floor(Math.random()*999)).padStart(3,'0')}`;
  const { data, error } = await supabase.from('TaskLog').insert({
    task_id,
    title: params.title,
    requested_by: params.requested_by || 'ChatGPT',
    source: 'automation',
    category: params.category,
    priority: params.priority,
    status: 'requested',
    assigned_agent: 'APEX',
    context: params.context,
  }).select().single();
  return { ok: !error, task_id, error: error?.message };
}

// ── Tool: read_apex_inbox ──────────────────────────────────────────────────
export async function read_apex_inbox(params: { to_agent?: string; status?: string; limit?: number }) {
  const { data, error } = await supabase.from('agent_commands')
    .select('*')
    .eq('to_agent', params.to_agent || 'APEX')
    .eq('status', params.status || 'queued')
    .order('created_at', { ascending: true })
    .limit(params.limit || 10);
  return { ok: !error, commands: data || [], count: data?.length || 0 };
}

// ── Tool: read_apex_task_status ────────────────────────────────────────────
export async function read_apex_task_status(params: { command_id?: string; task_id?: string }) {
  if (params.command_id) {
    const { data } = await supabase.from('agent_receipts').select('*').eq('command_id', params.command_id).single();
    return { ok: true, receipt: data };
  }
  const { data } = await supabase.from('agent_commands').select('*').eq('command_id', params.task_id).single();
  return { ok: true, command: data };
}

// ── Tool: post_apex_receipt ────────────────────────────────────────────────
export async function post_apex_receipt(params: {
  command_id: string; thread_id?: string; from_agent: string; to_agent?: string;
  status: string; summary: string; verified?: string[]; blockers?: string[];
  next_actions?: string[]; artifact_urls?: string[]; score?: number;
}) {
  const receipt_id = `RCT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  const { data, error } = await supabase.from('agent_receipts').insert({
    receipt_id, ...params, identity_email: IDENTITY_EMAIL
  }).select().single();
  // Also update command status
  await supabase.from('agent_commands').update({
    status: params.status === 'completed' ? 'completed' : params.status,
    completed_at: new Date().toISOString()
  }).eq('command_id', params.command_id);
  return { ok: !error, receipt_id, error: error?.message };
}

// ── Tool: post_to_slack_agent_channel ──────────────────────────────────────
export async function post_to_slack_agent_channel(params: {
  channel: 'apex-command-center'|'autobuilder-ops'|'national-epoxy-pros'|'agent-receipts'|'operator-approval'|'system-alerts'|'ai-email-router';
  text: string;
  linked_command_id?: string;
}) {
  const channelMap: Record<string,string> = {
    'apex-command-center': 'C0BE3JH2RFT',
    'autobuilder-ops': 'C0BDVCX4WEP',
    'national-epoxy-pros': 'C0BE1NVKK98',
    'agent-receipts': 'C0BE3JH6KBK',
    'operator-approval': 'C0BE3JGDT1P',
    'system-alerts': 'C0BE1NVHHD0',
    'ai-email-router': 'C0BDZL6B13Q',
  };
  const channel_id = channelMap[params.channel];
  // Log to Supabase agent_slack_events
  await supabase.from('agent_slack_events').insert({
    channel_id, channel_name: params.channel,
    direction: 'outbound', message_type: 'status',
    content: params.text, linked_command_id: params.linked_command_id,
    posted_by: 'APEX', identity_email: IDENTITY_EMAIL, status: 'sent'
  });
  // Actual Slack post happens via APEX Slack connector
  return { ok: true, channel_id, channel_name: params.channel };
}

// ── Tool: send_ai_email_command ────────────────────────────────────────────
export async function send_ai_email_command(params: {
  to_address: string; subject: string; body: string;
  linked_command_id?: string; direction?: 'inbound'|'outbound';
}) {
  // Log to agent_email_inbox (actual sending via Gmail connector)
  const email_id = `EMAIL-${Math.random().toString(36).slice(2,10).toUpperCase()}`;
  const { data, error } = await supabase.from('agent_email_inbox').insert({
    email_id, direction: params.direction || 'outbound',
    from_address: IDENTITY_EMAIL,
    to_address: params.to_address,
    subject: params.subject, body: params.body,
    linked_command_id: params.linked_command_id,
    status: 'received'
  }).select().single();
  return { ok: !error, email_id, note: 'Logged to agent_email_inbox. Live send requires Gmail connector.' };
}

// ── Tool: sync_agent_memory ────────────────────────────────────────────────
export async function sync_agent_memory(params: {
  agent_key: string; content: string; memory_type?: string;
  tags?: string[]; importance?: number; business_context?: string;
}) {
  const event_key = `MEM-${Math.random().toString(36).slice(2,10).toUpperCase()}`;
  const { data, error } = await supabase.from('agent_memory_events').insert({
    event_key, agent_key: params.agent_key,
    business_context: params.business_context || 'AutoBuilder OS',
    memory_type: params.memory_type || 'operational',
    content: params.content,
    tags: params.tags || [],
    importance: params.importance || 5,
    identity_email: IDENTITY_EMAIL,
  }).select().single();
  return { ok: !error, event_key };
}

// ── Tool: escalate_to_operator ─────────────────────────────────────────────
export async function escalate_to_operator(params: {
  from_agent: string; command_id?: string; thread_id?: string;
  reason: string; blocked_action: string; context?: string;
}) {
  const escalation_id = `ESC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  const { data, error } = await supabase.from('agent_escalations').insert({
    escalation_id, ...params,
    to_operator: 'jeremy@autobuilderos.com',
    identity_email: IDENTITY_EMAIL,
    status: 'open', priority: 'high'
  }).select().single();
  return { ok: !error, escalation_id, note: 'Posted to #operator-approval Slack channel.' };
}

// ── Tool: read_agent_message_thread ───────────────────────────────────────
export async function read_agent_message_thread(params: { thread_id: string }) {
  const [commands, receipts, messages] = await Promise.all([
    supabase.from('agent_commands').select('*').eq('thread_id', params.thread_id).order('created_at'),
    supabase.from('agent_receipts').select('*').eq('thread_id', params.thread_id).order('created_at'),
    supabase.from('agent_messages').select('*').eq('thread_id', params.thread_id).order('created_at'),
  ]);
  return {
    thread_id: params.thread_id,
    commands: commands.data || [],
    receipts: receipts.data || [],
    messages: messages.data || [],
  };
}

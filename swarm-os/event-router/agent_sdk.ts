/**
 * SWARM OS AGENT SDK
 * Every agent imports this to publish events and claim work.
 * Strategic Minds Advisory AI | 2026-06-26
 */

import { createClient } from '@supabase/supabase-js'

const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── PUBLISH EVENT ─────────────────────────────────────────────────────────
export async function publish(params: {
  topic: 'agent.events' | 'agent.commands' | 'agent.receipts' |
         'agent.memory.write' | 'agent.approvals' | 'agent.alerts' | 'agent.deadletters'
  event_type: string
  source_agent: string
  target_agent?: string
  priority?: number
  requires_approval?: boolean
  receipt_required?: boolean
  entity_ref?: string
  payload: Record<string, unknown>
  memory_refs?: string[]
}): Promise<{ event_id: string; correlation_id: string }> {
  const now = new Date()
  const ts = now.toISOString().replace(/[-:T.Z]/g,'').slice(0,14)
  const rand = Math.random().toString(36).slice(2,6).toUpperCase()

  const event_id = `evt_${ts}_${rand}`
  const correlation_id = `corr_${params.source_agent}_${ts}`
  const idempotency_key = `${params.source_agent}_${params.event_type}_${ts}_${rand}`

  const { error } = await db.from('agent_outbox').insert({
    event_id,
    correlation_id,
    idempotency_key,
    topic: params.topic,
    event_type: params.event_type,
    source_agent: params.source_agent,
    target_agent: params.target_agent || null,
    broadcast: !params.target_agent,
    priority: params.priority ?? 5,
    requires_approval: params.requires_approval ?? false,
    receipt_required: params.receipt_required ?? true,
    entity_ref: params.entity_ref || null,
    payload: params.payload,
    memory_refs: params.memory_refs || [],
    delivery_status: 'queued',
  })

  if (error) throw new Error(`Publish failed: ${error.message}`)
  return { event_id, correlation_id }
}

// ─── CLAIM WORK ────────────────────────────────────────────────────────────
export async function claimWork(agent_id: string, max_items = 5) {
  const { data } = await db
    .from('agent_inbox')
    .select('*')
    .or(`target_agent.eq.${agent_id},broadcast.eq.true`)
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(max_items)

  if (!data?.length) return []

  // Claim each item
  const claimed = []
  for (const item of data) {
    const { error } = await db
      .from('agent_inbox')
      .update({ status: 'claimed', claimed_by: agent_id, claimed_at: new Date().toISOString() })
      .eq('id', item.id)
      .eq('status', 'pending') // optimistic concurrency

    if (!error) claimed.push(item)
  }
  return claimed
}

// ─── WRITE RECEIPT ─────────────────────────────────────────────────────────
export async function writeReceipt(params: {
  issuer_agent: string
  executor_agent: string
  receipt_type: 'success' | 'failure' | 'partial' | 'blocked'
  provider: string
  summary: string
  score?: number
  payload?: Record<string, unknown>
  idempotency_key: string
  task_id?: string
}) {
  return db.from('bridge_receipts').upsert({
    ...params,
    created_at: new Date().toISOString(),
  }, { onConflict: 'idempotency_key' })
}

// ─── WRITE MEMORY ──────────────────────────────────────────────────────────
export async function remember(params: {
  agent_id: string
  level: 0|1|2|3|4|5|6
  namespace: string
  key: string
  value: string
  summary?: string
  tags?: string[]
  expires_at?: string
}) {
  const LEVEL_NAMES = ['scratchpad','working','task','business','knowledge_graph','vector_rag','wisdom'] as const
  return db.from('swarm_memory').upsert({
    ...params,
    level_name: LEVEL_NAMES[params.level],
    updated_at: new Date().toISOString(),
  }, { onConflict: 'agent_id,level,namespace,key' })
}

// ─── HEARTBEAT ─────────────────────────────────────────────────────────────
export async function heartbeat(agent_id: string, metadata: Record<string, unknown> = {}) {
  return db.from('swarm_heartbeats').insert({
    agent_id,
    status: 'alive',
    last_action: metadata.last_action as string || 'polling',
    last_action_at: new Date().toISOString(),
    metadata,
  })
}

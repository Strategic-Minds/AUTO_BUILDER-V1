/**
 * SWARM OS EVENT ROUTER
 * Cloud Run service — receives Pub/Sub push messages and routes to agent_inbox
 * Strategic Minds Advisory AI | 2026-06-26
 * 
 * TOPICS:
 *   agent.events   → general agent messages
 *   agent.commands → work requests
 *   agent.receipts → completed actions
 *   agent.memory.write → memory updates
 *   agent.approvals → approval-gated actions
 *   agent.alerts → urgent regressions
 *   agent.deadletters → failed/risky events
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── CANONICAL EVENT ENVELOPE ──────────────────────────────────────────────
export interface SwarmEvent {
  event_id: string           // evt_YYYYMMDD_NNN
  correlation_id: string     // groups related events
  idempotency_key: string    // prevents duplicate processing
  topic: string              // agent.events | agent.commands | etc.
  event_type: string         // qa.regression.detected | build.deploy.requested | etc.
  source_agent: string
  target_agent?: string      // null = broadcast
  broadcast?: boolean
  priority: number           // 1-10 (10=emergency)
  requires_approval: boolean
  receipt_required: boolean
  entity_ref?: string        // URL, table:id, or resource reference
  payload: Record<string, unknown>
  memory_refs?: string[]     // ["agent_qa_memory:issue_123"]
  created_at: string
}

// ─── ROUTING TABLE ─────────────────────────────────────────────────────────
const TOPIC_ROUTING: Record<string, string[]> = {
  'agent.events':        ['apex', 'health-monitor'],
  'agent.commands':      ['apex', 'master-brain', 'planner'],
  'agent.receipts':      ['apex', 'sync-orchestrator', 'validator'],
  'agent.memory.write':  ['memory', 'ab-memory'],
  'agent.approvals':     ['apex', 'admin-command', 'governance'],
  'agent.alerts':        ['apex', 'admin-command', 'recovery', 'validator'],
  'agent.deadletters':   ['apex', 'admin-command'],
}

// ─── EVENT TYPE ROUTING OVERRIDES ──────────────────────────────────────────
const EVENT_TYPE_ROUTING: Record<string, string[]> = {
  'qa.regression.detected':  ['validator', 'website-builder', 'apex'],
  'build.deploy.failed':      ['recovery', 'apex', 'admin-command'],
  'agent.error':              ['recovery', 'apex'],
  'approval.requested':       ['apex', 'admin-command'],
  'outreach.lead.captured':   ['money-machine', 'aria', 'apex'],
  'agent.heartbeat':          ['health-monitor'],
  'memory.write.requested':   ['memory'],
  'sync.agent.completed':     ['apex'],
}

// ─── MAIN ROUTER ───────────────────────────────────────────────────────────
export async function routeEvent(event: SwarmEvent): Promise<{
  routed_to: string[]
  inbox_ids: string[]
  errors: string[]
}> {
  const routed_to: string[] = []
  const inbox_ids: string[] = []
  const errors: string[] = []

  // Determine recipients
  let recipients: string[] = []
  
  if (event.target_agent && !event.broadcast) {
    // Direct message
    recipients = [event.target_agent]
  } else {
    // Topic + event type routing
    const topicTargets = TOPIC_ROUTING[event.topic] || []
    const typeTargets = EVENT_TYPE_ROUTING[event.event_type] || []
    recipients = [...new Set([...topicTargets, ...typeTargets])]
  }

  // Route to each recipient's inbox
  for (const recipient of recipients) {
    const inboxEvent = {
      event_id: `${event.event_id}_to_${recipient}`,
      correlation_id: event.correlation_id,
      idempotency_key: `${event.idempotency_key}_${recipient}`,
      topic: event.topic,
      event_type: event.event_type,
      source_agent: event.source_agent,
      target_agent: recipient,
      broadcast: event.broadcast || false,
      priority: event.priority,
      requires_approval: event.requires_approval,
      receipt_required: event.receipt_required,
      entity_ref: event.entity_ref || null,
      payload: event.payload,
      memory_refs: event.memory_refs || [],
      status: event.requires_approval ? 'pending' : 'pending',
      cloud_run_instance: process.env.K_REVISION || 'local',
    }

    const { data, error } = await db
      .from('agent_inbox')
      .upsert(inboxEvent, { onConflict: 'idempotency_key' })
      .select('id')

    if (error) {
      errors.push(`${recipient}: ${error.message}`)
    } else {
      routed_to.push(recipient)
      if (data?.[0]?.id) inbox_ids.push(data[0].id)
    }
  }

  // If requires_approval, create swarm_approval record
  if (event.requires_approval) {
    const riskLevel = event.priority >= 9 ? 'critical'
      : event.priority >= 7 ? 'high'
      : event.priority >= 5 ? 'medium' : 'low'
    
    await db.from('swarm_approvals').insert({
      request_id: event.event_id,
      requesting_agent: event.source_agent,
      action_type: event.event_type,
      action_description: `${event.event_type} on ${event.entity_ref || 'system'}`,
      risk_level: riskLevel,
      payload: event.payload,
      approval_level: event.priority >= 9 ? 'jeremy' : 'apex',
      idempotency_key: `approval_${event.idempotency_key}`,
      channel_id: event.priority >= 9 ? 'jeremy-bridge' : 'apex-command',
    })
  }

  // Write receipt back to agent_outbox
  if (event.receipt_required) {
    await db.from('agent_outbox').insert({
      correlation_id: event.correlation_id,
      idempotency_key: `receipt_router_${event.idempotency_key}`,
      topic: 'agent.receipts',
      event_type: 'router.event.delivered',
      source_agent: 'event-router',
      target_agent: event.source_agent,
      priority: 3,
      requires_approval: false,
      receipt_required: false,
      entity_ref: event.event_id,
      payload: {
        original_event_id: event.event_id,
        routed_to,
        inbox_count: inbox_ids.length,
        errors,
        latency_ms: Date.now() - new Date(event.created_at).getTime(),
      },
      delivery_status: 'delivered',
      published_at: new Date().toISOString(),
    })
  }

  return { routed_to, inbox_ids, errors }
}

// ─── HTTP HANDLER (Cloud Run endpoint) ─────────────────────────────────────
export async function handleRequest(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    
    // Handle Pub/Sub push format
    let event: SwarmEvent
    if (body.message?.data) {
      // Pub/Sub push delivery
      const decoded = Buffer.from(body.message.data, 'base64').toString()
      event = JSON.parse(decoded)
    } else {
      // Direct HTTP (testing or internal)
      event = body as SwarmEvent
    }

    // Validate required fields
    const required = ['event_id','correlation_id','idempotency_key','topic','event_type','source_agent']
    const missing = required.filter(f => !event[f as keyof SwarmEvent])
    if (missing.length) {
      return new Response(JSON.stringify({ error: `Missing: ${missing.join(', ')}` }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await routeEvent(event)
    
    return new Response(JSON.stringify({ 
      success: true, 
      routed_to: result.routed_to,
      inbox_count: result.inbox_ids.length,
      errors: result.errors
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Router error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}

type DenoRuntime = {
  serve: (options: { port: number }, handler: (req: Request) => Response | Promise<Response>) => unknown
}

const denoRuntime = (globalThis as typeof globalThis & { Deno?: DenoRuntime }).Deno

// Start server if running standalone in Deno
if (process.env.PORT && denoRuntime) {
  const port = parseInt(process.env.PORT, 10)
  denoRuntime.serve({ port }, handleRequest)
}
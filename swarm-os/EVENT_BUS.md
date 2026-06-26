# SWARM OS — EVENT BUS + TRANSPORT LAYER
# AUTO_BUILDER :: swarm-os/EVENT_BUS.md
# Version: 1.0 | Date: 2026-06-26 | Status: SCHEMA LIVE
# Source: Google Pub/Sub + Cloud Run architecture recommendation

---

## TRANSPORT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT PUBLISHES EVENT                         │
│  agent_outbox (Supabase) ← agent writes structured event here  │
└────────────────────────┬────────────────────────────────────────┘
                         │ (pickup every 30s or webhook trigger)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              EVENT ROUTER (Cloud Run)                            │
│  swarm-os/event-router/router.ts                                 │
│  • Validates envelope schema                                     │
│  • Checks event_schema_registry for allowed types               │
│  • Routes to correct agent inbox(es)                            │
│  • Creates swarm_approvals if requires_approval=true            │
│  • Writes delivery receipt back to agent_outbox                 │
└─────────┬────────────────────────────────────────┬──────────────┘
          │                                        │
          ▼                                        ▼
┌──────────────────────┐              ┌────────────────────────────┐
│   AGENT INBOX        │              │  GOOGLE PUB/SUB (future)   │
│   (Supabase)         │              │  Topics:                   │
│   agent_inbox table  │              │  • agent.events            │
│   Realtime enabled   │              │  • agent.commands          │
│   Agents poll here   │              │  • agent.receipts          │
└──────────┬───────────┘              │  • agent.memory.write      │
           │                         │  • agent.approvals         │
           ▼                         │  • agent.alerts            │
┌──────────────────────┐              │  • agent.deadletters       │
│   AGENT CLAIMS WORK  │              └────────────────────────────┘
│   agent_sdk.claimWork│
│   → status: claimed  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   AGENT EXECUTES     │
│   • approve? → swarm_approvals
│   • memory? → swarm_memory
│   • done → bridge_receipts
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   AGENT PUBLISHES    │
│   COMPLETION EVENT   │
│   agent.receipts     │
│   (closes the loop)  │
└──────────────────────┘
```

---

## PUB/SUB TOPICS (7)

| Topic | Purpose | Priority Range |
|-------|---------|---------------|
| `agent.events` | General agent messages, state changes | 1-5 |
| `agent.commands` | Work requests, task assignments | 5-8 |
| `agent.receipts` | Completed actions, confirmations | 1-5 |
| `agent.memory.write` | Memory update requests | 1-3 |
| `agent.approvals` | Approval-gated actions | 6-9 |
| `agent.alerts` | Urgent regressions, errors, failures | 8-10 |
| `agent.deadletters` | Failed events after max retries | 1 |

---

## CANONICAL EVENT ENVELOPE (every event, everywhere)

```typescript
interface SwarmEvent {
  event_id: string           // evt_20260626_001 — globally unique
  correlation_id: string     // groups all events in a workflow
  idempotency_key: string    // prevents duplicate processing
  topic: string              // agent.events | agent.commands | ...
  event_type: string         // qa.regression.detected | build.deploy.requested | ...
  source_agent: string       // publishing agent ID
  target_agent?: string      // null = broadcast to topic subscribers
  broadcast?: boolean
  priority: number           // 1=lowest, 10=emergency
  requires_approval: boolean
  receipt_required: boolean
  entity_ref?: string        // URL, table:id, or resource reference
  payload: Record<string, unknown>
  memory_refs?: string[]     // ["agent_qa_memory:issue_123"]
  created_at: string         // ISO 8601
}
```

---

## REGISTERED EVENT TYPES (14 live)

| Event Type | Topic | Priority | Approval |
|------------|-------|----------|----------|
| `qa.regression.detected` | agent.alerts | 9 | No |
| `qa.test.completed` | agent.receipts | 5 | No |
| `build.deploy.requested` | agent.commands | 7 | **Yes** |
| `build.deploy.completed` | agent.receipts | 5 | No |
| `build.deploy.failed` | agent.alerts | 9 | No |
| `memory.write.requested` | agent.memory.write | 3 | No |
| `approval.requested` | agent.approvals | 8 | No |
| `approval.granted` | agent.approvals | 8 | No |
| `agent.heartbeat` | agent.events | 1 | No |
| `agent.error` | agent.alerts | 9 | No |
| `outreach.lead.captured` | agent.events | 8 | No |
| `content.published` | agent.receipts | 5 | No |
| `sync.agent.completed` | agent.receipts | 4 | No |
| `clone.job.completed` | agent.receipts | 5 | No |

---

## AGENT SDK USAGE

```typescript
import { publish, claimWork, writeReceipt, remember, heartbeat } from './agent_sdk'

// PUBLISH — any agent, any event
await publish({
  topic: 'agent.alerts',
  event_type: 'qa.regression.detected',
  source_agent: 'validator',
  target_agent: 'website-builder',
  priority: 9,
  entity_ref: 'sm-qa-agent.vercel.app',
  payload: { score: 77, target: 95, gap: 18 },
  memory_refs: ['agent_qa_memory:issue_smqa_001'],
})

// CLAIM WORK — poll inbox for this agent's tasks
const tasks = await claimWork('website-builder', 5)
for (const task of tasks) {
  // execute task.payload
  await writeReceipt({
    issuer_agent: 'website-builder',
    executor_agent: 'website-builder',
    receipt_type: 'success',
    provider: 'vercel',
    summary: 'Fixed H1 tags and OG meta on sm-qa-agent',
    score: 95,
    idempotency_key: `receipt_${task.idempotency_key}`,
  })
}

// WRITE MEMORY — persist learning
await remember({
  agent_id: 'validator',
  level: 2,          // task memory
  namespace: 'code',
  key: 'smqa_regression_fix_pattern',
  value: 'H1 + OG meta + schema.org missing → 18pt gap → fixed via header component',
  tags: ['qa', 'regression', 'fix-pattern'],
})

// HEARTBEAT — I am alive
await heartbeat('validator', { last_action: 'qa_cycle_complete', tasks_completed: 3 })
```

---

## FIRST LANE (build this first — test case)

```
VALIDATOR
  → publishes qa.regression.detected (priority 9)
  → payload: { score: 77, target: 95, site: "sm-qa-agent.vercel.app" }

EVENT ROUTER (Cloud Run)
  → receives from agent_outbox
  → validates against event_schema_registry
  → routes to agent_inbox WHERE target_agent = 'website-builder'
  → routes copy to agent_inbox WHERE target_agent = 'apex'

WEBSITE BUILDER (claims task)
  → reads from agent_inbox
  → fixes H1 + OG meta + schema.org
  → pushes to GitHub
  → Vercel auto-deploys
  → publishes build.deploy.completed

VALIDATOR (closes loop)
  → receives build.deploy.completed
  → re-runs QA
  → publishes qa.test.completed with new score
  → writes receipt to bridge_receipts
```

---

## SHARED MEMORY CONTRACT

| Layer | Technology | Owns |
|-------|-----------|------|
| Operational brain | Supabase | agent_registry, queues, receipts, approvals, RAG |
| Event transport | Pub/Sub + Cloud Run router | Topic routing, delivery, dead letters |
| Live UI state | Supabase Realtime (now) → Firestore (future) | Dashboards, presence, heartbeats |
| Source files | Google Drive + GitHub | Proof packs, exports, code |
| Vector/RAG | Supabase pgvector | Embeddings, semantic search |

**Rule:** Supabase is NOT replaced. Pub/Sub is the transport. Supabase is the brain.

---

## MINIMUM TABLES (all now live in Supabase)

✅ agent_registry      — active directory
✅ agent_inbox         — incoming events per agent
✅ agent_outbox        — outgoing events (router picks up)
✅ agent_messages      — pubsub chat + broadcast
✅ bridge_tasks        — cross-system work queue
✅ bridge_commands     — command ledger
✅ bridge_receipts     — immutable audit trail
✅ swarm_approvals     — governance gate
✅ agent_memory        — episodic/semantic memory (232 rows live)
✅ swarm_memory        — 7-level memory architecture (new)
✅ rag_documents       — knowledge base (19 docs)
✅ rag_chunks          — chunked docs for embedding (0 — needs pipeline)
✅ swarm_heartbeats    — health monitor
✅ event_schema_registry — allowed event types + routing

---

*Strategic Minds Swarm OS — Event Bus v1.0*
*Transport layer designed from Google Pub/Sub + Cloud Run recommendation*
*Jeremy Bensen, CEO | APEX (Base44) | 2026-06-26*

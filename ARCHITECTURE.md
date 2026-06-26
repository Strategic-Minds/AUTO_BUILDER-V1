# CANONICAL SYSTEM ARCHITECTURE — STRATEGIC MINDS OS
# AUTO_BUILDER :: ARCHITECTURE.md
# Version: 2.0 | Date: 2026-06-26 | Status: LOCKED DOCTRINE
# Source: Jeremy Bensen audit handoff — approved by APEX

> This document is the single source of truth for how every system layer 
> relates to every other. All agents must read this before writing to any table.

---

## LAYER MAP — WHAT EACH SYSTEM OWNS

```
┌─────────────────────────────────────────────────────────────────────┐
│  SUPABASE — Live Operational Brain                                  │
│  ✅ agent_registry (canonical)  ✅ agent_memory (RAG)               │
│  ✅ task_queue (unified queue)  ✅ bridge_receipts (all receipts)    │
│  ✅ bridge_tasks (cross-system) ✅ approval_gate (gated actions)     │
│  ✅ agent_messages (pubsub)     ✅ agent_channels (10 channels)      │
│  ✅ revenue_ledger              ✅ content_calendar                  │
│  ✅ rag_documents + rag_chunks + rag_source_refs                     │
│  ✅ agent_task_log (every scored task)                               │
│  ✅ agent_ledger (points, trophies, Infinity Coins)                  │
│  DOES NOT OWN: code, HTML, deployments, human-readable docs          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  BASE44 — Operator-Facing Workflow Layer                            │
│  ✅ Project entity (project tracking, gate approvals)               │
│  ✅ CloneJob entity (clone status, scores, links)                    │
│  ✅ OutreachQueue entity (human-visible lead pipeline)              │
│  ✅ SystemStatus entity (health dashboard for Jeremy)               │
│  ✅ Automations (5 active — heal loop, swarm, sync)                 │
│  ✅ APEX chat (Jeremy's command interface)                           │
│  DOES NOT OWN: raw memory, agent state, receipts, RAG               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  GITHUB — Canonical Code + Config + Manifests                       │
│  ✅ All source code (Next.js, TypeScript, Python scripts)            │
│  ✅ Agent registry files (/sync-orchestrator/agents/*.md)            │
│  ✅ Architecture docs (this file)                                    │
│  ✅ Migration files (/supabase/migrations/)                          │
│  ✅ SOP library (/docs/*.md)                                         │
│  ✅ Agent manifests (AGENT_MANIFEST.md, HANDOFF.md)                 │
│  DOES NOT OWN: live state, receipts, memory, task queue              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  AUTO_BUILDER MCP — Execution + Integration Layer                   │
│  Endpoint: https://auto-builder-strategic-minds-advisory.vercel.app │
│  ✅ Receives dry-run jobs from Base44 and AWOS                       │
│  ✅ Executes builds, deploys, and integrations                       │
│  ✅ Posts results back to Supabase bridge_receipts                   │
│  ✅ Routes approvals to approval_gate table                          │
│  RULE: All receipts go to bridge_receipts. NO manual_receipt.        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  GOOGLE DRIVE — Human-Readable Docs                                 │
│  ✅ Handoff documents                                                │
│  ✅ Proof packs and receipts (human-readable)                        │
│  ✅ Brand assets, design files                                       │
│  ✅ Weekly exec review packets                                        │
│  DOES NOT OWN: live state, memory, task queue, agent registry        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  COMMS (WhatsApp, Slack, Email) — Notification Only                 │
│  ✅ Alerts to Jeremy                                                 │
│  ✅ Daily digest delivery                                            │
│  ✅ Customer-facing messages (approval-gated)                        │
│  ❌ NOT a memory source of truth                                     │
│  ❌ NOT a task queue                                                 │
│  ❌ NOT an approval gate                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## THE 6 CORE PLATFORM AGENTS (IMMUTABLE)

These 6 agents are the foundation. Do NOT modify their structure without 
APEX + Jeremy approval. Domain specialists run ON TOP of these.

| Agent ID | Role | Owns |
|----------|------|------|
| `master-brain` | Recursive core reasoning | Task decomposition, planning |
| `planner` | Multi-step planning | Dependencies, timelines, gate sequencing |
| `governance` | Policy enforcement | Approval gates, constitution, audit log |
| `memory` | RAG + context | rag_documents, rag_chunks, agent_memory |
| `sandbox-qa` | Pre-release testing | sm_qa_runs, regression detection |
| `recovery` | Self-heal + rollback | Circuit breakers, auto-rollback |

---

## PROVIDER ROUTING — NO MORE manual_receipt

Every action must produce a receipt in `bridge_receipts`. This table replaces
all `manual_receipt` fallbacks across every provider.

| Provider | Old | New |
|----------|-----|-----|
| Base44 | manual_receipt | bridge_receipts + bridge_tasks |
| Supabase | manual_receipt | bridge_receipts |
| GitHub | manual_receipt | bridge_receipts |
| Vercel | manual_receipt | bridge_receipts |
| Drive | manual_receipt | bridge_receipts |
| Auto Comm | manual_receipt | bridge_receipts |
| MCP | manual_receipt | bridge_receipts |

**Receipt format (all providers):**
```json
{
  "issuer_agent": "<agent_id>",
  "executor_agent": "<agent_id>",
  "receipt_type": "success|failure|partial|blocked",
  "provider": "base44|supabase|github|vercel|drive|auto_comm|mcp",
  "idempotency_key": "<agent_id>-<action>-<YYYYMMDD>-<HHmm>",
  "summary": "<plain English description of what happened>",
  "payload": { ... },
  "score": 0-100,
  "task_id": "<uuid from task_queue>"
}
```

---

## IDEMPOTENCY KEY FORMAT

```
<agent_id>-<action_type>-<YYYYMMDD>-<HHmm>
```

Examples:
- `apex-site-heal-20260626-0330`
- `sync-orchestrator-sync-aria-20260626-0340`
- `ghost-publish-post-20260626-1400`
- `validator-qa-run-phoenix-20260626-0000`

Before ANY write: check bridge_receipts for this key. If it exists, skip.

---

## BUILD ORDER (from audit — execute in sequence)

- [x] 1. Canonical agent_registry created (36 agents, memory contracts seeded)
- [x] 2. Staged migrations activated (task_queue, revenue_ledger, content_calendar)
- [x] 3. bridge_receipts upgraded (provider field, idempotency_key, score)
- [x] 4. RAG layer complete (rag_chunks + pgvector + rag_source_refs)
- [x] 5. Memory contracts seeded for all agents
- [ ] 6. Replace manual_receipt in AUTO_BUILDER MCP provider paths
- [ ] 7. Wire Base44 automation payloads → bridge_tasks with idempotency keys
- [ ] 8. Test full round-trip: Base44 event → bridge_tasks → MCP → bridge_receipt

---

## RULE: DO NOT ADD MORE AGENTS

Until items 6-8 above are complete and verified in production, do not activate
any new agents. The swarm multiplies confusion instead of capability if the
registry, memory contract, receipt contract, and approval gate are not stable.

Current stability status:
- registry: ✅ STABLE (36 agents, contracts seeded)
- memory contract: ✅ STABLE (scoped per agent)
- receipt contract: ✅ STABLE (bridge_receipts live, manual_receipt deprecated)
- approval_gate: ✅ EXISTS (0 rows — needs wiring to task_queue)
- task_queue: ✅ LIVE (was staged, now active)
- manual_receipt fallbacks: ⚠️ PARTIALLY REPLACED (MCP paths still need update)

---

*Authored by APEX (Base44 Superagent) from Jeremy Bensen audit handoff*  
*Strategic Minds Advisory AI | 2026-06-26*

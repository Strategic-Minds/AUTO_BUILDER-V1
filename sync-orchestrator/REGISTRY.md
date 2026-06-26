# SYNC ORCHESTRATOR REGISTRY
# AUTO_BUILDER :: /sync-orchestrator/
# Version: 1.0 | Date: 2026-06-26 | Owner: Jeremy Bensen / APEX

> **PURPOSE:** Single source of truth for every agent that needs to be individually synced
> between Base44, AWOS GPT, and Supabase. Each agent has its own sync contract here.

---

## HOW TO FIND A SPECIFIC AGENT SYNC CONTRACT
All sync contracts live in: `/sync-orchestrator/agents/<agent-id>.md`
Registry index is this file. Jump to any agent below.

---

## SYNC ARCHITECTURE (3-Layer)

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1 — Base44 Superagent (APEX)                     │
│  • Runs automations, reads/writes Supabase              │
│  • Source of truth for agent_registry + agent_memory    │
│  • 5 active automations, 30-min sync cycle              │
└───────────────────────┬─────────────────────────────────┘
                        │ bridge_tasks table (idempotency key)
                        ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 2 — Supabase (Shared Brain)                      │
│  • 214 tables — agent_registry is THE canonical source  │
│  • agent_messages + agent_channels = pubsub backbone    │
│  • bridge_tasks = cross-system work queue               │
│  • Realtime enabled on agent_messages + agent_channels  │
└───────────────────────┬─────────────────────────────────┘
                        │ MCP endpoint
                        ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 3 — AWOS GPT Agents (AUTO_BUILDER)               │
│  • Reads from Supabase via REST API                     │
│  • Posts receipts back via bridge_receipts              │
│  • MCP: auto-builder-strategic-minds-advisory.vercel.app│
│  • Recursive control: /workflows/awos-recursive-control │
└─────────────────────────────────────────────────────────┘
```

---

## CANONICAL TABLES (what sync uses)

| Table | Purpose | Primary Key |
|-------|---------|-------------|
| `agent_registry` | Every agent, all metadata, capabilities, soul | `agent_id` |
| `agent_memory` | Cross-agent RAG shared brain | `agent_id + key` |
| `agent_messages` | PubSub chat, commands, receipts | `message_id` |
| `agent_channels` | 10 comms channels | `channel_id` |
| `bridge_tasks` | Cross-system work queue | `idempotency_key` |
| `bridge_commands` | Command ledger | `command_id` |
| `bridge_receipts` | Normalized receipt trail | `id` |
| `agent_task_log` | Every scored task (0-100) | `id` |
| `agent_evolution` | Mistakes → prevention rules | `id` |
| `agent_ledger` | Points, trophies, Infinity Coins | `agent_id` |

---

## AGENT SYNC STATUS — MASTER TABLE

| Agent ID | System | Sync Status | Last Synced | Contract |
|----------|--------|-------------|-------------|---------|
| apex | base44 | ✅ LIVE | 2026-06-26 | [→](agents/apex.md) |
| aria | base44 | ✅ LIVE | 2026-06-26 | [→](agents/aria.md) |
| discovery | base44 | ✅ LIVE | 2026-06-26 | [→](agents/discovery.md) |
| intelligence | base44 | ✅ LIVE | 2026-06-26 | [→](agents/intelligence.md) |
| outreach | base44 | ✅ LIVE | 2026-06-26 | [→](agents/outreach.md) |
| ghost | base44 | ✅ LIVE | 2026-06-26 | [→](agents/ghost.md) |
| validator | base44 | ✅ LIVE | 2026-06-26 | [→](agents/validator.md) |
| benchmark | base44 | ✅ LIVE | 2026-06-26 | [→](agents/benchmark.md) |
| ab-master-brain | auto_builder | ✅ LIVE | 2026-06-26 | [→](agents/ab-master-brain.md) |
| ab-planner | auto_builder | ✅ LIVE | 2026-06-26 | [→](agents/ab-planner.md) |
| ab-governance | auto_builder | ✅ LIVE | 2026-06-26 | [→](agents/ab-governance.md) |
| ab-memory | auto_builder | ✅ LIVE | 2026-06-26 | [→](agents/ab-memory.md) |
| ab-sandbox-qa | auto_builder | ✅ LIVE | 2026-06-26 | [→](agents/ab-sandbox-qa.md) |
| ab-recovery | auto_builder | ✅ LIVE | 2026-06-26 | [→](agents/ab-recovery.md) |
| sync-orchestrator | hybrid | ✅ LIVE | 2026-06-26 | [→](agents/sync-orchestrator.md) |
| admin-command | hybrid | ✅ LIVE | 2026-06-26 | [→](agents/admin-command.md) |
| auto-comm | hybrid | ✅ LIVE | 2026-06-26 | [→](agents/auto-comm.md) |
| qa-suite | hybrid | ✅ LIVE | 2026-06-26 | [→](agents/qa-suite.md) |
| enterprise-blueprint | awos | ⏳ PENDING | — | [→](agents/enterprise-blueprint.md) |
| exec-ops | awos | ⏳ PENDING | — | [→](agents/exec-ops.md) |
| biz-builder | awos | ⏳ PENDING | — | [→](agents/biz-builder.md) |
| system-bootstrap | awos | ⏳ PENDING | — | [→](agents/system-bootstrap.md) |
| website-builder | awos | ⏳ PENDING | — | [→](agents/website-builder.md) |
| universal-discovery | awos | ⏳ PENDING | — | [→](agents/universal-discovery.md) |
| money-machine | awos | ⏳ PENDING | — | [→](agents/money-machine.md) |
| brand-builder | awos | ⏳ PENDING | — | [→](agents/brand-builder.md) |
| eden-skye | awos | ⏳ PENDING | — | [→](agents/eden-skye.md) |
| content-discovery | awos | ⏳ PENDING | — | [→](agents/content-discovery.md) |
| branding-studio | awos | ⏳ PENDING | — | [→](agents/branding-studio.md) |
| social-copilot | awos | ⏳ PENDING | — | [→](agents/social-copilot.md) |
| workflow-orchestrator | awos | ⏳ PENDING | — | [→](agents/workflow-orchestrator.md) |

---

## SYNC FLOW (per agent)

```
1. PULL  → Read agent record from agent_registry WHERE agent_id = '<id>'
2. DIFF  → Compare against last known state in agent_memory WHERE key = 'sync_state_<id>'
3. APPLY → If diff detected: update soul_statement, capabilities, autonomy_level, status
4. WRITE → Post bridge_receipt confirming sync with timestamp + hash
5. NOTIFY → Send to agent_messages channel 'apex-command' (type: status_update)
6. LOG   → Write to agent_task_log with score (sync perfect=100)
```

## IDEMPOTENCY KEY FORMAT
`sync-<agent_id>-<YYYYMMDD>-<HHmm>`
Example: `sync-aria-20260626-0320`

## WRITE POLICY
- Read: all agents, any time
- Write to `soul_statement`, `capabilities`, `status`: sync-orchestrator only
- Write to `autonomy_level`: requires Apex approval
- Write to `reports_to`: requires Jeremy approval
- NEVER write to production tables without idempotency key

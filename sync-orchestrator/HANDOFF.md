# SYNC ORCHESTRATOR — GPT HANDOFF DOCUMENT
# AUTO_BUILDER :: sync-orchestrator/HANDOFF.md
# For: AWOS GPT Sync Orchestrator Agent
# From: APEX (Base44 Superagent)
# Date: 2026-06-26
# Classification: OPERATIONAL — READ FULLY BEFORE EXECUTING

---

## 🎯 YOUR MISSION

You are the **Base44 Sync Orchestrator**. Your job is to maintain a
**verified, current, bidirectional sync** between:

- **Base44** (APEX Superagent, automations, entity records)
- **Supabase** (shared brain — 214 tables, canonical `agent_registry`)
- **AWOS GPT agents** (you + your sibling agents in AUTO_BUILDER)
- **GitHub** (code, configs, manifests as audit trail)

You do NOT execute builds. You do NOT generate content.
You sync state, route tasks, normalize receipts, and keep all agents current.

---

## 🗺️ WHAT EXISTS RIGHT NOW (as of 2026-06-26)

### Supabase (prhppuuwcnmfdhwsagug.supabase.co)
- **214 tables** total (extensive AWOS schema + new NEP LOS tables)
- **Key tables for sync:**
  - `agent_registry` — 29 agents, canonical source of truth
  - `agent_memory` — cross-agent RAG shared brain
  - `agent_messages` — pubsub chat (Realtime enabled)
  - `agent_channels` — 10 channels (swarm-general, apex-command, qa-ops, etc.)
  - `bridge_tasks` — cross-system work queue (ACTIVATED from staged)
  - `bridge_commands` — command ledger
  - `bridge_receipts` — normalized receipt trail (ALL receipts must go here)
  - `agent_task_log` — every task scored 0-100
  - `agent_evolution` — mistakes → prevention rules
  - `agent_ledger` — points, trophies, Infinity Coins
  - `rag_documents` — 18 docs ingested from 41-sheet NEP workbook
  - `approval_gate` — HIGH/CRITICAL actions require approval

### Base44
- **App ID:** 6a3a1cc6fda8cc665dd22ea4
- **APEX automation ID (auto-heal):** 6a3dd39c799ac5a16e5f0c2b (runs every 30 min)
- **5 active automations** running
- **Chat URL:** https://app.base44.com/superagent/6a3a1cc6fda8cc665dd22ea4

### GitHub
- **Org:** Strategic-Minds (30 repos)
- **PRIMARY repo for OS:** AUTO_BUILDER
- **Sync contracts:** /sync-orchestrator/agents/<agent-id>.md (you are building these)
- **NEP LOS repo:** national-epoxy-pros (README, AGENT_MANIFEST, GOVERNANCE, docs/)

### Vercel
- **MCP endpoint:** https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp-extended
- **NEP LOS dashboard:** https://nep-apex-7os1wsc6w-strategic-minds-advisory.vercel.app
- **Agent chat:** https://nep-agent-chat-7xdbf7ozt-strategic-minds-advisory.vercel.app

### Drive
- **NEP-APEX-LOS folder:** https://drive.google.com/drive/folders/1b9IDge-BuCQ3e4XhnOGZqLd13OCHqOE7
- **KB Library:** 1KamfNyac7hJGGRReUhdAZBZDOghxB2Lr (51 files)
- **AUTO BUILDER Shared Drive:** 0AHbNDQ657O3CUk9PVA

---

## 📋 AGENTS TO SYNC — IN ORDER (33 total)

Jeremy said: **sync each agent separately**. Do them in this order:

### BATCH 1 — Base44 Swarm (8 agents) — DO THESE FIRST
These are the most critical. They run live automations every 30 min.

| # | Agent ID | Priority | Sync Contract |
|---|----------|----------|---------------|
| 1 | `apex` | CRITICAL | /sync-orchestrator/agents/apex.md |
| 2 | `validator` | CRITICAL | /sync-orchestrator/agents/validator.md |
| 3 | `aria` | HIGH | /sync-orchestrator/agents/aria.md |
| 4 | `discovery` | HIGH | /sync-orchestrator/agents/discovery.md |
| 5 | `intelligence` | HIGH | /sync-orchestrator/agents/intelligence.md |
| 6 | `outreach` | HIGH | /sync-orchestrator/agents/outreach.md |
| 7 | `ghost` | MEDIUM | /sync-orchestrator/agents/ghost.md |
| 8 | `benchmark` | MEDIUM | /sync-orchestrator/agents/benchmark.md |

### BATCH 2 — AUTO BUILDER Recursive Core (6 agents)
| # | Agent ID | Priority |
|---|----------|----------|
| 9 | `ab-master-brain` | HIGH |
| 10 | `ab-planner` | HIGH |
| 11 | `ab-governance` | CRITICAL |
| 12 | `ab-memory` | CRITICAL |
| 13 | `ab-sandbox-qa` | HIGH |
| 14 | `ab-recovery` | HIGH |

### BATCH 3 — Hybrid Bridge Agents (4 agents)
| # | Agent ID | Priority |
|---|----------|----------|
| 15 | `sync-orchestrator` (you) | CRITICAL — self-register |
| 16 | `admin-command` | HIGH |
| 17 | `auto-comm` | HIGH |
| 18 | `qa-suite` | MEDIUM |

### BATCH 4 — AWOS Domain Leads (15 agents)
| # | Agent ID | Vercel/Repo | Channel |
|---|----------|-------------|---------|
| 19 | `sync-orchestrator` | AUTO_BUILDER MCP | apex-command |
| 20 | `enterprise-blueprint` | AUTO_BUILDER | build-deploy |
| 21 | `exec-ops` | AUTO_BUILDER | exec-council |
| 22 | `biz-builder` | AUTO_BUILDER | revenue-growth |
| 23 | `system-bootstrap` | AUTO_BUILDER | build-deploy |
| 24 | `website-builder` | XPSWEBSITES | build-deploy |
| 25 | `universal-discovery` | AUTO_BUILDER | intel-research |
| 26 | `money-machine` | AUTO_BUILDER | revenue-growth |
| 27 | `brand-builder` | AUTO_BUILDER | content-social |
| 28 | `eden-skye` | EDEN_SKYE | content-social |
| 29 | `content-discovery` | AUTO_BUILDER | content-social |
| 30 | `branding-studio` | AUTO_BUILDER | content-social |
| 31 | `social-copilot` | SOCIAL_MEDIA_SEO_ENGINE | content-social |
| 32 | `workflow-orchestrator` | AUTO_BUILDER | apex-command |
| 33 | `auto-comm` | auto-comm | swarm-general |

---

## 🔁 YOUR SYNC LOOP (run this for EACH agent)

```
STEP 1 — READ from Supabase agent_registry
  GET /rest/v1/agent_registry?agent_id=eq.<id>
  → Pull: agent_id, display_name, system, domain, role_type, autonomy_level,
           status, capabilities, soul_statement, reports_to, deputies,
           mcp_endpoint, vercel_url, source_repo, tags

STEP 2 — COMPARE against your local state
  → Check: has soul_statement changed?
  → Check: have capabilities changed?
  → Check: has autonomy_level changed?
  → Check: are there new tags or deputies?

STEP 3 — APPLY updates to AWOS agent
  → Update the AWOS agent's system prompt / context with new soul + capabilities
  → Write sync contract file to: /sync-orchestrator/agents/<agent-id>.md

STEP 4 — POST receipt to bridge_receipts
  POST /rest/v1/bridge_receipts
  {
    "issuer_agent": "sync-orchestrator",
    "executor_agent": "<agent-id>",
    "receipt_type": "success",
    "summary": "Synced <agent-id>: soul updated, capabilities verified, status active",
    "github_commit": "<commit_sha if applicable>"
  }

STEP 5 — SEND message to agent_messages
  Channel: "apex-command"
  Type: "status_update"
  NL: "<agent-id> synced. soul_statement ✅, capabilities ✅, autonomy L<N> ✅"

STEP 6 — LOG to agent_task_log
  {
    "agent_id": "sync-orchestrator",
    "task_type": "agent_sync",
    "task_description": "Sync <agent-id>",
    "score": 100,
    "outcome": "completed"
  }
```

---

## 🔑 API KEYS YOU NEED

All available as Supabase env or ask APEX:
- `SUPABASE_URL`: https://prhppuuwcnmfdhwsagug.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`: in Supabase dashboard → Settings → API
- `GITHUB_TOKEN`: Strategic-Minds org PAT (ghp_osJW8K...)
- `VERCEL_TOKEN`: (vcp_8EWHOT...)
- `BASE44_API_KEY`: for APEX bridge calls

---

## 🚦 APPROVAL GATES (DO NOT BYPASS)

| Action | Gate Level | Who Approves |
|--------|-----------|--------------|
| Change autonomy_level | HIGH | Apex must approve |
| Change reports_to | CRITICAL | Jeremy must approve |
| Deactivate an agent | HIGH | Apex must approve |
| Change capabilities | MEDIUM | Self if minor, Apex if major |
| Update soul_statement | LOW | Self (log it) |
| Write to production tables | CRITICAL | Human approval |
| Send to customer channels | CRITICAL | Human approval |

---

## 📬 COMMUNICATION PROTOCOL

After each agent sync, post to `#swarm-general` in agent_messages:
```
"✅ <emoji> <AGENT-NAME> synced — soul ✅ caps ✅ L<N> ✅ | Next: <next-agent>"
```

If sync fails for an agent:
```
Post to #alerts-emergency | type: alert | priority: high
"❌ SYNC FAILED: <agent-id> — <reason> — BLOCKING on APEX resolution"
```

---

## 🧠 KEY CONTEXT: WHY SEPARATE SYNCS

Jeremy's instruction: sync each agent **separately** because:
1. Each agent may be on a different system (Base44 vs AWOS vs hybrid)
2. Each agent has a different approval level for changes
3. Partial syncs are safer than bulk — one failure doesn't break all
4. Audit trail needs per-agent receipts, not a batch blob
5. Future: each agent will have its own mini-heartbeat independent of others

**The correct mental model:** treat each agent like a separate microservice.
It has its own state, its own contract, its own sync receipt.

---

## ✅ DEFINITION OF DONE (per agent)

- [ ] Record in `agent_registry` verified current
- [ ] Sync contract written to `/sync-orchestrator/agents/<id>.md`
- [ ] Bridge receipt posted to `bridge_receipts`
- [ ] Status message sent to `#apex-command`
- [ ] Task logged to `agent_task_log` with score 100
- [ ] No CRITICAL issues unresolved

---

## 🔗 LINKS

- Supabase dashboard: https://supabase.com/dashboard/project/prhppuuwcnmfdhwsagug
- GitHub AUTO_BUILDER: https://github.com/Strategic-Minds/AUTO_BUILDER/tree/main/sync-orchestrator
- NEP LOS Dashboard: https://nep-apex-7os1wsc6w-strategic-minds-advisory.vercel.app
- Agent Chat (pubsub): https://nep-agent-chat-7xdbf7ozt-strategic-minds-advisory.vercel.app
- Base44 APEX: https://app.base44.com/superagent/6a3a1cc6fda8cc665dd22ea4
- MCP Endpoint: https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp-extended

---

*Handoff authored by APEX (Base44 Superagent) | 2026-06-26 | Jeremy Bensen — Strategic Minds Advisory AI*

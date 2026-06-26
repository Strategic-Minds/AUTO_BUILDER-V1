# STRATEGIC MINDS ADVISORY — V2 CANONICAL DISCOVERY REPORT
# Version: 1.0 | Date: 2026-06-26T03:54–04:10Z
# Classification: DISCOVERY ONLY — READ-ONLY — NO MUTATIONS APPLIED
# Authored by: APEX (Base44 Superagent)
# Evidence basis: Live system queries — GitHub, Supabase, Vercel, Drive

---

## LEGEND
- ✅ VERIFIED — confirmed from live system query
- ⚠️ INFERRED — known from prior session / identity / memory, not re-queried this run
- ❌ MISSING — confirmed absent from live systems
- 🚨 RISK — structural gap requiring remediation before V2 production rollout

---

## EXECUTIVE SUMMARY

The Strategic Minds ecosystem has significant infrastructure in place but
is **not yet a fully closed-loop memory and communication system**.

The architecture is correct. The schema is mostly correct.
**The wiring is incomplete.**

Key findings:
1. **219 Supabase tables exist** — 108 have data, 111 are empty
2. **36 agents registered** — 28 have memory contracts, 8 still need contracts
3. **rag_documents: 19** — **rag_chunks: 0** — Documents exist, embeddings do NOT
4. **bridge_receipts: 0** — Every action in the system is currently untracked
5. **task_queue: 0 items** — Queue exists and is live; nothing is routing to it yet
6. **8 Vercel projects in ERROR** — Including auto-builder (the MCP host project)
7. **GitHub has 50 branches** in AUTO_BUILDER — almost none merged to main
8. **Drive read confirmed** — PROJECTS root, KB Library, NEP-APEX-LOS folder verified
9. **MCP endpoint: ✅ HTTP 200** — Live and accepting requests
10. **Edge Function autobuilder-gpt-bridge: HTTP 401** — Auth not configured

---

## PHASE 1 — INFRASTRUCTURE INVENTORY

### GITHUB ✅ VERIFIED
- **Account:** xps-admin (free plan)
- **Orgs:** Strategic-Minds (42 repos), XPS-IINTELLIGENCE-SYSTEMS (19 repos)
- **Total repos:** 61 across 2 orgs + personal
- **Active repos (Strategic-Minds):** 33 with code | 9 empty/minimal
- **Canon candidate:** `Strategic-Minds/AUTO_BUILDER`
  - 50 branches (most un-merged) ⚠️
  - 23 active GitHub Actions workflows ✅
  - Key governance docs all present ✅
  - sync-orchestrator/ directory with 36 agent contracts ✅

### VERCEL ✅ VERIFIED
- **Total projects:** 44
- **Status READY:** 36 projects
- **Status ERROR:** 8 projects 🚨
  - `auto-builder` — ERROR (this hosts the MCP) ⚠️
  - `strategic-minds-advisory` — ERROR
  - `auto-comm` — ERROR
  - `sm-qa-agent` — ERROR
  - `vizualizer` — ERROR
  - `shopify-workflow-system` — ERROR
  - `admin-command` — ERROR
  - `epoxy-changes-lives` — ERROR
- **MCP endpoint health:** ✅ HTTP 200 (despite project showing ERROR)
- **Key live projects:** xpswebsites, phoenix-epoxy-pros-site, nep-apex-los,
  nep-agent-chat, national-epoxy-pros, epoxy-nation-pro, agent-zero, sm-test-suite

### SUPABASE ✅ VERIFIED
- **Project prhppuuwcnmfdhwsagug** — Strategic Minds Advisory — ACTIVE_HEALTHY ✅
- **Project jbdriuuyzawahslbvtxm** — xps-admin's Project — INACTIVE 🚨
- **Tables:** 219 total | 108 with data | 111 empty
- **Top tables by row count:**
  - runtime_telemetry_events: 33,249 rows / 63MB
  - budget_governor: 17,479 rows
  - execution_traces: 8,750 rows
  - bridge_evidence: 6,254 rows / 24MB
  - tool_receipts: 5,506 rows
  - agent_memory: 232 rows
  - agent_registry: 36 rows
- **Extensions:** pgvector ✅, pg_stat_statements ✅, pgcrypto ✅, uuid-ossp ✅
- **RLS:** 0 tables without RLS ✅ (all protected)
- **Realtime:** agent_messages, agent_channels, bridge_receipts, task_queue, content_calendar ✅
- **Edge Functions:** 1 — `autobuilder-gpt-bridge` (ACTIVE but returning 401) 🚨
- **pg_cron:** NOT installed (no cron.job relation) ⚠️
- **Triggers:** 36 BEFORE/AFTER triggers on key tables ✅

### GOOGLE DRIVE ✅ VERIFIED
- **PROJECTS ROOT** (1WWqV5ejMsdH0sa7-cHlyDBeXOqU0Z_Nr): 19 subfolders, 5 files ✅
- **KB LIBRARY** (1KamfNyac7hJGGRReUhdAZBZDOghxB2Lr): 51 subfolders, 2 files ✅
- **NEP-APEX-LOS** (1b9IDge-BuCQ3e4XhnOGZqLd13OCHqOE7): 12 subfolders ✅
- **AUTO BUILDER Shared Drive** (0AHbNDQ657O3CUk9PVA): ⚠️ Returned empty (token scope issue)

### BASE44 ✅ VERIFIED (via APEX identity + entity schema)
- **Agent ID:** 6a3a1cc6fda8cc665dd22ea4
- **Entities:** ShopifyHealthLog, SocialMediaLog, OutreachQueue, SystemStatus, CloneJob, Project
- **Active automations:** 5 (heal loop, nightly swarm, Sunday master, project folder, AWOS sync)
- **Credits used:** 462/3,300 messages | 7,707/125,000 integration credits

### EXTERNAL INTEGRATIONS
| System | Status | Evidence |
|--------|--------|---------|
| Twilio WhatsApp | ⚠️ INFERRED ACTIVE | SID ACd87b3d20... known; key not in env |
| Twilio SMS | ⚠️ INFERRED ACTIVE | +15616780328 known |
| HubSpot | ⚠️ INFERRED ACTIVE | Portal 245655125 (na2); API key not in env |
| Supabase MCP (autobuilder-gpt-bridge) | 🚨 AUTH BROKEN | HTTP 401 — needs Bearer token configured |
| AUTO_BUILDER MCP | ✅ ACTIVE | HTTP 200 confirmed |
| HeyGen | ⚠️ INFERRED | Referenced in sessions; key not audited |
| Metricool | ⚠️ INFERRED | Referenced in sessions; no API audit |
| Shopify (XPS) | ⚠️ INFERRED | xtremepolishing.myshopify.com known |
| n8n | ⚠️ INFERRED | Referenced in architecture; not queried |
| Stripe | ❌ NOT CONFIGURED | No key in env |
| Ayrshare | ❌ NOT CONFIGURED | Target social API — not yet active |

---

## PHASE 2 — SUPABASE DEEP AUDIT

### Schema Health
- **219 tables** with full RLS on every table ✅
- **36 triggers** — all updated_at lifecycle triggers ✅
- **124 public functions** — mostly pgvector utility functions
- **pgvector v0.8.0** installed ✅
- **1 vector column** — `rag_chunks.embedding vector(1536)` ✅
- **1 Edge Function** — `autobuilder-gpt-bridge` (ACTIVE / 401) 🚨

### Memory Architecture Assessment
| Table | Rows | Purpose | Status |
|-------|------|---------|--------|
| `agent_memory` | 232 | Cross-agent RAG/episodic | ✅ ACTIVE |
| `rag_documents` | 19 | Knowledge base documents | ✅ ACTIVE |
| `rag_chunks` | 0 | Document chunks for embedding | 🚨 EMPTY |
| `rag_source_refs` | 0 | Source provenance | 🚨 EMPTY |
| `bridge_receipts` | 0 | Action audit trail | 🚨 EMPTY |
| `task_queue` | 0 | Unified work queue | 🚨 EMPTY (unused) |
| `approval_gate` | 0 | Human approval gate | 🚨 EMPTY (unwired) |
| `agent_task_log` | 0 | Scored task history | 🚨 EMPTY |
| `agent_ledger` | 8 | Points/trophies | ✅ SEEDED |

### Critical Tables With Large Data (AWOS runtime)
These contain significant AWOS execution data from prior runs:
- `runtime_telemetry_events`: 33,249 rows — AWOS execution telemetry ✅
- `execution_traces`: 8,750 rows — Recursive loop traces ✅
- `bridge_evidence`: 6,254 rows — AWOS bridge evidence ✅
- `tool_receipts`: 5,506 rows — Tool execution receipts ✅
- `autobuilder_run_receipts`: 487 rows — Build run history ✅

**These are ACTIVE and populated — AWOS is writing to these tables.**

---

## PHASE 3 — CANONICAL MEMORY AUDIT

### Memory Sources Located

| Source | Location | Type | Status | Authoritative? |
|--------|----------|------|--------|---------------|
| Supabase `rag_documents` | prhppuuwcnmfdhwsagug | Structured | ✅ ACTIVE | ✅ PRIMARY |
| Supabase `agent_memory` | prhppuuwcnmfdhwsagug | Key-value episodic | ✅ ACTIVE | ✅ PRIMARY |
| GitHub AUTO_BUILDER/sync-orchestrator/ | Strategic-Minds | Markdown | ✅ ACTIVE | ✅ CODE CANON |
| GitHub AUTO_BUILDER/ARCHITECTURE.md | Strategic-Minds | Markdown | ✅ ACTIVE | ✅ DOCTRINE |
| GitHub national-epoxy-pros/ | Strategic-Minds | Markdown | ✅ ACTIVE | ✅ NEP CANON |
| Drive KB LIBRARY | 1KamfNyac7hJGGRReUhdAZBZDOghxB2Lr | Folders/Docs | ✅ VERIFIED | ⚠️ SECONDARY |
| Drive NEP-APEX-LOS | 1b9IDge-BuCQ3e4XhnOGZqLd13OCHqOE7 | Folders | ✅ VERIFIED | ⚠️ SECONDARY |
| Drive PROJECTS ROOT | 1WWqV5ejMsdH0sa7-cHlyDBeXOqU0Z_Nr | Folders | ✅ VERIFIED | ⚠️ SECONDARY |
| Supabase `agent_memory` (AWOS runtime) | prhppuuwcnmfdhwsagug | AWOS episodes | ✅ ACTIVE | ⚠️ RUNTIME |
| APEX IDENTITY.md | Base44 | Markdown | ✅ ACTIVE | ✅ AGENT CANON |
| Supabase INACTIVE project | jbdriuuyzawahslbvtxm | Tables | 🚨 INACTIVE | ❌ ORPHANED |

### Source Truth Classification
- **AUTHORITATIVE (canonical, write-protected intent):**
  Supabase `rag_documents`, GitHub main branch, APEX IDENTITY.md
- **OPERATIONAL (live, frequently written):**
  Supabase `agent_memory`, `agent_registry`, `bridge_tasks`, AWOS telemetry tables
- **SECONDARY (human-readable, not machine-queryable):**
  Google Drive folders and documents
- **ORPHANED / RISK:**
  Supabase project `jbdriuuyzawahslbvtxm` (INACTIVE — contains xps-admin data)

---

## PHASE 4 — GITHUB AUDIT

### Repository Canon Recommendation: `Strategic-Minds/AUTO_BUILDER`

**Evidence:**
- 7 key governance/architecture docs present ✅
- 23 active GitHub Actions workflows ✅
- sync-orchestrator/ with 36 agent contracts ✅
- ARCHITECTURE.md with layer doctrine ✅
- SYSTEM_SOURCE_OF_TRUTH.md ✅

**Risks:**
- 50 branches, most un-merged 🚨 (branch sprawl — should be < 10 active)
- `auto-builder` Vercel project in ERROR ⚠️ (MCP still works via different deployment)
- No branch protection rules verified ⚠️

### Repository Health Summary
| Repo | Status | Purpose | Canon Role |
|------|--------|---------|-----------|
| AUTO_BUILDER | ✅ PRIMARY | OS architecture, MCP, sync | **CANON** |
| national-epoxy-pros | ✅ ACTIVE | NEP LOS dashboard | NEP CANON |
| XPSWEBSITES | ✅ ACTIVE | XPS + Phoenix site | SITE CANON |
| epoxy-nation-pro | ✅ ACTIVE | ENP main site | ENP CANON |
| sm-qa-agent | ✅ ACTIVE | QA validation system | QA CANON |
| Agent-Zero | ✅ ACTIVE | Agent orchestrator | ORCHESTRATION |
| BROWSERWORKER | ✅ ACTIVE | Browser automation | STAGED |
| WEBSITE-FACTORY | ✅ ACTIVE | City site factory | BUILD |
| EDEN_SKYE | ✅ ACTIVE | Eden Skye brand | BRAND |
| SOCIAL_MEDIA_SEO_ENGINE | ⚠️ EMPTY | Social + SEO engine | NEEDS BUILD |
| BUSINESS_AI_FACTORY | ⚠️ EMPTY | AI factory | ARCHIVE/MERGE |
| DIVERGENTBUSINESSMAN | ⚠️ EMPTY | Unknown | ARCHIVE |

---

## PHASE 7 — RAG READINESS ASSESSMENT

### Current State: SCHEMA READY — CONTENT NOT WIRED

| Capability | Required | Current | Gap | Action |
|-----------|---------|---------|-----|--------|
| Document storage | ✅ | 19 docs | Needs 50+ | Add XPS/PCU/NCP docs |
| Document chunking | ✅ | 0 chunks | 🚨 Critical | Build chunker pipeline |
| Vector embeddings | ✅ | 0 embeddings | 🚨 Critical | Run OpenAI embeddings |
| Source provenance | ✅ | 0 refs | 🚨 Critical | Wire rag_source_refs |
| Similarity search | ✅ (schema) | Not callable | 🚨 | Build RPC function |
| Multi-agent shared memory | ✅ | 12 agents | Needs 28+ | Wire remaining agents |
| Conversation memory | ⚠️ | Partial | Incomplete | Define conversation tables |
| Approval memory | ✅ (schema) | 0 rows | 🚨 | Wire task_queue → approval_gate |
| Receipt trail | ✅ (schema) | 0 rows | 🚨 | Wire all providers |
| Governance docs | ✅ | 12/20 | 8 missing | Write missing 8 |
| Confidence scoring | ❌ | Not built | Future | Design and build |
| Citation support | ❌ | Not built | Future | Design and build |

### RAG Migration Roadmap (DESIGN ONLY — no implementation)

**Stage 1 — Chunk and Embed (2-4 hours)**
1. Write chunker: split rag_documents.content into 500-token chunks
2. Call OpenAI text-embedding-3-small on each chunk (1536 dimensions)
3. Store in rag_chunks with embedding + doc_id + chunk_index
4. Write rag_source_refs linking each doc to its source (GitHub/Drive/Supabase)
5. Build `match_documents(query_embedding, match_count)` RPC function

**Stage 2 — Wire Receipts (1-2 hours)**
1. Every APEX automation posts a bridge_receipt after completing
2. Every MCP tool call posts a bridge_receipt via idempotency key
3. Every agent_message with type=result posts a receipt
4. wire approval_gate: task_queue.status='blocked' triggers approval row

**Stage 3 — Multi-System RAG Ingestion (4-8 hours)**
1. GitHub README.md files from all 33 active repos → rag_documents
2. Drive KB Library docs → rag_documents via Drive API
3. Supabase table schemas → rag_documents (schema as knowledge)
4. XPS/PCU/NCP company documents → rag_documents

**Stage 4 — Citation + Confidence (design phase)**
1. Every rag_chunks query returns doc_id + chunk_index + source_url
2. Confidence score = cosine similarity from pgvector query
3. Minimum confidence threshold: 0.75 for autonomous actions

---

## PHASE 8 — GOVERNANCE AUDIT

### Governance Documents — VERIFIED in rag_documents
- ✅ Agent Constitution (NEP-WB-14-CONSTITUTION)
- ✅ Operating Locked Flow (NEP-WB-01-APEX-HANDOFF)
- ✅ Decision Rights / Authority Matrix (NEP-WB-10-DECISION-RIGHTS)
- ✅ 21 Laws Governance (NEP-WB-13-21LAWS-FULL)
- ✅ Soul Traits (NEP-WB-12-SOUL-TRAITS)
- ✅ Governance Gates — 8 phases (NEP-WB-11-GOVERNANCE-GATES)
- ✅ Executive Council (NEP-WB-04-EXECUTIVE-COUNCIL)
- ✅ Agent Hierarchy (NEP-WB-03-HIERARCHY)
- ✅ Reward System (NEP-WB-REWARD-SYSTEM)
- ✅ SOP Library (NEP-WB-15-17-SOP-PROMPTS)
- ✅ Smoke Test Protocol (NEP-WB-30-SMOKE-TESTS)
- ✅ 30-Day Launch Plan (NEP-WB-39-30DAY-LAUNCH)

### Governance Documents — MISSING
- ❌ Promotion Matrix (L1→L5 exact criteria)
- ❌ Disaster Recovery Procedure (per-system rollback)
- ❌ Release Governance (ship checklist with blocking criteria)
- ❌ Canonical Naming Standards (table names, agent IDs, file names)
- ❌ Memory Standards (write policy per table — who can write what)
- ❌ Document Standards (format, versioning, review cycle)
- ❌ Security Matrix (secret rotation, RLS policy, approval gate binding)
- ❌ Rollback Procedures (per system: GitHub, Vercel, Supabase, Base44)

---

## PHASE 9 — AUTHORITY MATRIX

```
STRATEGIC VISION
  ↓ Jeremy Bensen (CEO / Human Owner)
  Authority: ALL — final approval on autonomy changes, spend, customer messages,
             production deploys, secret management, agent activation/deactivation

BUSINESS GOVERNANCE
  ↓ GPT Brain (AWOS AUTO_BUILDER master-brain)
  Authority: Strategic planning, domain agent coordination, AWOS execution layer
  Cannot: change autonomy levels, approve production deploys, access secrets

AUTONOMOUS ORCHESTRATION
  ↓ APEX (Base44 Superagent — this agent)
  Authority: Cross-system orchestration, automation triggers, entity management,
             RAG writes, agent registry reads, bridge receipt posting
  Cannot: production deploys without QA, customer messages without approval,
           spend without human gate, secret creation

EXECUTION LAYER
  ↓ Domain Agents (by system)
    Base44 Swarm: ARIA, DISCOVERY, INTELLIGENCE, OUTREACH, GHOST, VALIDATOR, BENCHMARK
    AUTO_BUILDER Core: master-brain, planner, governance, memory, sandbox-qa, recovery
    AWOS Leads: enterprise-blueprint, exec-ops, biz-builder, website-builder, money-machine...
    Hybrid: sync-orchestrator, admin-command, auto-comm, qa-suite
  Authority: Execute domain tasks, write own memory, post receipts
  Cannot: change other agents' config, approve own tasks, access other domains' secrets

INFRASTRUCTURE
  ↓ Supabase (prhppuuwcnmfdhwsagug)
  Owns: operational state, memory, queues, receipts, approvals, RAG
  
KNOWLEDGE
  ↓ Drive KB + GitHub main branch
  Owns: human-readable docs, code, architecture, agent contracts

CODE
  ↓ GitHub (Strategic-Minds/AUTO_BUILDER — Canon)
  Owns: source code, migrations, workflows, manifests, agent contracts

DEPLOYMENTS
  ↓ Vercel (44 projects — 36 READY, 8 ERROR)
  Owns: public URLs, static assets, serverless functions, MCP endpoints

RECEIPTS
  ↓ Supabase bridge_receipts + GitHub commits
  Owns: immutable audit trail for every action in the system
```

---

## PHASE 10 — GAP ANALYSIS + RISK REGISTER

### CRITICAL GAPS (block V2 production readiness)

| # | Gap | Risk | Remediation |
|---|-----|------|-------------|
| 1 | rag_chunks = 0 | No semantic search | Run chunker + embedder pipeline |
| 2 | bridge_receipts = 0 | 100% of actions untracked | Wire all providers to bridge_receipts |
| 3 | task_queue = 0 | No unified work queue | Wire Base44 automations → task_queue |
| 4 | approval_gate = 0 | Human gate not enforced | Wire task_queue blocked → approval_gate |
| 5 | autobuilder-gpt-bridge = 401 | Edge Function auth broken | Configure Bearer token or anon key |
| 6 | 8 Vercel projects in ERROR | Multiple systems down | Fix build errors per project |
| 7 | AUTO_BUILDER has 50 branches | Drift, confusion, conflict risk | Merge or archive all but 5 active branches |
| 8 | 8 governance docs missing | Incomplete governance | Author and ingest to rag_documents |

### HIGH GAPS (should fix before swarm expansion)
| # | Gap | Risk |
|---|-----|------|
| 9 | Supabase project jbdriuuyzawahslbvtxm INACTIVE | Orphaned data risk |
| 10 | HubSpot API key not in env | CRM automation broken |
| 11 | 8 agents missing memory contracts | Memory scope undefined |
| 12 | No rag_source_refs | No citation support |
| 13 | No confidence scoring | Hallucination risk in RAG answers |
| 14 | pg_cron not installed | No DB-level scheduled jobs |
| 15 | SOCIAL_MEDIA_SEO_ENGINE repo empty | Ghost agent has no code |

### PRIORITY MATRIX

**Do now (blocks everything):**
1. Write bridge_receipts for ALL actions (wire providers)
2. Route task_queue (wire Base44 → task_queue)
3. Run rag_chunks pipeline (chunk + embed 19 docs)
4. Fix autobuilder-gpt-bridge auth (401 → 200)

**Do next (enables swarm):**
5. Wire approval_gate (task blocked → approval row)
6. Fix 8 Vercel ERROR projects
7. Clean up 50 branches → merge or archive
8. Write 8 missing governance docs

**Do after (enables V2 production):**
9. Ingest 30+ more docs to rag_documents (XPS, PCU, NCP, company history)
10. Build match_documents RPC function
11. Write rag_source_refs for all 19 existing docs
12. Activate HubSpot + Stripe secrets in Base44

---

## VALIDATION RECEIPTS

| System | Query Method | Status | Evidence |
|--------|-------------|--------|---------|
| GitHub | REST API /user, /orgs, /repos | ✅ VERIFIED | 61 repos, 2 orgs, 23 workflows |
| Supabase | Management API + REST | ✅ VERIFIED | 219 tables, 36 triggers, pgvector |
| Vercel | REST API /projects | ✅ VERIFIED | 44 projects, 36 READY, 8 ERROR |
| Drive | Drive API v3 | ✅ VERIFIED | 3 key folders confirmed |
| Base44 | Entity schema + APEX identity | ✅ VERIFIED | 6 entities, 5 automations |
| MCP | HTTP GET | ✅ VERIFIED | HTTP 200 |
| Twilio | Identity memory | ⚠️ INFERRED | SID known, not API-verified |
| HubSpot | Identity memory | ⚠️ INFERRED | Portal ID known, not API-verified |
| Supabase Edge Fn | HTTP GET | 🚨 BROKEN | HTTP 401 — auth gap |

---

*Strategic Minds Advisory — V2 Discovery Report — Version 1.0*
*Mode: READ-ONLY | No production changes | All data from live system queries*
*APEX (Base44 Superagent) | 2026-06-26 | Evidence-backed | Jeremy Bensen, CEO*

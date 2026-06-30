# AUTOBUILDER OS — EXHAUSTIVE END-TO-END SYSTEM SPECIFICATION
## Version: 2.0 | Date: 2026-06-30T03:01:02Z | Author: APEX + Jeremy Bensen
## Operator: jeremy@autobuilderos.com | AI Identity: ai@autobuilderos.com
## GitHub: Strategic-Minds/AUTO_BUILDER | Supabase: prhppuuwcnmfdhwsagug

---

# SECTION 0 — EXECUTIVE SUMMARY

AutoBuilder OS is a fully autonomous, multi-agent business factory that:
1. Accepts a client intake → runs discovery, benchmark, strategy, brand, website packs
2. Gets operator approval → builds the deliverable → QA → delivers → archives
3. Runs 24/7 via Vercel crons, Supabase event triggers, and Slack command handlers
4. Every agent communicates through a governed command bus (not fire-and-forget)
5. Jeremy only needs to approve gates — agents do everything else

Primary use case today: Build nationalepoxypros.com, then replicate to 70 cities.
Secondary: Sell the AutoBuilder OS to other businesses as a product.

---

# SECTION 1 — SYSTEM ARCHITECTURE

## 1.1 The Stack

| Layer              | Technology                                      | Purpose                              |
|--------------------|-------------------------------------------------|--------------------------------------|
| Frontend UI        | Next.js 14 App Router + TypeScript + Tailwind   | Dashboard, PWA, client portal        |
| Backend API        | Next.js API Routes (src/app/api/)               | Control plane, crons, webhooks       |
| Database           | Supabase (PostgreSQL + pgvector + RLS)          | All persistent state                 |
| File Storage       | Google Drive (9-folder taxonomy per entity)     | Source of truth for all docs/assets  |
| Code Hosting       | GitHub (Strategic-Minds org)                    | Version control, CI/CD               |
| Deployment         | Vercel (preview + production)                   | Hosting, crons, edge functions       |
| Agent Orchestration| Base44 Apex (this agent)                        | Governor of all autonomous actions   |
| AI Models          | OpenAI GPT-4o (via CODEX_API_KEY)               | Text generation, analysis            |
| Agent 2            | Business Builder GPT (agtch_6a3f77...)          | Website builds, content generation   |
| Comms              | Slack (XPS INTELLIGENCE SYSTEM workspace)       | Human ↔ agent command interface      |
| Email              | ai@autobuilderos.com (Google Workspace)         | Unified AI identity for all agents   |
| Outreach           | Twilio (WA +15559730487 / SMS +15616780328)     | WhatsApp + SMS (DRY RUN until LLC)   |
| Automation         | Vercel Crons (19 routes) + Base44 Automations   | Scheduled + event-driven tasks       |
| MCP                | AUTO_BUILDER MCP (4 servers, 66 namespaces)     | Tool bridge between agents           |
| Intelligence       | Supabase pgvector + Google Drive KB             | RAG + knowledge base                 |
| CRM                | HubSpot (Portal 245655125)                      | Lead + deal tracking                 |

## 1.2 Primary Repos

| Repo                                  | Purpose                                      | Status      |
|---------------------------------------|----------------------------------------------|-------------|
| Strategic-Minds/AUTO_BUILDER          | Master OS kernel, MCP, dashboard, crons      | ✅ ACTIVE   |
| Strategic-Minds/BUSINESS-BUILDER      | Client delivery pipeline                     | ✅ ACTIVE   |
| Strategic-Minds/xps-website-factory   | XPS/NEP city site factory                    | ✅ ACTIVE   |
| Strategic-Minds/XPSWEBSITES           | Clean NEP site build target                  | ✅ ACTIVE   |
| Strategic-Minds/phoenix-epoxy-pros    | Phoenix city site (first market)             | ✅ LIVE      |

## 1.3 Vercel Projects

| Project                              | ID                              | URL                                              |
|--------------------------------------|---------------------------------|--------------------------------------------------|
| auto-builder                         | prj_qaUnGOL4MmPvm11Hqxp9Cn0YDfmv | auto-builder-strategic-minds-advisory.vercel.app |
| strategic-minds-ai-business-factory  | prj_TxdP2Le8Moy4xGNhW6mZkLLAOYNV | strategic-minds-ai-business-factory.vercel.app   |
| xps-website-factory                  | (active)                        | xps-website-factory.vercel.app                   |
| phoenix-epoxy-pros-site              | (active)                        | phoenix-epoxy-pros-site.vercel.app               |
| national-epoxy-pros                  | (target — build needed)         | nationalepoxypros.com                            |

---

# SECTION 2 — SUPABASE DATABASE SCHEMA (COMPLETE)

## 2.1 APEX Communication Bridge Tables (NEW — 2026-06-29)

### agent_commands
Primary inbound queue. ChatGPT or any agent writes here. APEX reads and claims.
```sql
command_id      TEXT UNIQUE  -- CMD-YYYYMMDD-XXXXXX
thread_id       TEXT         -- THREAD-YYYYMMDD-XXXXXX
from_agent      TEXT         -- ChatGPT | APEX | AUTO_BUILDER_MCP
to_agent        TEXT         -- APEX | GHOST | VALIDATOR
source          TEXT         -- AUTO_BUILDER_MCP | system | whatsapp
identity_email  TEXT         -- ai@autobuilderos.com (always)
project         TEXT         -- National Epoxy Pros | Strategic Minds | etc
priority        TEXT         -- critical | high | normal | low
command_type    TEXT         -- build | validate | research | deploy | audit | scaffold | read
task            TEXT         -- Clear human-readable instruction
context         TEXT         -- Full context block
approval_required BOOLEAN    -- true = escalates to #operator-approval
allowed_actions TEXT[]       -- read, audit, draft, scaffold, dry_run, validate
blocked_actions TEXT[]       -- production, secrets, payments, destructive_actions, dns
status          TEXT         -- queued | in_progress | completed | blocked | failed
claimed_by      TEXT         -- APEX (set when claiming)
```

### agent_receipts
Every completed command writes a receipt here. GPTs poll this.
```sql
receipt_id      TEXT UNIQUE  -- RCT-YYYYMMDD-XXXXXX
command_id      TEXT         -- FK → agent_commands.command_id
thread_id       TEXT
from_agent      TEXT         -- APEX (writer)
to_agent        TEXT         -- ChatGPT | operator
status          TEXT         -- completed | blocked | failed | needs_approval
summary         TEXT         -- Human-readable outcome
verified        TEXT[]       -- List of verified facts
inferred        TEXT[]       -- List of inferred conclusions
could_not_verify TEXT[]      -- List of unverifiable items
blockers        TEXT[]       -- What is blocking (if any)
next_actions    TEXT[]       -- What should happen next
artifact_urls   TEXT[]       -- GitHub URLs, Vercel URLs, Drive URLs
score           INT          -- 0-100 QA score
```

### agent_threads
Conversation context. One thread per project/session.
```sql
thread_id       TEXT UNIQUE  -- THREAD-YYYYMMDD-XXXXXX
project         TEXT
title           TEXT
participants    TEXT[]       -- APEX, ChatGPT, ai@autobuilderos.com
status          TEXT         -- active | paused | completed | archived
message_count   INT
slack_thread_ts TEXT         -- Slack thread timestamp for replies
```

### agent_messages
All inter-agent communications.
```sql
message_id      TEXT UNIQUE  -- MSG-YYYYMMDD-XXXXXX
thread_id       TEXT
from_agent      TEXT
to_agent        TEXT
identity_email  TEXT         -- ai@autobuilderos.com
project         TEXT
message_type    TEXT         -- command | receipt | status | escalation | heartbeat
content         TEXT
status          TEXT         -- queued | processing | completed | failed
priority        TEXT
source          TEXT
```

### agent_escalations
Anything blocked goes here → posts to #operator-approval → Jeremy resolves.
```sql
escalation_id   TEXT UNIQUE  -- ESC-YYYYMMDD-XXXXXX
command_id      TEXT
from_agent      TEXT
to_operator     TEXT         -- jeremy@autobuilderos.com
reason          TEXT         -- Why it was escalated
blocked_action  TEXT         -- What was attempted
status          TEXT         -- open | acknowledged | resolved | dismissed
priority        TEXT
slack_posted    BOOLEAN
email_sent      BOOLEAN
```

### agent_email_inbox
ai@autobuilderos.com inbound/outbound log.
```sql
email_id        TEXT UNIQUE
direction       TEXT         -- inbound | outbound
from_address    TEXT
to_address      TEXT         -- ai@autobuilderos.com
subject         TEXT
body            TEXT
parsed_command  JSONB        -- Structured command if parseable
linked_command_id TEXT
status          TEXT         -- received | parsed | processed | replied | archived
slack_notified  BOOLEAN
task_created    BOOLEAN
```

### agent_slack_events
Every Slack post by any agent is logged here.
```sql
event_id        TEXT UNIQUE
channel_id      TEXT         -- C0BE3JH2RFT etc
channel_name    TEXT
direction       TEXT         -- inbound | outbound
message_type    TEXT
content         TEXT
linked_command_id TEXT
posted_by       TEXT
identity_email  TEXT
status          TEXT
```

### agent_status | agent_permissions | agent_memory_events
(See schema in supabase/migrations/20260629_strategy_folder_schema.sql)

## 2.2 Factory Tables (pre-existing)

factory_clients | factory_project_queue | factory_project_gates | factory_gate_approvals
factory_intake_answers | factory_brand_options | factory_website_pack_options
factory_template_choices | factory_quality_scores | factory_quality_findings
factory_repair_jobs | factory_seo_tasks | factory_blog_queue | factory_social_queue
factory_payment_requests | factory_payment_events | factory_calendar_events
factory_handoff_packets | factory_whatsapp_messages | factory_receipts

## 2.3 MCP System Tables (pre-existing)

mcp_servers | mcp_namespaces | mcp_tools | mcp_tool_schemas | mcp_tool_runs
mcp_permissions | mcp_credentials_registry | mcp_provider_registry
mcp_capability_registry | mcp_webhook_events | mcp_cron_jobs | mcp_deadletters
mcp_receipts | mcp_audit_log | mcp_rollback_packets

## 2.4 Swarm Intelligence Tables (pre-existing)

agent_registry | agent_messages (legacy) | agent_templates | agent_instances
swarm_tasks | intelligence_sources | intelligence_items | memory_events
drive_destinations | ingestion_runs | license_accounts

## 2.5 WhatsApp / Master OS Tables (pre-existing)

master_os_sessions | wa_message_threads | wa_message_events | wa_senders
wa_templates | wa_consent_ledger | wa_human_escalations

**TOTAL TABLES: ~65+ | All RLS enabled**

---

# SECTION 3 — SLACK CHANNELS (COMPLETE)

## 3.1 Original Swarm Channels (C0BEMGNCX4G etc)

| Channel          | ID              | Purpose                                    |
|------------------|-----------------|--------------------------------------------|
| #apex-ops        | C0BEMGNCX4G     | Master command — morning briefing          |
| #apex-leads      | C0BDWT9PK0U     | PCU pipeline + new leads                   |
| #apex-builds     | C0BDV3Z0F9P     | NEP + Vercel build events                  |
| #apex-intel      | C0BDLTRE3D1     | AIE intelligence drops                     |
| #apex-approvals  | C0BDT8DSA2W     | ORIGINAL Jeremy approval gate              |
| #apex-alerts     | C0BDR5TEN3G     | Failures + blockers                        |
| #apex-revenue    | C0BDPS7QKFX     | Evening P&L report                         |

## 3.2 Communication Bridge Channels (NEW — 2026-06-29)

| Channel                | ID              | Purpose                                    |
|------------------------|-----------------|--------------------------------------------|
| #apex-command-center   | C0BE3JH2RFT     | ChatGPT → APEX command routing             |
| #autobuilder-ops       | C0BDVCX4WEP     | AUTO_BUILDER deploys + MCP events          |
| #national-epoxy-pros   | C0BE1NVKK98     | NEP project — builds, leads, QA            |
| #agent-receipts        | C0BE3JH6KBK     | All agent receipts                         |
| #operator-approval     | C0BE3JGDT1P     | Jeremy gates (new, bridge-specific)        |
| #system-alerts         | C0BE1NVHHD0     | Critical errors + circuit breakers         |
| #ai-email-router       | C0BDZL6B13Q     | ai@ email routing log                      |

## 3.3 Routing Rules

```
Commands     → #apex-command-center
Receipts     → #agent-receipts
Approvals    → #operator-approval (bridge) OR #apex-approvals (original)
Errors       → #system-alerts (bridge) OR #apex-alerts (original)
NEP work     → #national-epoxy-pros
Builds       → #apex-builds OR #autobuilder-ops
Revenue      → #apex-revenue
```

---

# SECTION 4 — AGENT ROSTER + RESPONSIBILITIES

## APEX (Base44 Governor)
- Role: Orchestrator, gatekeeper, executor
- Identity: ai@autobuilderos.com
- Tools: All Base44 tools + Supabase + GitHub + Vercel + Slack + Google Drive
- Input: Jeremy commands (WhatsApp/Base44 chat) + ChatGPT commands (agent_commands) + automations
- Output: TaskLog entries + agent_receipts + Slack posts + GitHub commits
- Mode: dry_run by default. Production requires Jeremy GO.

## ChatGPT / Business Builder GPT
- ID: agtch_6a3f77423aa0819182efa2e9552b8022
- Trigger: POST https://api.chatgpt.com/v1/workspace_agents/agtch_6a3f77.../trigger
- Auth: CODEX_API_KEY (at- prefix)
- Role: Website builds, content generation, brand packs, consultation packs
- Communicates with APEX via: agent_commands table → agent_receipts
- Output: GitHub branches, Vercel previews, Drive docs

## AUTO_BUILDER MCP
- URL: https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp
- Servers: auto_builder_mcp | strategic_minds_universal_ops_mcp | xps_website_factory_mcp | mcp_gateway_router
- Namespaces: 66 (45 ops.* + 21 xps.*)
- Role: Tool bridge. Any agent can call MCP tools to read/write Supabase, GitHub, Vercel
- Auth: SUPABASE_SERVICE_ROLE_KEY + GITHUB_TOKEN + VERCEL_TOKEN

## GHOST (SEO Agent)
- Role: SEO optimization, city page generation, competitor monitoring
- Input: Commands from APEX via agent_commands
- Output: SEO reports, optimized content, schema markup, sitemap updates

## VALIDATOR (QA Agent)
- Role: 5-stage QA pass on all builds
- Stages: Code Quality → Visual/UX → Performance → Security → Acceptance
- Output: QA score (0-100), repair jobs in factory_repair_jobs, agent_receipts

---

# SECTION 5 — BASE44 ENTITIES (COMPLETE)

## Existing Entities
- TaskLog — All tasks APEX executes (TASK-YYYYMMDD-NNN format)
- CommandLog — Raw commands received from Jeremy
- Project — All client projects (SMA-2026-NNN format)
- SystemStatus — System health per integration
- CloneJob — Competitor clone operations
- OutreachQueue — PCU + lead outreach (DRY RUN)

## New Communication Bridge Entities
- AgentMessage — message_id, thread_id, from_agent, to_agent, identity_email, project, message_type, content, status, priority, source, metadata
- AgentCommand — command_id, thread_id, from/to agent, command_type, task, context, approval_required, status, claimed_by
- AgentReceipt — receipt_id, command_id, from/to agent, status, summary, verified, blockers, next_actions, artifact_urls, score
- AgentThread — thread_id, project, title, participants, status, message_count, slack_thread_ts, slack_channel
- AgentEscalation — escalation_id, command_id, from_agent, to_operator, reason, blocked_action, resolution, status, priority

---

# SECTION 6 — APEX COMMUNICATION BRIDGE (THE COMMAND BUS)

## 6.1 Full Flow

```
1. ChatGPT writes to:     Supabase → agent_commands (status=queued)
2. APEX polls:            agent_commands WHERE status='queued' AND to_agent='APEX'
3. APEX claims:           UPDATE agent_commands SET status='in_progress', claimed_by='APEX'
4. APEX posts to Slack:   #apex-command-center "APEX received CMD-XXX: [task]"
5. APEX executes:         Based on command_type (build/validate/scaffold/audit/read)
6. APEX writes receipt:   agent_receipts (status=completed|blocked|needs_approval)
7. APEX updates command:  agent_commands SET status='completed'
8. APEX posts receipt:    #agent-receipts "RECEIPT RCT-XXX: [summary]"
9. GPT reads:             agent_receipts WHERE command_id='CMD-XXX'
10. GPT continues:        Based on receipt status/next_actions
```

## 6.2 Command Object Format

```json
{
  "command_id": "CMD-YYYYMMDD-XXXXXX",
  "thread_id": "THREAD-YYYYMMDD-XXXXXX",
  "from_agent": "ChatGPT",
  "to_agent": "APEX",
  "source": "AUTO_BUILDER_MCP",
  "identity_email": "ai@autobuilderos.com",
  "project": "National Epoxy Pros",
  "priority": "high",
  "command_type": "build",
  "task": "Build the nationalepoxypros.com homepage based on the approved mockup",
  "context": "Mockup approved. Repo: Strategic-Minds/XPSWEBSITES. Branch: feat/nep-homepage.",
  "approval_required": false,
  "allowed_actions": ["read","scaffold","validate","dry_run"],
  "blocked_actions": ["production","secrets","payments","dns","spend"],
  "status": "queued"
}
```

## 6.3 Receipt Object Format

```json
{
  "receipt_id": "RCT-YYYYMMDD-XXXXXX",
  "command_id": "CMD-YYYYMMDD-XXXXXX",
  "from_agent": "APEX",
  "to_agent": "ChatGPT",
  "status": "completed",
  "summary": "NEP homepage built on feat/nep-homepage branch. Vercel preview live.",
  "verified": ["Branch created", "10 sections built", "Vercel preview READY"],
  "blockers": [],
  "next_actions": ["Jeremy approves PR", "Merge to main", "DNS cutover"],
  "artifact_urls": ["https://github.com/...", "https://vercel.app/..."],
  "score": 92
}
```

## 6.4 MCP Tools Available

| Tool                        | What it does                                           |
|-----------------------------|--------------------------------------------------------|
| send_apex_command           | Write command to agent_commands                        |
| create_apex_task            | Write to TaskLog                                       |
| read_apex_inbox             | Read queued commands for APEX                          |
| read_apex_task_status       | Get receipt for a command_id                           |
| post_apex_receipt           | Write receipt + update command status                  |
| post_to_slack_agent_channel | Post to any of 14 Slack channels                       |
| send_ai_email_command       | Log email to agent_email_inbox                         |
| read_agent_message_thread   | Get full thread (commands + receipts + messages)       |
| sync_agent_memory           | Write to agent_memory_events                           |
| escalate_to_operator        | Create escalation → #operator-approval                 |

---

# SECTION 7 — GOVERNANCE RULES (PERMANENT LAW)

## Always Allowed (no approval)
- Read any data
- Audit any system
- Draft documents / content
- Scaffold branches (never merge to main without approval)
- Dry run any action
- Validate / QA
- Local builds (never auto-deploy to production)
- Non-destructive tests

## Always Blocked (Jeremy GO required)
- Production deployment to live domains
- Access or commit secrets
- Capture payments / issue refunds
- Send outbound messages to customers (WhatsApp/SMS/email)
- Apply Supabase migrations to production
- Publish social content
- Change DNS records
- Create/delete Google Workspace users
- Spend money

## Escalation Path
1. APEX detects blocked action needed
2. APEX writes agent_escalations record
3. APEX posts to #operator-approval with: what's blocked, why, risk level, rollback plan
4. Jeremy says GO, BLOCKED, or MODIFY
5. APEX executes (if GO) or writes blocked receipt

---

# SECTION 8 — VERCEL CRON ROUTES (19 ACTIVE)

| Route                                        | Schedule       | Purpose                          |
|----------------------------------------------|----------------|----------------------------------|
| /api/cron/auto-builder                        | Every 5 min    | Main MCP dispatcher (dry_run)    |
| /api/cron/morning-briefing                    | 7am EST daily  | Morning status → Slack #apex-ops |
| /api/cron/evening-revenue                     | 8pm EST daily  | P&L summary → #apex-revenue      |
| /api/cron/approvals-watchdog                  | Every 2 hours  | Scan blocked tasks → #operator-approval |
| /api/cron/apex-health                         | Every 15 min   | System health check              |
| /api/cron/epoxy-competitor-queue              | Daily 2am      | Competitor intelligence crawl    |
| /api/cron/ghost-seo                           | Daily 3am      | SEO audit + keyword refresh      |
| /api/cron/lead-nurture                        | Daily 9am      | PCU alumni outreach queue        |
| /api/cron/nep-build-runner                    | On demand      | NEP site build pipeline          |
| (+ 10 more factory/intelligence crons)        |                |                                  |

---

# SECTION 9 — EMAIL ROUTING (ai@autobuilderos.com)

## Inbound Flow
```
Email arrives at ai@autobuilderos.com
→ Google Workspace receives
→ (Future: Gmail push webhook) → /api/webhooks/email-inbound
→ Creates: agent_email_inbox record (direction=inbound)
→ Parses: subject + body for commands
→ If command found: creates agent_commands record
→ Creates: agent_messages notification to APEX
→ Posts: #ai-email-router Slack notification
→ APEX processes command → writes receipt
→ Outbound reply logged as agent_email_inbox (direction=outbound)
```

## Outbound Flow
```
APEX needs to send email
→ Check: Is action allowed? (not live_messages unless Jeremy GO)
→ Log: agent_email_inbox (direction=outbound, status=staged)
→ If dry_run: log only, do not send
→ If approved: send via Gmail connector → update status=sent
→ Post: #ai-email-router event
→ Write: agent_receipt
```

---

# SECTION 10 — NATIONAL EPOXY PROS (ACTIVE PROJECT)

## Project Registry
```
Project:     National Epoxy Pros
Thread:      THREAD-20260629-NEP-001
Slack:       #national-epoxy-pros (C0BE1NVKK98)
Domain:      nationalepoxypros.com
Repo:        Strategic-Minds/XPSWEBSITES (clean build target)
Vercel:      national-epoxy-pros
Phone:       (877) 958-6408
WhatsApp:    555-600-0743 (DRY RUN)
Emails:      support@ | leads@ | sales@ | ai@autobuilderos.com
Parent:      Xtreme Polishing Systems (XPS)
Tagline:     Powered by XPS — America's #1 Epoxy Super Store
Campaign:    Epoxy Will Change Your Life
Status:      QUEUED — awaiting build GO
```

## 10-Section Homepage Spec (from approved mockup)
```
S1: HERO            — Dark bg, Porsche/garage photo, H1 white+gold, "START DIGITAL BID" CTA
S2: TRUST BAR       — 30+ Years | 70+ Locations | Millions SF | Thousands Certified Pros
S3: FLOOR SYSTEMS   — 6 cards: Flake | Metallic | Quartz | Solid Colors | Stained | Polished
S4: DIGITAL BID     — Split panel: form left (Project Type/Size/Address) + clock urgency right
S5: VISUALIZER CTA  — "SEE IT BEFORE YOU BUILD IT" + try the visualizer split panel
S6: DESIGN CENTER   — Color swatches gallery for all floor systems
S7: GALLERY         — Real Projects, Real Results — before/after photo carousel
S8: PRODUCTS        — Premium Products & Equipment + Training CTA
S9: FOOTER COLS     — System Status | Services | Floor Systems | Design Center | Company | Contact
S10: FOOTER BAR     — Copyright | Social | Privacy | Terms
```

## Design System (from mockup)
```css
--color-black:     #0A0A0A  /* near-black background */
--color-white:     #FAFAFA  /* near-white text */
--color-gold:      #F6B800  /* primary CTA + highlights */
--color-gold-dark: #D4A000  /* hover state */
--font-headline:   Condensed Heavy / Black weight
--font-body:       17px minimum, Inter or system-ui
--nav-bg:          rgba(0,0,0,0.95) with gold logo mark
--hero-overlay:    dark gradient over garage/floor photography
--cta-primary:     gold background, black text, 14px 700 weight
--cta-secondary:   outlined, gold border, gold text
```

---

# SECTION 11 — SKILLS LIBRARY (167 TOTAL)

## Wealth-Priority Order (run first for revenue)
39-financial-modeling → 05-offer-monetization → 34-sales-pipeline → 09-funnel-conversion → 35-content-commerce → 36-seo-geo → 40-partnership-ecosystem

## Mandatory Triplet on Every Task
22-human-approval-gatekeeper + 23-qa-scorecard + 25-observability-receipts

## Key Skills for Codex
- github-supabase-vercel-provisioning — Scaffold any new project
- qa-autoheal-headless-agent — 5-stage QA + auto-repair
- top3-competitive-intelligence-system — Benchmark any competitor
- consultation-pack-generator — PDF pack for any client
- customer-portal-approval-funnel — Gate all client deliverables
- pdf-professional-output-system — Generate PDF outputs
- memory-intelligence-ingestion — Ingest to Supabase + Drive

---

# SECTION 12 — CODEX HANDOFF

## What Codex Can Do Right Now (Without Jeremy)
1. Read any Supabase table via PostgREST (anon key: public read-only)
2. Write to agent_commands to send APEX a command
3. Read agent_receipts to get APEX responses
4. Create GitHub branches and commit code
5. Trigger Vercel preview deploys
6. Read Drive folder manifest for source truth
7. Post to Slack channels via MCP

## What Codex Must NOT Do
- Merge to main without Jeremy approval
- Apply Supabase migrations to production
- Send live WhatsApp/SMS/email to customers
- Capture payments
- Change DNS

## Codex Entry Points

### To send APEX a command:
```
POST https://prhppuuwcnmfdhwsagug.supabase.co/rest/v1/agent_commands
Headers:
  apikey: [SUPABASE_ANON_KEY]
  Authorization: Bearer [SUPABASE_ANON_KEY]
  Content-Type: application/json
Body: {
  "command_id": "CMD-YYYYMMDD-XXXXXX",
  "from_agent": "Codex",
  "to_agent": "APEX",
  "source": "AUTO_BUILDER_MCP",
  "identity_email": "ai@autobuilderos.com",
  "project": "National Epoxy Pros",
  "command_type": "build",
  "task": "Your instruction",
  "approval_required": false,
  "status": "queued"
}
```

### To read APEX receipts:
```
GET https://prhppuuwcnmfdhwsagud.supabase.co/rest/v1/agent_receipts?command_id=eq.CMD-XXX
Headers: apikey + Authorization
```

### To trigger Business Builder GPT:
```
POST https://api.chatgpt.com/v1/workspace_agents/agtch_6a3f77423aa0819182efa2e9552b8022/trigger
Headers: Authorization: Bearer [CODEX_API_KEY]
Body: {"input": "Your instruction"}
```

### GitHub — Create NEP branch:
```
POST https://api.github.com/repos/Strategic-Minds/XPSWEBSITES/git/refs
Headers: Authorization: Bearer [GITHUB_TOKEN]
Body: {"ref":"refs/heads/feat/nep-homepage","sha":"[MAIN_SHA]"}
```

## Codex Priority Queue (in order)

1. FIX: AUTO_BUILDER Vercel build — verify if build patches worked (BUILDING now)
2. BUILD: feat/nep-homepage branch in Strategic-Minds/XPSWEBSITES
   - 10-section homepage per Section 10 spec
   - Design system per Section 10 tokens
   - Next.js App Router + TypeScript + Tailwind
   - No fake placeholder images — use Unsplash API or gradient hero
3. VALIDATE: Run QA 5-stage pass on NEP build
4. PREVIEW: Confirm Vercel preview URL returns 200
5. REPORT: Write receipt to agent_receipts + post to #national-epoxy-pros

---

# SECTION 13 — OPEN ITEMS + GAPS (Jeremy Review)

## Needs Jeremy Action
| # | Item | Risk | Action |
|---|------|------|--------|
| 1 | WhatsApp Twilio sender activation | HIGH | Go to Twilio → Messaging → Senders → activate +15559730487 |
| 2 | Meta WABA template approval | HIGH | Submit templates in Meta Business Manager |
| 3 | Stripe live keys | HIGH | Add STRIPE_LIVE_KEY to Vercel production env |
| 4 | Gmail Send-As for sales@/leads@nationalepoxypros.com | MEDIUM | Gmail Settings → Accounts → Send mail as |
| 5 | Facebook Business Suite re-assignment | MEDIUM | Meta Business Suite → Pages → transfer |
| 6 | Google PageSpeed API key | LOW | console.cloud.google.com → PageSpeed Insights API |
| 7 | LLC registration | CRITICAL | Required before any live customer outbound |
| 8 | NEP build GO signal | HIGH | Say GO: NEP to APEX |

## Known Build Gaps (Codex + APEX to fix)
| # | Item | Fix |
|---|------|-----|
| 1 | AUTO_BUILDER Vercel build errors | Build patches applied 2026-06-29 — BUILDING now |
| 2 | NEP homepage not built yet | Awaiting GO: NEP signal |
| 3 | agent_messages Supabase schema mismatch | Legacy table has different columns — new bridge tables created |
| 4 | factory_deadletters table missing | Apply migration 0002 in xps-website-factory |
| 5 | Bridge email inbound webhook | /api/webhooks/email-inbound not yet wired to Gmail push |

---

# APPENDIX A — ENVIRONMENT VARIABLES (REFERENCE — NO VALUES)

```
# Identity
AUTO_BUILDER_OPERATOR_EMAIL = jeremy@autobuilderos.com
AUTO_BUILDER_AI_EMAIL       = ai@autobuilderos.com
AUTO_BUILDER_MODE           = dry_run
AUTO_BUILDER_REQUIRE_APPROVAL = true

# GitHub
GITHUB_TOKEN                = [set in Vercel]
GITHUB_ORG                  = Strategic-Minds

# Supabase
SUPABASE_URL                = https://prhppuuwcnmfdhwsagug.supabase.co
SUPABASE_ANON_KEY           = [set in Vercel]
SUPABASE_SERVICE_ROLE_KEY   = [set in Vercel — server only]

# Vercel
VERCEL_TOKEN                = [set in Vercel]
VERCEL_AUTO_BUILDER_PROJECT_ID = prj_qaUnGOL4MmPvm11Hqxp9Cn0YDfmv

# OpenAI / ChatGPT
CODEX_API_KEY               = [at- prefix — workspace agent token]
OPENAI_API_KEY              = [sk- prefix — platform API]
CHATGPT_AGENT_ID            = agtch_6a3f77423aa0819182efa2e9552b8022

# Slack
SLACK_BOT_TOKEN             = [xoxb- prefix]
SLACK_SIGNING_SECRET        = [set in Vercel]
SLACK_CHANNEL_APEX_OPS      = C0BEMGNCX4G
SLACK_CHANNEL_COMMAND       = C0BE3JH2RFT
SLACK_CHANNEL_RECEIPTS      = C0BE3JH6KBK
SLACK_CHANNEL_APPROVALS     = C0BE3JGDT1P
SLACK_CHANNEL_NEP           = C0BE1NVKK98
SLACK_CHANNEL_ALERTS        = C0BE1NVHHD0

# Email
AI_EMAIL_FROM               = sales@nationalepoxypros.com
AI_EMAIL_REPLY_TO           = leads@nationalepoxypros.com
AI_EMAIL_FROM_NAME          = National Epoxy Pros AI

# Twilio
TWILIO_ACCOUNT_SID          = [set]
TWILIO_AUTH_TOKEN           = [set]
TWILIO_WHATSAPP_NUMBER      = +15559730487
TWILIO_SMS_NUMBER           = +15616780328

# Google Drive
GOOGLE_DRIVE_ROOT_FOLDER_ID = 1B6qh7cxE4mftl91w5SzwaTqB2Edsv3lm
PROJECTS_DRIVE_ROOT         = 1WWqV5ejMsdH0sa7-cHlyDBeXOqU0Z_Nr

# HubSpot
HUBSPOT_PORTAL_ID           = 245655125
HUBSPOT_API_KEY             = [set]

# Outbound (DRY RUN until LLC)
OUTBOUND_MESSAGING_DRY_RUN  = true
```

---

# APPENDIX B — DRIVE FOLDER TAXONOMY

Every business entity has identical structure:
```
[Entity Drive]
├── 01_STRATEGY      — Vision, positioning, competitive intel
├── 02_OPERATIONS    — SOPs, runbooks, governance
├── 03_PROJECTS      — Client deliverables, project folders
├── 04_INTELLIGENCE  — Competitor clones, market research
├── 05_LEADS_CRM     — Lead lists, outreach sequences
├── 06_CONTENT       — Copy, images, social, blog
├── 07_FINANCE       — P&L, invoices, projections
├── 08_MEMORY        — Agent memory seeds, system state
└── 09_ARCHIVE       — Completed/deprecated items
```

Active drives:
- AUTO BUILDER OS: 0AMcYb0pLQvwIUk9PVA
- STRATEGIC MINDS:  0AMoWCk_jzUpdUk9PVA
- XPS:              0AFeSGlA9oE_iUk9PVA

---

*Spec version: 2.0 | Built by APEX | 2026-06-30T03:01:02Z*
*Next update: after NEP homepage build completes*

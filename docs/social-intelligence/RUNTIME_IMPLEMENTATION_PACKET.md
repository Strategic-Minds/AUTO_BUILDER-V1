# Social Intelligence Runtime Implementation Packet

## PHASE: DOCS / RUNTIME IMPLEMENTATION PACKET

## Purpose
Convert `docs/social-intelligence/MCP_IMPLEMENTATION_PACKET.md` into runtime-ready architecture for AUTO_BUILDER and Eden Skye Studios.

AUTO_BUILDER remains the governed autonomous factory/control-plane. Eden Skye Studios is the primary product system and source repo for the website, storefront-adjacent app surfaces, Edens Closet, admin/control plane, content workflows, and bridge APIs.

## Verified Source Alignment
- AUTO_BUILDER owns the broader governed orchestration and bridge layer.
- EDENSKYESTUDIOS is the source repo for Eden public/app/control surfaces.
- Eden already has readiness, bridge registry, stack readiness, queue-first Drive/GitHub/Vercel bridges, draft-only Xyla packet generation, and Vercel cron readiness routes.
- Social platforms remain draft channels until explicit publishing approval exists.
- Production deploys, Shopify mutations, social publishing, paid actions, Supabase production writes, destructive Drive moves, and destructive GitHub actions remain approval-gated.

## Runtime Scope
This packet addresses the previously missing implementation areas:
- Runtime code
- API routes
- MCP server handlers
- Supabase tables
- Vercel workflows
- Cron jobs
- Live integrations
- Social platform connectors
- Gmail execution layer
- Google Workspace execution layer

This packet does not execute live integrations. It defines dependency order and contracts for branch/sandbox implementation.

---

# Target Repository Split

## AUTO_BUILDER Responsibilities
- MCP tool registry and handlers.
- Universal routing and governance gates.
- Cross-system readiness.
- Vercel Workflow orchestration contracts.
- Supabase memory schema contracts.
- Social Intelligence scoring engine contracts.
- Report generation and validation contracts.
- Eden runtime bridge alignment.

## EDENSKYESTUDIOS Responsibilities
- Product-facing admin/control experience.
- Eden social intelligence dashboards.
- Edens Closet persona/faceless-page assignment UI.
- Draft-only Xyla/content packet route integration.
- Approval queue views.
- Eden-specific bridge registry updates.
- Eden-specific reports and media asset review surfaces.

---

# Proposed AUTO_BUILDER File Structure

```txt
src/social-intelligence/
  index.ts
  types.ts
  registry.ts
  governance.ts
  scoring.ts
  receipts.ts
  orchestrator.ts
  modules/
    trend-intelligence.ts
    audience-intelligence.ts
    keyword-phrase-intelligence.ts
    image-intelligence.ts
    content-intelligence.ts
    engagement-intelligence.ts
    demand-intelligence.ts
    community-intelligence.ts
    narrative-momentum.ts
    persona-performance.ts
    trust-engine.ts
    creator-competitor-intelligence.ts
    reporting-intelligence.ts
    workspace-intelligence.ts
  mcp/
    handlers.ts
    tool-contracts.ts
    schemas.ts
  workflows/
    five-minute-signal-cycle.ts
    report-cycle.ts
    readiness-cycle.ts
  integrations/
    social-connectors.ts
    gmail-layer.ts
    google-workspace-layer.ts
    drive-media-layer.ts
  validation/
    smoke-tests.ts
    mock-data.ts

src/app/api/social-intelligence/readiness/route.ts
src/app/api/social-intelligence/run-cycle/route.ts
src/app/api/social-intelligence/opportunities/route.ts
src/app/api/social-intelligence/reports/route.ts
src/app/api/social-intelligence/approval-queue/route.ts
src/app/api/cron/social-intelligence-cycle/route.ts
src/app/api/cron/social-report-cycle/route.ts
src/app/api/cron/social-readiness-cycle/route.ts
```

---

# Proposed EDENSKYESTUDIOS File Structure

```txt
src/app/admin/social-intelligence/page.tsx
src/app/admin/social-intelligence/opportunities/page.tsx
src/app/admin/social-intelligence/reports/page.tsx
src/app/admin/social-intelligence/approval-queue/page.tsx
src/app/api/eden/social-intelligence/readiness/route.ts
src/app/api/eden/social-intelligence/sync/route.ts
src/app/api/eden/social-intelligence/report/route.ts
src/app/api/eden/social-intelligence/approval-queue/route.ts
lib/eden/social-intelligence/types.ts
lib/eden/social-intelligence/client.ts
lib/eden/social-intelligence/registry.ts
```

---

# TypeScript Interfaces

```ts
export type EvidenceStatus = 'verified' | 'inferred' | 'could_not_verify';
export type ApprovalStatus = 'not_required' | 'queued' | 'approved' | 'rejected';
export type RiskLevel = 'low' | 'medium' | 'high' | 'blocked';

export interface EvidenceItem {
  sourceType: string;
  sourceUrl?: string;
  platform?: string;
  collectedAt: string;
  excerpt?: string;
  status: EvidenceStatus;
  confidence: number;
}

export interface SocialSignal {
  id: string;
  platform: string;
  signalType: string;
  keyword?: string;
  phrase?: string;
  mediaUrl?: string;
  sourceUrl?: string;
  rawExcerpt?: string;
  collectedAt: string;
  freshnessScore: number;
  confidenceScore: number;
  riskFlags: string[];
  evidence: EvidenceItem[];
}

export interface Opportunity {
  id: string;
  sourceType: string;
  sourcePlatform: string;
  detectedAt: string;
  trendScore: number;
  velocityScore: number;
  audienceMatchScore: number;
  competitionScore: number;
  authorityScore: number;
  conversionScore: number;
  trustScore: number;
  riskScore: number;
  opportunityScore: number;
  recommendedPersonaIds: string[];
  recommendedFacelessPageIds: string[];
  recommendedPlatforms: string[];
  recommendedFormats: string[];
  evidence: EvidenceItem[];
  approvalRequired: boolean;
}

export interface PersonaPerformance {
  personaId: string;
  periodStart: string;
  periodEnd: string;
  followerGrowth: number;
  followerQualityScore: number;
  engagementQualityScore: number;
  conversionQualityScore: number;
  repeatViewerScore: number;
  personaRoiScore: number;
}

export interface SocialReport {
  id: string;
  reportType: string;
  generatedAt: string;
  findings: string[];
  recommendations: string[];
  verified: string[];
  inferred: string[];
  couldNotVerify: string[];
  confidenceScore: number;
  validationStatus: string;
  nextActions: string[];
}
```

---

# MCP Handler Contracts

Each handler must accept:

```ts
interface McpToolRequest<TInput> {
  toolName: string;
  mode: 'dry_run' | 'read' | 'queue' | 'write' | 'execute';
  operatorId: string;
  approvalPhrase?: string;
  input: TInput;
}
```

Each handler must return:

```ts
interface McpToolResponse<TOutput> {
  ok: boolean;
  mode: string;
  output?: TOutput;
  receipt: RuntimeReceipt;
  blockers: string[];
  nextActions: string[];
}
```

Required handler groups:
- Growth Orchestrator handlers
- Trend Intelligence handlers
- Audience Intelligence handlers
- Keyword/Phrase Intelligence handlers
- Image Intelligence handlers
- Demand Intelligence handlers
- Community Intelligence handlers
- Narrative Momentum handlers
- Persona Performance handlers
- Trust Engine handlers
- Reporting handlers
- Workspace/Gmail/Drive handlers

---

# API Route Contracts

## GET `/api/social-intelligence/readiness`
Returns module readiness, connector status, approval gates, missing envs, and blocked capabilities.

## POST `/api/social-intelligence/run-cycle`
Runs dry-run or queue-only Growth Orchestrator cycle. Write/execute modes require approval.

## GET `/api/social-intelligence/opportunities`
Returns ranked opportunities with evidence status and persona routing.

## POST `/api/social-intelligence/reports`
Generates draft executive, trend, audience, content, competitor, or validation report.

## GET `/api/social-intelligence/approval-queue`
Lists queued actions requiring operator approval.

## POST `/api/social-intelligence/approval-queue`
Queues or updates approval state. Does not execute external action unless approval phrase and execution gate are valid.

---

# Supabase Schema Contract

```sql
create table if not exists social_signals (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  signal_type text not null,
  keyword text,
  phrase text,
  media_url text,
  source_url text,
  raw_excerpt text,
  collected_at timestamptz not null default now(),
  freshness_score numeric default 0,
  confidence_score numeric default 0,
  risk_flags jsonb default '[]'::jsonb,
  evidence jsonb default '[]'::jsonb
);

create table if not exists social_opportunities (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_platform text,
  detected_at timestamptz not null default now(),
  trend_score numeric default 0,
  velocity_score numeric default 0,
  audience_match_score numeric default 0,
  competition_score numeric default 0,
  authority_score numeric default 0,
  conversion_score numeric default 0,
  trust_score numeric default 0,
  risk_score numeric default 0,
  opportunity_score numeric default 0,
  recommended_persona_ids jsonb default '[]'::jsonb,
  recommended_faceless_page_ids jsonb default '[]'::jsonb,
  recommended_platforms jsonb default '[]'::jsonb,
  recommended_formats jsonb default '[]'::jsonb,
  evidence jsonb default '[]'::jsonb,
  approval_required boolean default false
);

create table if not exists social_memory (
  id uuid primary key default gen_random_uuid(),
  memory_type text not null,
  entity_key text,
  source text,
  status text check (status in ('verified','inferred','could_not_verify')) default 'inferred',
  confidence numeric default 0,
  payload jsonb default '{}'::jsonb,
  linked_receipt_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists persona_performance (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  follower_growth numeric default 0,
  follower_quality_score numeric default 0,
  engagement_quality_score numeric default 0,
  conversion_quality_score numeric default 0,
  repeat_viewer_score numeric default 0,
  persona_roi_score numeric default 0,
  payload jsonb default '{}'::jsonb
);

create table if not exists social_reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  generated_at timestamptz not null default now(),
  findings jsonb default '[]'::jsonb,
  recommendations jsonb default '[]'::jsonb,
  verified jsonb default '[]'::jsonb,
  inferred jsonb default '[]'::jsonb,
  could_not_verify jsonb default '[]'::jsonb,
  confidence_score numeric default 0,
  validation_status text default 'draft',
  next_actions jsonb default '[]'::jsonb
);

create table if not exists social_approval_queue (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  target_platform text,
  target_account text,
  payload jsonb default '{}'::jsonb,
  risk_level text default 'medium',
  approval_status text default 'queued',
  approval_phrase_required text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  executed_at timestamptz
);
```

Production migration remains locked until approved.

---

# Vercel Workflow Contracts

## Workflow: Social Signal Cycle
Schedule: every 5 minutes.
Mode: read-only / dry-run / receipt-only by default.

Steps:
1. Check readiness.
2. Collect approved public/user-owned signals.
3. Normalize signals.
4. Score opportunity.
5. Route to persona/faceless page.
6. Store memory if persistence approved.
7. Generate receipt.
8. Queue recommendations.

## Workflow: Social Report Cycle
Schedule: hourly or daily by operator config.
Steps:
1. Read latest signals and opportunities.
2. Generate executive report.
3. Validate evidence.
4. Write report draft to repo, Drive, or Supabase when approved.

## Workflow: Social Readiness Cycle
Schedule: every 5 minutes.
Steps:
1. Check required env vars.
2. Check connector readiness.
3. Check approval gate health.
4. Confirm blocked live actions remain blocked.
5. Emit receipt.

---

# Cron Contracts

```json
{
  "crons": [
    {
      "path": "/api/cron/social-intelligence-cycle",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/social-readiness-cycle",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Report cron should start disabled or draft-only until operator cadence is approved.

---

# Live Integration Plan

## Social Platform Connectors
Phase 1: draft-only and analytics-import only.
Phase 2: approved scheduler integration.
Phase 3: approval-gated publishing.
Phase 4: approval-gated comments/replies/messages.

Allowed sources first:
- user-owned analytics exports
- creator studio exports
- public profile pages where allowed
- official APIs
- approved third-party schedulers
- manual screenshots and evidence receipts

## Gmail Execution Layer
Phase 1:
- search
- read
- summarize
- draft reply
- label suggestions
- task extraction

Phase 2:
- approval-gated send
- approval-gated forward
- automation queue

## Google Workspace Execution Layer
Phase 1:
- Docs report drafts
- Sheets dashboards
- Drive image uploads
- Forms schema drafts

Phase 2:
- approval-gated native creation/update
- approval-gated sharing/moves

---

# Added High-Value Engines

## Demand Intelligence Layer
Detects:
- questions
- complaints
- frustrations
- desires
- aspirations
- purchasing signals

## Community Intelligence Layer
Tracks:
- Reddit
- Discord
- Facebook Groups
- YouTube comments
- industry forums

## Narrative Momentum Engine
Detects:
- narratives accelerating
- narratives decaying
- narratives polarizing
- narratives converting

## Persona Performance Engine
Scores:
- persona ROI
- follower quality
- engagement quality
- conversion quality

## Trust Engine
Tracks:
- audience trust
- comment quality
- repeat viewers
- repeat engagement

---

# Blocker Controls

## Signal Overload
Control: rank by evidence, velocity, audience match, and risk.

## Lack of Memory Persistence
Control: social_memory table and receipt-linked evidence.

## Poor Opportunity Scoring
Control: weighted formulas with confidence and risk penalties.

## Weak Feedback Loops
Control: self-reflection engine after every cycle.

## Trend Lag
Control: five-minute signal cycle and decay monitor.

## Content-First Thinking
Control: demand intelligence must run before content generation.

## Vanity Follower Optimization
Control: track trust, repeat viewers, conversion quality, and follower quality.

## Evidence Failure
Control: verified/inferred/could_not_verify is mandatory on reports and recommendations.

---

# Validation Tests

1. Readiness route returns all modules.
2. MCP handlers reject external writes without approval.
3. Dry-run orchestrator returns ranked opportunities.
4. Trend module scores mock trends.
5. Audience module extracts questions, pain points, and desires from mock comments.
6. Keyword/Phrase module clusters mock terms.
7. Image module parses mock metadata and returns quality score.
8. Demand module extracts questions and buying signals.
9. Community module produces draft opportunities without posting.
10. Narrative module detects accelerate/decay labels.
11. Persona Performance computes ROI score from mock metrics.
12. Trust Engine computes repeat engagement score.
13. Report generator separates verified, inferred, and could_not_verify.
14. Cron route emits receipt and performs no live action.
15. Approval queue blocks social publish/reply/message without approval phrase.

---

# Dependency-Ordered Rollout

## Phase 1: Contracts and Types
- Add TypeScript interfaces.
- Add module registry.
- Add scoring utilities.
- Add governance guard.

## Phase 2: Dry-Run Handlers
- Growth Orchestrator.
- Trend Intelligence.
- Audience Intelligence.
- Keyword/Phrase Intelligence.
- Image Intelligence.
- Demand/Community/Narrative/Trust modules.

## Phase 3: API Routes
- readiness
- run-cycle
- opportunities
- reports
- approval queue

## Phase 4: Persistence
- Supabase schema.
- Memory store.
- Report store.
- Approval queue store.

## Phase 5: Vercel Workflow/Cron
- social intelligence cycle
- readiness cycle
- report cycle draft mode

## Phase 6: Eden Skye Dashboard Sync
- Eden admin pages.
- Eden sync API.
- Eden capability registry update.
- Eden operating changelog update.

## Phase 7: Connector Integrations
- Social analytics import.
- Google Drive media upload.
- Docs/Sheets report generation.
- Gmail read/draft.

## Phase 8: Approval-Gated External Actions
- social publishing
- comments/replies/messages
- Gmail send/forward
- Drive sharing/move

---

# Rollback Plan

- Disable cron routes.
- Disable MCP handlers in registry.
- Set all live connectors to draft-only.
- Preserve receipts and reports.
- Revert API route commits if necessary.
- Do not drop Supabase tables unless separate destructive approval exists.

---

# Environment Checklist

AUTO_BUILDER:
- SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY for approved server-side writes only
- EDEN_RUNTIME_BRIDGE_TOKEN
- VERCEL_TOKEN
- AUTO_BUILDER_VERCEL_PROJECT_ID or VERCEL_PROJECT_ID
- GITHUB_TOKEN or GITHUB_WORKFLOW_TOKEN
- GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY when direct Drive server adapter is approved

EDENSKYESTUDIOS:
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- EDEN_RUNTIME_BRIDGE_TOKEN
- EDEN_SKYE_VERCEL_PROJECT_ID
- VERCEL_TOKEN when preview bridge is approved
- Shopify, HeyGen, and social provider tokens only when approved

---

# Acceptance Criteria

Runtime implementation is accepted only when:
- Dry-run cycle works without external writes.
- Approval gates block all live social/Gmail/Drive write actions.
- Reports include verified/inferred/could_not_verify.
- Eden dashboard can read recommendations from AUTO_BUILDER or queued sync.
- Cron emits receipts and does not post/comment/message.
- Smoke tests pass.
- Documentation and changelogs are updated.

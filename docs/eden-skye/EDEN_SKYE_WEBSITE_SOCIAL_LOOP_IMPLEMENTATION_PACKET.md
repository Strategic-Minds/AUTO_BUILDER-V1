# Eden Skye Website + Social Automation Loop Implementation Packet

## Current Status

This packet defines the next governed AUTO BUILDER implementation lane for EdenSkyeStudios.com, Eden's Closet, Black Card membership, model/faceless account operations, social draft scheduling, validation, quarantine, memory, and GPT agent operations.

The implementation is sandbox/preview-first. It does not authorize public posting, payment activation, paid generation, Drive writes, adult-content publication, subscriber messaging, or production deployment.

## Source Truth

- Drive roots: MASTER AUTO BUILDER, AUTO SOCIAL, EDEN SKYE STUDIOS.
- Production MCP manifest now exposes Drive tools and Eden loop tools.
- Metricool is the preferred social scheduling bridge when direct Meta/Instagram are not connected.
- Xyla is treated as a Shopify-operated bridge, not a separate required MCP.
- n8n is optional and parked for this phase.

## System Boundary

The system builds the operating backbone for:

- EdenSkyeStudios.com website frontend and backend.
- Model and faceless account registry surfaces.
- Eden's Closet / Black Card membership planning and draft checkout surfaces.
- Social content automation queues for draft-only scheduling.
- Metricool draft packets and analytics readiness.
- Shopify/Xyla draft packets for products, collections, metafields, and storefront/feed records.
- Full approval, quarantine, validation, self-heal, memory, and reflection loop.

## Frontend Plan

Required website surfaces:

- `/` homepage designed to feed social discovery and lead capture.
- `/models` model directory.
- `/models/[slug]` model profile pages.
- `/faceless` faceless account directory.
- `/eden-closet` premium wardrobe/storefront/member gateway.
- `/black-card` membership offer page.
- `/members/sign-in` sign-in surface.
- `/members/account` entitlement/account surface.
- `/members/age-gate` compliance-first age gate.

UX requirements:

- First viewport must clearly show Eden Skye Studios and the model/content agency value.
- Site must support social intake, model discovery, membership funnel, and content queue generation.
- Adult/premium membership areas stay locked behind age gate, account, and approval/compliance checks.
- No explicit adult content is published or exposed by default.

## Backend Plan

Required backend surfaces:

- `/api/eden-skye/loop` dry-run/readiness route.
- `/api/eden-skye/membership/draft-checkout` draft checkout route.
- `/api/eden-skye/content/queue` draft content queue route.
- `/api/eden-skye/metricool/draft` Metricool draft packet route.
- `/api/eden-skye/shopify-xyla/draft` Shopify/Xyla draft route.
- `/api/eden-skye/quarantine` failed/sensitive/incomplete asset route.
- `/api/eden-skye/validate` route validation, compliance, link, and queue validation route.

Data objects:

- models
- model_personas
- faceless_accounts
- media_assets
- asset_quarantine
- taxonomy_terms
- content_items
- publishing_queue
- engagement_queue
- membership_products
- membership_entitlements
- age_gate_receipts
- experiments
- agent_runs
- memory_entries
- receipts

## Vercel Workflow Plan

Workflow file added:

- `src/workflows/eden-skye-website-social-loop.ts`

Workflow phases:

1. Collect readiness and governance gates.
2. Plan website and backend build surfaces.
3. Plan automation queues.
4. Plan validation, quarantine, auto-heal, and recovery.
5. Return dry-run receipt and next action.

5-minute cron target:

- Validate route health.
- Check queue depth.
- Detect missing approvals.
- Move failed/incomplete items to quarantine.
- Generate next draft tasks.
- Write receipts and memory summaries.

## Agent Topology

- Eden Master Orchestrator: owns loop routing and next actions.
- Eden Website Builder: builds frontend/backend tasks and preview validation.
- Eden Social Producer: creates draft content and Metricool packets.
- Eden Media Librarian: indexes model/faceless assets, taxonomy, and Drive manifests.
- Eden Compliance Guardian: blocks unsafe adult, payment, posting, and consent-sensitive actions.
- Eden Growth Optimizer: runs A/B tests, funnel analysis, and self-reflection.

## Tool And Integration Plan

Ready or target-ready:

- Vercel Workflow and Vercel preview deploy.
- Supabase service role for server-side queue/receipt persistence.
- Google Workspace for Drive/read/write once approved.
- HeyGen for draft video generation after approval.
- AI Gateway for model routing.
- Metricool via Vercel env aliases.
- Shopify/Xyla bridge for draft storefront/feed records.

Parked or optional:

- n8n remains parked.
- Direct Meta/Instagram posting remains optional because Metricool can cover scheduling.
- Direct Xyla MCP is not required if Shopify bridge is used.

## Validation Plan

Preview validation routes:

- `/api/mcp-universe/wave-2/drive?dryRun=fullScaffold`
- `/api/eden-skye/loop`
- `/api/eden-skye/loop?dryRun=full`
- `/api/mcp/tools`
- `/api/mcp-universe/readiness`

Checks:

- `productionActionAllowed` must stay false.
- Drive full scaffold dry-run must return PASS before any write approval.
- Eden loop dry-run must show no publishing, no payment activation, no adult-content publishing, and no mutation.
- Metricool readiness must accept configured Vercel env aliases.
- Shopify/Xyla readiness must use Shopify env rather than requiring a standalone Xyla MCP.
- Supabase telemetry should write receipts where configured.

## Required Docs And Playbooks To Materialize In Drive

- Eden Skye Source of Truth
- Website Build Packet
- Backend API Map
- Supabase Schema/RLS Plan
- Model Registry
- Faceless Account Registry
- Brand System
- Eden's Closet Black Card Plan
- Membership Compliance Plan
- Age Gate and Consent Policy
- Content Calendar
- Publishing Queue
- Engagement Queue
- Metricool Draft Packet
- Shopify/Xyla Draft Packet
- Media Library Manifest
- Image/Video Prompt Taxonomy
- Quarantine Policy
- Approval Matrix
- Memory and Reflection Log
- A/B Testing Plan
- 24/7 Operating Schedule
- Agent Runbook
- Receipt Index

## Blockers Or Missing Pieces

- Full Drive write/import/upload still requires explicit approval after full scaffold dry-run.
- Live payment activation requires explicit approval and compliance review.
- Adult membership content release requires age-gating, consent, terms/privacy, processor policy review, and explicit approval.
- Public social posting, comments, replies, DMs, and paid campaigns remain approval-gated.
- Production website deployment/domain changes remain approval-gated.

## Next Best Prompt

Run production preview validation for:

- `/api/mcp-universe/wave-2/drive?dryRun=fullScaffold`
- `/api/eden-skye/loop?dryRun=full`
- `/api/mcp/tools`
- `/api/mcp-universe/readiness`

Then open review PR and request approval only for missing-only Drive writes after dry-run evidence passes.

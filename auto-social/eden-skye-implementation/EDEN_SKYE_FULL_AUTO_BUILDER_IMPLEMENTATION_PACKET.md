# Eden Skye Studios Auto Builder Implementation Index

Date: 2026-06-04
Control plane: Auto Builder
Source repo: Strategic-Minds/AUTO_BUILDER
Business repo: Strategic-Minds/EDENSKYESTUDIOS
Target: enterprise-grade autonomous AI digital modeling and content creator company

## Objective

Implement Eden Skye Studios end to end: frontend, backend, model roster, media asset factory, AI chat, visual chat, HeyGen/private video workflows, content automation, commerce, telemetry, governance, and growth loops.

This is the implementation packet for the Auto Builder factory. It turns the full business checklist into buildable lanes, cron routes, API contracts, database contracts, approval gates, and launch phases.

## Hard Truth

This system should run with maximum automation, but not uncontrolled mutation. Auto Builder is the control plane. Cron routes are triggers, not workers. Workers write receipts, route through approval gates, and retry safely.

## Document Map

1. `01_SYSTEM_BLUEPRINT.md` - enterprise architecture and system surfaces.
2. `02_BUILD_PACKETS.md` - implementation packets by lane.
3. `03_SUPABASE_SCHEMA_AND_RLS.md` - production data model and RLS requirements.
4. `04_FRONTEND_ADMIN_CONSOLE_SPEC.md` - public site and admin approval console.
5. `05_AUTONOMOUS_AGENT_AND_CRON_SPEC.md` - Vercel cron, router, queue, and AI Gateway design.
6. `06_MEDIA_ASSET_FACTORY_SPEC.md` - 56-image packs, HeyGen, video, chat, visual chat, QA.
7. `07_GROWTH_MONETIZATION_OPERATING_SYSTEM.md` - growth, followers, SEO/GEO, $2k launch plan, $1M target model.
8. `08_ENTERPRISE_READINESS_AND_GATES.md` - FAANG-grade controls, SLOs, launch gates, security.
9. `09_VERIFICATION_RECEIPTS.md` - validation and acceptance checklist.
10. `implementation-manifest.json` - machine-readable route map.

## Auto Builder Factory Order

1. executive-intake
2. self-reflection
3. discovery
4. branding
5. build-in-sandbox
6. promote-source
7. promote-frontend
8. validate
9. audit
10. improve

## Non-Negotiable Approval Gates

- No public publishing without approval.
- No production deploy without approval.
- No Shopify mutation without approval.
- No payment or discount change without approval.
- No HeyGen training/public avatar use without approval.
- No model source pack is public until approved and indexed.

---

# Eden Skye Studios Enterprise System Blueprint

## North Star

Build the leading fictional AI digital modeling and content creator agency: ultra-lifelike images, videos, avatar chat, visual chat, social growth, productized offers, licensing, and autonomous content operations.

## Core Architecture

### Control Plane

- Auto Builder factory routes
- Build packets
- Capability tests
- Reverse-engineering lanes
- Readiness route
- Cron triggers
- Validation receipts

### Source Of Truth

- GitHub for source code, manifests, contracts, schemas, docs, receipts
- Google Drive for working docs, Sheets, visual boards, asset folders
- Supabase for operational records and asset state

### Frontend

- Public website
- Model directory
- Model profile pages
- Content hub
- AI chat
- AI visual chat
- Offers/licensing/store pages
- Admin console
- Asset approval console
- Content queue
- Telemetry dashboards

### Backend

- Supabase Postgres
- Supabase Storage
- Edge/API routes
- RLS
- Queue tables
- Receipts
- Audit logs

### Media Layer

- Image generation source packs
- Runway/video generation
- HeyGen photo avatars and avatar videos
- Descript/invideo editing when needed
- Canva/Adobe Express for branded design variants

### Growth Layer

- 300-topic matrix
- SEO/GEO pages
- TikTok/Reels/Shorts/Pinterest scheduling drafts
- Weekly trend scan
- Winner cloning
- Email capture and Klaviyo lifecycle flows

### Commerce Layer

- Shopify primary store/site
- Stripe payments/revenue visibility
- Digital downloads
- Licensing products
- Membership
- AI avatar/content services

## Enterprise Principles

- Typed manifests for every asset and operation.
- Every external action writes a receipt.
- Every risky action has an approval request.
- Every asset has a model ID, role, checksum, source, approval status, and usage status.
- Automation drafts and routes; humans approve high-impact mutations.

---

# Eden Skye Studios Auto Builder Build Packets

## Packet 01: Repo And Environment Discovery

Objective: verify Eden Skye Studios, Auto Builder, sandbox, frontend, Supabase, Vercel, Drive, and provider connectivity.

Deliverables:
- repo inventory
- env var checklist
- missing connector report
- current deployment status
- capability-test receipt

Acceptance:
- Auto Builder readiness route returns green/yellow with blocker list.
- Missing tools are explicit, not hidden.

## Packet 02: Supabase Core

Objective: create production-ready tables, RLS, storage, and receipts.

Deliverables:
- migrations
- RLS policies
- storage buckets
- generated TypeScript types
- advisors report

Tables:
- model_profiles
- model_aliases
- media_assets
- media_asset_variants
- approval_requests
- content_queue
- social_posts
- agent_runs
- tool_receipts
- heygen_avatar_runs
- image_generation_jobs
- video_generation_jobs
- chat_sessions
- chat_messages
- leads
- customers
- offers
- campaigns
- analytics_events

## Packet 03: Admin Approval Console

Objective: create the operational cockpit.

Views:
- readiness dashboard
- model profiles
- asset browser
- approval queue
- content queue
- avatar jobs
- social drafts
- commerce drafts
- telemetry dashboard

## Packet 04: Media Asset Factory

Objective: generate, validate, index, and approve assets.

Deliverables:
- 56-image workflow
- per-model manifest
- checksum script
- Drive/Git index sync
- rejection notes
- approved source packs

## Packet 05: HeyGen / Video Factory

Objective: create private avatars and test videos only after source approval.

Deliverables:
- avatar approval packet
- HeyGen asset source URL
- private avatar creation receipt
- first test script
- lip-sync QA
- motion/video QA

## Packet 06: AI Chat And Visual Chat

Objective: provide model-specific AI chat and visual chat.

Deliverables:
- master Eden system prompt
- per-model chat prompts
- safety rules
- image context handling
- lead capture and product routing
- chat telemetry

## Packet 07: Growth And Content Engine

Objective: maximize growth without unsafe publishing.

Deliverables:
- daily trend scan
- 300-topic queue
- hook/caption/script generation
- platform-specific drafts
- scheduling handoff
- winner cloning report

## Packet 08: Commerce Engine

Objective: monetize attention ethically.

Deliverables:
- starter Shopify product map
- digital downloads
- licensing packages
- membership
- service offers
- email capture and Klaviyo flows
- Stripe revenue dashboard

## Packet 09: Telemetry And SLO

Objective: make the business measurable and improvable.

Deliverables:
- event taxonomy
- weekly KPI report
- asset cost report
- model performance score
- follower growth tracker
- revenue tracker
- incident and failure tracker

## Packet 10: Production Launch

Objective: gated launch after P0 blockers close.

Deliverables:
- launch checklist
- rollback plan
- public disclosure checks
- approval receipts
- deploy receipt

---

# Supabase Schema And RLS Specification

## Required Schemas

Use `public` for app-readable tables with RLS. Use a private schema for privileged functions if needed.

## Core Tables

### model_profiles

Fields:
- id uuid primary key
- model_code text unique
- primary_name text
- status text
- gender text
- age int
- archetype text
- niche text
- visual_signature jsonb
- voice_signature jsonb
- safety_rules jsonb
- created_at timestamptz
- updated_at timestamptz

### media_assets

Fields:
- id uuid primary key
- model_id uuid references model_profiles
- asset_type text
- asset_role text
- file_name text
- drive_file_id text
- drive_url text
- storage_path text
- sha256 text
- width int
- height int
- source_tool text
- prompt text
- status text
- approval_status text
- usage_scope text
- created_at timestamptz

### approval_requests

Fields:
- id uuid primary key
- request_type text
- target_table text
- target_id uuid
- requested_action text
- risk_level text
- status text
- approver text
- approved_at timestamptz
- notes text
- created_at timestamptz

### content_queue

Fields:
- id uuid primary key
- model_id uuid
- topic_id text
- platform text
- format text
- hook text
- caption text
- script text
- cta text
- status text
- approval_request_id uuid
- scheduled_for timestamptz
- created_at timestamptz

### tool_receipts

Fields:
- id uuid primary key
- agent_run_id uuid
- tool_name text
- action text
- input_hash text
- output_ref text
- status text
- error text
- created_at timestamptz

## RLS Rules

- Enable RLS on every exposed table.
- Admin role can read/write operational tables.
- Public users can only read public-approved models/assets/content.
- No unapproved media_assets are public-readable.
- No service role key in frontend.
- Storage buckets must separate private source assets from public approved assets.

## Storage Buckets

- `private-source-assets`
- `approved-public-assets`
- `video-renders`
- `chat-uploads`
- `receipts`

## Required Policies

- private source assets: admin/service only
- public assets: read only when approved
- approval requests: admin only
- content queue: admin only until approved
- leads: insert public, read admin only

---

# Frontend And Admin Console Specification

## Public Frontend

Pages:
- Home
- Model directory
- Individual model profile pages
- AI chat entry
- Visual chat entry
- Content hub
- Licensing
- Digital products
- Services
- Membership
- Contact/lead capture
- Disclosure and safety pages

## Admin Console

Sections:
- Readiness dashboard
- Model profiles
- Asset browser
- Source-pack progress
- Approval queue
- Content queue
- HeyGen jobs
- Video jobs
- Social drafts
- Commerce drafts
- Telemetry
- Tool receipts
- Settings and gates

## Asset Browser

Each asset card must show:
- preview
- model code
- model name
- asset type
- asset role
- status
- approval status
- checksum
- Drive URL
- source tool
- prompt
- usage scope
- reject/approve buttons

## Approval Queue

Actions:
- approve private source
- reject and add drift note
- approve HeyGen training
- approve public use
- approve social draft
- approve Shopify product mutation
- approve deploy

## UX Standard

This is an operational console, not a marketing page. It should be dense, fast, scannable, and calm.

---

# Autonomous Agent And Cron Specification

## Principle

Cron routes trigger work. They do not become uncontrolled workers. Every run must:

1. create an `agent_run`
2. acquire a lock
3. pull queued work
4. execute a bounded batch
5. write receipts
6. create approval requests when needed
7. release lock

## Vercel Cron Routes

Auto Builder already exposes:

- `/api/cron/factory-readiness`
- `/api/cron/reverse-engineering-passive`

Add Eden-specific routes:

- `/api/cron/eden-readiness`
- `/api/cron/eden-trend-scan`
- `/api/cron/eden-content-drafts`
- `/api/cron/eden-asset-queue`
- `/api/cron/eden-telemetry-review`

## 5-Minute Trigger Design

Use this only in sandbox/pre-production until cost, rate limits, and lock safety are verified.

`vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/eden-readiness", "schedule": "*/5 * * * *" }
  ]
}
```

Important: Vercel cron configuration lives in `vercel.json` and requires redeploy. Secure cron routes with `CRON_SECRET`.

## AI Gateway

Use Vercel AI Gateway as a provider abstraction for text tasks where appropriate:

- topic expansion
- caption drafting
- script drafting
- QA reasoning
- model prompt generation
- summary reports

Use direct provider/media tools for image/video creation when needed.

## Queue Rules

- max batch size per run
- idempotency key per job
- retry count and backoff
- dead-letter failed jobs
- never auto-publish
- never train HeyGen without approval
- never mutate Shopify without approval

## Agent Run Statuses

- queued
- running
- blocked
- waiting_approval
- completed
- failed
- skipped

## Required Receipts

- input
- output
- tool used
- cost estimate when available
- errors
- created assets
- approval requests
- next action

---

# Media Asset Factory Specification

## 56-Image Source Pack

Every model needs:

1. HeyGen Source - 8 images
2. Expression - 10 images
3. Full Body - 10 images
4. Wardrobe - 8 images
5. Environment - 8 images
6. Commerce - 6 images
7. Social/Video - 6 images

Total: 56 images per model.

## Priority Build Order

1. F01 Eden Skye
2. 2-3 expansion female models
3. 1-2 male models
4. remaining priority models
5. long-tail roster

## Body/Frame Reference Rules

Base-layer or underwear/fitting references are private studio source assets only.

Rules:
- clearly adult
- non-explicit
- no nudity
- no sexual pose
- neutral posture
- head-to-toe visible
- front, side, back, 45-degree angles
- realistic anatomy
- natural body diversity
- clear model ID
- private source status only

## QA Checks

- age clarity
- face continuity
- full-frame visibility
- anatomy realism
- no identity drift
- no explicit content
- no text/watermark
- clean lighting
- appropriate wardrobe
- approved/rejected status

## HeyGen Handoff

Only after source approval:

- choose primary portrait
- upload/host asset
- create approval packet
- create private HeyGen avatar
- run private 15-25 sec test
- review lip-sync, face, posture, voice, expression
- write avatar creation receipt

## Visual Chat Assets

Needed:
- model portrait set
- gesture set
- product recommendation stills
- chat-safe response image pack
- approved expressions
- rejected drift notes

---

# Growth And Monetization Operating System

## Growth Goal

Fastest ethical path to 10k followers with a lean $2k budget while building toward a $1M first-year revenue target as an aspirational business model, not a guarantee.

## Organic Growth Engine

- daily trend scan
- 3-5 daily drafts
- 1-3 approved posts/day once launch-ready
- model reveal campaigns
- behind-the-scenes AI avatar build content
- body/frame/modeling agency process content
- AI tools and creator economy content
- luxury lifestyle content
- confidence/wellness/fashion content
- weekly winner cloning

## $2k Budget Allocation

- $500 testing paid social boosts after organic proof
- $400 design/video tooling and asset processing
- $300 SEO/GEO content and tooling
- $300 influencer/collab experiments
- $250 email/list-growth incentives
- $250 reserve for high-performing post boosts

## Revenue Paths

- digital image packs
- prompt packs
- model licensing
- custom AI avatar/model creation service
- content automation service
- creator membership
- premium community
- brand collaborations
- Shopify digital products
- subscription content/tooling

## KPI Targets

- followers
- views
- saves
- shares
- comments
- profile visits
- email captures
- product views
- add-to-cart
- conversions
- revenue per model
- content ROI

## SEO/GEO

- model profile pages
- AI avatar agency pillar page
- digital modeling agency pillar page
- AI influencer creation service page
- licensing pages
- blog/content hub
- schema/entity markup
- Google Search Console
- Semrush tracking

---

# Enterprise Readiness And Gates

## Enterprise Bar

The system should meet strong startup/enterprise operating discipline:

- secure backend
- environment separation
- typed contracts
- audit trails
- RLS
- source control
- receipts
- approval gates
- observability
- rollback
- incident response
- cost controls

## Production Launch Gates

Production is blocked until:

- Supabase migrations and RLS pass review
- approval console exists
- at least F01 has approved source pack
- first HeyGen avatar passes private QA
- public site is complete
- telemetry dashboard works
- Shopify offers are approved
- no public mutation path bypasses approval
- Vercel deploy has monitoring and rollback

## Standards

- OWASP ASVS for app/API security
- NIST AI RMF for AI risk governance
- Supabase secure-data and shared-responsibility guidance
- Vercel observability and cron security

## Autonomy Levels

Level 1: drafts only
Level 2: private asset generation
Level 3: queued approvals
Level 4: approved scheduled posting
Level 5: constrained autonomous optimization

Current target: Level 2 to Level 3. Do not jump to Level 5 until telemetry, gates, and rollback are proven.

---

# Verification Receipts And Acceptance Checklist

## Repo Checks

- Auto Builder docs committed
- Eden Skye Studios docs committed
- build packets present
- manifest present
- cron spec present
- Supabase schema spec present
- frontend spec present

## Backend Checks

- migrations created
- RLS enabled
- storage buckets created
- policies tested
- advisors checked
- generated types updated

## Frontend Checks

- admin console routes exist
- asset browser exists
- approval queue exists
- content queue exists
- telemetry dashboard exists
- auth works
- mobile/public pages pass visual QA

## Automation Checks

- cron routes secured with CRON_SECRET
- agent runs logged
- queue locks work
- receipts written
- failed jobs retry safely
- no auto-publish bypass

## Media Checks

- model source packs approved
- file IDs/checksums indexed
- HeyGen packet created
- private avatar tested
- video QA passed

## Launch Receipt

Do not mark production-ready until every P0 gate is green.

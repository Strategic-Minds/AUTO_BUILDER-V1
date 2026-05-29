# Forbidden Fruit / Eden Skye FRONTEND Queue Review Plan

Status: implementation plan and active route guide  
Target repo: `Strategic-Minds/FRONTEND` or AUTO BUILDER frontend surface, depending on final route ownership  
Production mutation: not authorized

## Objective

Create a sandbox-only review surface for Forbidden Fruit's parent brand and Persona 001: Eden Skye before any public scheduling, Shopify/payment mutation, HeyGen Digital Twin action, live chat/voice/video interaction, or paid/cost-bearing generation.

## Recommended Route

Preferred route:

`/eden-skye/review`

This route name is retained for continuity, but the page should display the parent architecture as:

`Forbidden Fruit / Persona 001 - Eden Skye`

## User Flow

1. Operator opens Eden Skye review dashboard.
2. Dashboard loads read-only sandbox data from reusable Forbidden Fruit tables.
3. Operator reviews persona registry, asset readiness, prompt/script bank, content products, interaction modes, approvals, and signal logs.
4. Operator can mark local UI intent such as `ready_for_approval`, but live external actions remain disabled until backend approval workflow exists.
5. System displays blockers: missing public media URL, unapproved Shopify/payment mutation, HeyGen consent missing, chat/voice/video moderation missing, scheduler placeholder URL, policy risk, or Vercel/Supabase readiness failure.

## Required Views

### 1. Persona Registry

Data source: `forbidden_fruit_personas`

Columns:

- persona key
- display name
- parent brand
- archetype
- audience promise
- AI disclosure
- status
- policy risk level
- boundaries

Primary checks:

- Persona remains fictional, adult, and disclosed as AI.
- Persona does not impersonate a real private person.
- High-risk personas cannot go live without policy approval.

### 2. Asset Registry

Data source: `persona_assets`

Columns:

- persona key
- asset role
- asset key
- asset type
- content rating
- source path
- public URL readiness
- status
- approval required
- metadata

Primary checks:

- Public URL exists before Metricool import or downloadable-product setup.
- Binary image is stored outside git.
- Asset is approved before public usage.

### 3. Prompt Bank

Data source: `persona_prompt_bank`

Columns:

- persona key
- tool surface
- prompt name
- prompt type
- reference asset
- risk level
- status
- approval required

Primary checks:

- Kling prompts include negative prompts.
- HeyGen scripts include AI/fictional disclosure where customer-facing.
- Chat, voice, and video prompts remain inside adult-safe, non-impersonation boundaries.
- High-risk prompts cannot move to execution without approval.

### 4. Content Products

Data source: `content_products`

Columns:

- persona key
- platform
- content pillar
- product/content type
- title
- description/caption
- asset keys
- price cents
- scheduled for
- status
- risk level
- content rating
- approval request

Primary checks:

- No scheduling until public media URLs exist.
- No publish/schedule/checkout action unless approval status is `approved`.
- Draft rows can be exported to Metricool/Xyla/Shopify only after URL, policy, and approval checks pass.

### 5. Interaction Modes

Data source: `interaction_modes`

Columns:

- persona key
- mode key
- mode type
- display name
- user promise
- status
- risk level
- age gate required
- AI disclosure required
- moderation required
- approval required
- boundaries

Primary checks:

- Chat, voice, and video remain disabled until moderation, privacy, age-gate, and platform-policy gates pass.
- User must never be led to believe the persona is a real private person.
- Any mode with adult fantasy behavior defaults to high risk until validated.

### 6. Approval Events

Data source: `approval_events`

Columns:

- persona key
- target table
- target id
- action requested
- risk level
- status
- evidence
- blocker
- workaround
- rollback path

Primary checks:

- Shopify, payment activation, HeyGen, paid promotion, public posting, bulk outbound, production deployment, chat/voice/video launch, and Supabase production SQL all require approval.
- Every approval event must include evidence or blocker context before approval.

### 7. Signal Logs

Data source: `signal_logs`

Columns:

- persona key
- content product id
- interaction mode id
- platform
- measured at
- impressions
- views
- watch time
- saves
- shares
- clicks
- opt-ins
- product views
- purchases
- revenue cents

Primary checks:

- Measure before scaling.
- Kill/scale recommendations should use signal logs, not assumptions.

## Component Plan

Suggested components:

- `EdenSkyeReviewShell`
- `PersonaRegistryTable`
- `PersonaAssetTable`
- `PromptBankTable`
- `ContentProductTable`
- `InteractionModeTable`
- `ApprovalEventTable`
- `SignalLogTable`
- `ReadinessBanner`
- `GateBadge`
- `ExportDraftButton`

`ExportDraftButton` should remain disabled until public URLs, platform policy, and approval state pass validation.

## API Plan

Sandbox read routes:

- `GET /api/eden-skye/personas`
- `GET /api/eden-skye/assets`
- `GET /api/eden-skye/prompts`
- `GET /api/eden-skye/content-queue`
- `GET /api/eden-skye/interaction-modes`
- `GET /api/eden-skye/approvals`
- `GET /api/eden-skye/signals`
- `GET /api/eden-skye/readiness`
- `GET /api/eden-skye/env-diagnostic`

Governed mutation routes:

- `POST /api/eden-skye/queue/approve` - updates `content_products` and inserts `approval_events`.
- `POST /api/eden-skye/queue/reject` - updates `content_products` and inserts `approval_events`.
- `POST /api/eden-skye/signals/log` - inserts `signal_logs`.

Future governed mutation routes:

- `POST /api/eden-skye/approval-request`
- `POST /api/eden-skye/export/metricool`
- `POST /api/eden-skye/export/xyla`
- `POST /api/eden-skye/shopify/draft-product`
- `POST /api/eden-skye/interaction/launch-request`

Future mutation routes must enforce approval checks server-side and must not expose service-role keys to the client.

## Readiness Rules

A content product row is `ready_for_approval` only when:

- parent brand and persona are clearly fictional and adult
- AI disclosure exists
- asset references resolve
- public media URLs exist for scheduler-bound posts or downloadable content
- copy has no unsupported claim
- content rating and risk level are assigned
- target platform is present
- platform-policy validation exists for the intended use
- rollback path is available for any external mutation

A content product row is `ready_for_execution` only when:

- `ready_for_approval` is true
- approval event status is `approved`
- target connector is configured
- cost-bearing action budget is approved if applicable

An interaction mode is `ready_for_execution` only when:

- age-gate is configured
- AI disclosure is unavoidable
- moderation rules and blocked-topic rules exist
- privacy handling is documented
- platform policy validation is complete
- approval event status is `approved`

## Visual Layout

Use a dense operational dashboard rather than a marketing page.

Top band:

- parent brand status
- Persona 001 status
- Vercel status
- Supabase sandbox status
- approval blockers
- public URL readiness
- platform policy blockers

Main sections:

- Personas
- Assets
- Prompts
- Content Products
- Interaction Modes
- Approvals
- Signals
- Exports

Design constraints:

- no nested cards
- compact tables
- clear status badges
- restrained luxury palette matching Eden Skye, but operational first
- no generated imagery required in dashboard unless loaded from public asset URL

## Validation Plan

1. Load review route in sandbox/preview.
2. Confirm all seven data views render empty and seeded states.
3. Confirm no service-role key reaches browser bundle.
4. Confirm export buttons are disabled until approval, platform policy, and public URL conditions pass.
5. Confirm approval-gated actions show blockers rather than executing in read-only mode.
6. Confirm mobile layout does not overlap status badges or table controls.
7. Confirm live commerce/distribution remains blocked until policy matrix is completed.

## Blockers

- Current Vercel preview env target must be confirmed as safe staging or switched to sandbox ref `ezoxmpyhjdjjnacjfjzs`.
- Public media asset host is not yet selected.
- Shopify/payment/Metricool/Xyla/HeyGen/Kling/Repurpose live connector policy fit is not verified.
- Chat, voice, and video moderation rules are not yet live.

## Next Implementation Prompt

`AUTO BUILDER, verify the Forbidden Fruit / Eden Skye review route in sandbox only. Use the schema handoff in eden-skye-operating-pack/supabase, keep all export and live mutation buttons disabled behind approval gates, and run Vercel preview validation before requesting merge.`

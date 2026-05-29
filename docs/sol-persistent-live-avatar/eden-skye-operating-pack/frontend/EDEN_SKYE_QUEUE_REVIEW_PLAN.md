# Eden Skye FRONTEND Queue Review Plan

Status: implementation plan only  
Target repo: `Strategic-Minds/FRONTEND` or AUTO BUILDER frontend surface, depending on final route ownership  
Production mutation: not authorized

## Objective

Create a sandbox-only review surface for Eden Skye persona assets, prompt bank, content queue, approval events, and signal logs before any public scheduling, Shopify mutation, HeyGen Digital Twin action, or paid/cost-bearing generation.

## Recommended Route

Preferred route:

`/eden-skye/review`

Fallback route inside AUTO BUILDER control surface:

`/sol/eden-skye/review`

## User Flow

1. Operator opens Eden Skye review dashboard.
2. Dashboard loads read-only sandbox data from Eden tables.
3. Operator reviews asset readiness, prompt/script bank, content queue, approvals, and signal logs.
4. Operator can mark local UI intent such as `ready_for_approval`, but live external actions remain disabled until backend approval workflow exists.
5. System displays blockers: missing public media URL, unapproved Shopify mutation, HeyGen consent missing, scheduler placeholder URL, policy risk, or Vercel/Supabase readiness failure.

## Required Views

### 1. Asset Registry

Data source: `eden_persona_assets`

Columns:

- asset role
- asset key
- asset type
- source path
- public URL readiness
- status
- approval required
- metadata

Primary checks:

- Public URL exists before Metricool import.
- Binary image is stored outside git.
- Asset is approved before public usage.

### 2. Prompt Bank

Data source: `eden_prompt_bank`

Columns:

- tool surface
- prompt name
- prompt type
- reference asset
- risk level
- status
- approval required

Primary checks:

- Kling prompts include negative prompts.
- HeyGen scripts remain short and platform-safe.
- High-risk prompts cannot move to execution without approval.

### 3. Content Queue

Data source: `eden_content_queue`

Columns:

- platform
- content pillar
- content type
- title
- caption
- asset keys
- scheduled for
- status
- risk level
- approval request

Primary checks:

- No scheduling until public media URLs exist.
- No publish/schedule action unless approval status is `approved`.
- Draft rows can be exported to Metricool/Xyla only after URL and approval checks pass.

### 4. Approval Events

Data source: `eden_approval_events`

Columns:

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

- Shopify, HeyGen, paid promotion, public posting, bulk outbound, production deployment, and Supabase production SQL all require approval.
- Every approval event must include evidence or blocker context before approval.

### 5. Signal Logs

Data source: `eden_signal_logs`

Columns:

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
- `PersonaAssetTable`
- `PromptBankTable`
- `ContentQueueTable`
- `ApprovalEventTable`
- `SignalLogTable`
- `ReadinessBanner`
- `GateBadge`
- `ExportDraftButton`

`ExportDraftButton` should remain disabled until public URLs and approval state pass validation.

## API Plan

Sandbox read routes:

- `GET /api/eden-skye/assets`
- `GET /api/eden-skye/prompts`
- `GET /api/eden-skye/content-queue`
- `GET /api/eden-skye/approvals`
- `GET /api/eden-skye/signals`
- `GET /api/eden-skye/readiness`

Future governed mutation routes:

- `POST /api/eden-skye/approval-request`
- `POST /api/eden-skye/export/metricool`
- `POST /api/eden-skye/export/xyla`
- `POST /api/eden-skye/shopify/draft-product`

Future mutation routes must enforce approval checks server-side and must not expose service-role keys to the client.

## Readiness Rules

A content row is `ready_for_approval` only when:

- persona remains fictional, adult, non-identifiable, non-explicit, and platform-safe
- asset references resolve
- public media URLs exist for scheduler-bound posts
- caption has no unsupported financial or performance claim
- risk level is assigned
- target platform is present
- rollback path is available for any external mutation

A content row is `ready_for_execution` only when:

- `ready_for_approval` is true
- approval event status is `approved`
- target connector is configured
- cost-bearing action budget is approved if applicable

## Visual Layout

Use a dense operational dashboard rather than a marketing page.

Top band:

- persona status
- Vercel status
- Supabase sandbox status
- approval blockers
- public URL readiness

Main tabs:

- Assets
- Prompts
- Queue
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
2. Confirm all five data views render empty and seeded states.
3. Confirm no service-role key reaches browser bundle.
4. Confirm export buttons are disabled until approval and public URL conditions pass.
5. Confirm approval-gated actions show blockers rather than executing.
6. Confirm mobile layout does not overlap status badges or table controls.

## Blockers

- Supabase sandbox project/branch ID is not yet selected.
- Public media asset host is not yet selected.
- Metricool/Xyla/Shopify/HeyGen live connector credentials are not verified.
- Vercel preview currently fails on an existing TypeScript issue in `src/lib/autobuilder/mcp-core.ts`.

## Next Implementation Prompt

`AUTO BUILDER, implement the Eden Skye review route in sandbox only. Use the schema handoff in eden-skye-operating-pack/supabase, create read-only mock data if Supabase sandbox is unavailable, keep all export and live mutation buttons disabled behind approval gates, and run Vercel preview validation before requesting merge.`

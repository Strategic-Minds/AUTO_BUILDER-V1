# Eden Skye Auto Builder Integration Packet

## Objective

Turn Eden's Closet Black Card / Dark Side Edition into a real governed app using Auto Builder as the autonomous GPT bridge and control plane.

The system has three surfaces:

- Customer App: Black Card members browse fictional adult AI models, request looks, hear Eden, and request approved live avatar chat.
- Admin Control Plane: Jeremy approves images, videos, captions, products, schedules, external handoffs, and live releases.
- Automation Engine: n8n, Vercel, Supabase, Metricool, Klaviyo, Shopify, HeyGen, and OpenAI generate drafts, previews, recommendations, and receipts while waiting for approval.

## Grounded Repo Model

Auto Builder connector reports:

```text
source: Strategic-Minds/AUTO_BUILDER
sandbox: Strategic-Minds/SANDBOX
frontend: Strategic-Minds/FRONTEND
root package: auto-builder-bridge
control plane package: @xps-ai-factory/control-plane
workflow: executive-intake -> self-reflection -> discovery -> branding -> build-in-sandbox -> promote-source -> promote-frontend -> validate -> audit -> improve
```

## Operating Rule

Auto Builder is not one improvising agent. It is the operating system:

- intake lane
- planning lane
- sandbox lane
- validation lane
- promotion lane
- autonomous improvement lane

The 5-minute cron is a trigger, not the worker. It checks readiness, claims safe work, routes jobs, creates receipts, creates approval requests, and stops.

## Magic Loop

```text
pick model -> change look -> preview media -> Eden recommends action -> approve -> create posts -> schedule drafts -> track performance -> clone winners
```

## Vercel Workflow

All build work must go to preview before production:

1. Build in sandbox.
2. Run validation.
3. Deploy Vercel preview.
4. Capture screenshots and smoke receipts.
5. Request approval.
6. Promote only after approval.

Required routes:

```text
/api/factory/readiness
/api/factory/router
/api/factory/build-packet
/api/factory/capability-test
/api/factory/reverse-engineering
/api/cron/recursive-control
/api/cron/factory-readiness
/api/cron/eden-content-factory
/api/cron/eden-approval-digest
/api/cron/eden-analytics-review
```

Recommended cron config:

```json
{
  "crons": [
    { "path": "/api/cron/recursive-control", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/eden-content-factory", "schedule": "*/15 * * * *" },
    { "path": "/api/cron/eden-approval-digest", "schedule": "0 */3 * * *" },
    { "path": "/api/cron/eden-analytics-review", "schedule": "0 9 * * 1" }
  ]
}
```

## Sandbox Build Target

Build `eden-closet-black-card-control-plane` as a mobile PWA and admin control plane with:

- customer PWA
- admin command center
- model vault
- model profile drawer
- wardrobe editor
- approval theater
- Eden chat
- Eden voice modes
- HeyGen avatar session prep
- social draft generator
- Black Card subscription gates
- Dark Side Edition platform-safe vault
- n8n workflow monitor
- receipt log
- analytics and winner-cloning loop

Use existing factory templates:

- `TPL-001 Landing + Lead Capture`
- `TPL-002 Auth Dashboard`
- `TPL-004 AI Agent Console`
- `TPL-005 Workflow Queue Runner`

## API Routes

```text
/api/eden/chat
/api/eden/realtime-session
/api/wardrobe/change-look
/api/media/generate-preview
/api/social/generate-drafts
/api/approvals/decision
/api/n8n/webhook/:workflow
/api/heygen/avatar-session
/api/slack/approval-event
```

## Data Modules

Supabase should own:

- model_profiles
- wardrobe_states
- media_assets
- approval_requests
- social_drafts
- model_voice_profiles
- chat_sessions
- avatar_sessions
- subscriptions
- agent_runs
- tool_receipts
- analytics_snapshots

## Stack Integration

### Slack

Target channel: `#eden-skye-studios`.

Current status: the connected Slack app could not find the channel. Invite the Slack app/user integration to the channel or confirm the exact private channel/workspace name. Store `SLACK_EDEN_CHANNEL_ID` once visible.

Slack should receive readiness digests, approval alerts, failure alerts, and receipt summaries only after the Slack policy is approved.

### Vercel

Use Vercel for previews, API routes, cron triggers, and Vercel AI Gateway. Production deploys and env var changes require approval.

### Vercel AI Gateway / OpenAI

Use for Eden chat, content generation, GPT recommendations, prompt generation, approval summaries, and OpenAI Realtime voice architecture. Model/spend changes require approval.

### Supabase

Use for data, queues, receipts, approvals, media, subscriptions, and analytics. Schema/service-role writes require approval.

### n8n

Use for 24/7 workflow orchestration: readiness, trend scan, wardrobe preview, social draft generation, approved handoff, analytics, and winner cloning. Workflow activation and external actions require approval.

### Metricool

Use for social draft slots, schedule planning, and analytics. Public publishing or live schedule activation requires approval.

### Klaviyo

Use for Black Card lifecycle and launch campaign drafts. Sends require approval.

### Shopify

Use for the Eden Skye website/store, Black Card products, membership offers, and Xyla source content. Product/page/theme/discount/payment mutations require approval.

### HeyGen

Use for avatar video and approved live avatar sessions. Live sessions require approval.

## Approval Gates

No automation may do these without explicit current-session approval:

- production deploy
- Shopify mutation
- Shopify discount/payment/subscription change
- Supabase production migration
- public social publishing
- Metricool live schedule activation
- Klaviyo live send
- live HeyGen avatar session launch
- payment/pricing changes
- destructive delete

Allowed without further approval:

- read-only discovery
- local/sandbox docs
- draft generation
- prompt creation
- build packet creation
- preview-only UI work
- approval request creation
- receipt logging
- sandbox validation
- Slack-ready draft creation

## Risk Labels

- Green: safe to draft or proceed in sandbox.
- Yellow: needs review before external handoff.
- Red: blocked until rewritten or explicitly approved.

## Media Safety

Eden Skye is a fictional adult AI creator brand. The system may create premium adult-oriented fashion/editorial content, but not explicit sexual or nude content.

Allowed:

- high-fashion lingerie
- sheer layered fabric with full coverage
- cinematic private-club mood
- implied intimacy
- platform-safe sensuality

Blocked:

- nudity
- exposed intimate areas
- sexual acts
- minors or age ambiguity
- pornographic framing
- exploitative stereotypes
- real-person impersonation

## Required Validation Receipts

The sandbox build is not complete until it produces:

- schema dry-run receipt
- RLS check receipt
- app render receipt
- mobile screenshot receipt
- API route smoke receipt
- approval bypass test receipt
- queue replay receipt
- Slack notification dry-run receipt
- Vercel preview receipt

## Implementation Checklist

1. Confirm/invite Slack `#eden-skye-studios` and store channel ID.
2. Add Eden docs and JSON maps to Auto Builder.
3. Create Supabase migration from Eden schema, dry-run first.
4. Add Vercel AI Gateway, Supabase, n8n, and Slack env var plan.
5. Move the PWA starter into the real app repo.
6. Connect model vault, admin approval theater, wardrobe editor, Eden chat, voice, HeyGen session scaffold, and Black Card gates.
7. Create n8n workflows but keep them inactive until approved.
8. Add draft handoffs for Metricool, Klaviyo, Shopify, HeyGen, and Xyla.
9. Run validation and create receipts.
10. Request approval before promotion or live external actions.

## Master Execution Prompt

```text
You are Auto Builder operating for Eden Skye Studios.

Turn Eden's Closet Black Card / Dark Side Edition into a real governed app using the Auto Builder factory workflow.

Use Strategic-Minds/AUTO_BUILDER as the source control plane, Strategic-Minds/SANDBOX for sandbox implementation and validation, and Strategic-Minds/FRONTEND for promotion-ready frontend work after approval.

Use Vercel for previews, API routes, AI Gateway, and the 5-minute cron control loop. Use Supabase for model records, wardrobe states, media assets, approval requests, social drafts, chat/avatar sessions, subscriptions, agent runs, receipts, and analytics. Use n8n for 24/7 workflow orchestration. Use Slack #eden-skye-studios for readiness digests, approval alerts, and failure escalation only once the Slack app is invited and the channel ID is confirmed.

Respect hard gates: no production deploy, Shopify mutation, Supabase production migration, public social publishing, Metricool live schedule activation, Klaviyo send, live HeyGen avatar session, or payment/subscription/pricing change without approval.

First build target: make the sandbox loop work end to end: pick model -> change look -> preview media -> Eden recommends action -> approve -> create social drafts -> schedule draft handoff -> write receipts -> show in dashboard.
```

# Eden Skye AUTO SOCIAL Enterprise OS Implementation

Status: sandbox branch implementation
Branch: `sandbox/eden-skye-enterprise-os`

## Scope

This installs the first code layer for the Eden Skye / AUTO SOCIAL enterprise operating system:

- Supabase dev schema and RLS for models, assets, content, engagement, experiments, agent runs, memory, and receipts.
- Draft-safe backend routes for discover, analyze, create, quarantine, approve, schedule, validate, heal, and n8n-approved dispatch.
- Vercel five-minute cron validator.
- Workflow definition for the end-to-end discover -> analyze -> create -> quarantine -> validate -> heal -> approve -> schedule -> dispatch loop.
- Memory and self-reflection services.
- Sandbox-only admin command center at `/admin/auto-social`.

## Safety Boundary

All live external actions remain locked:

- no live posts
- no outbound comments, replies, or DMs
- no credentialed browser actions
- no n8n workflow activation
- no payment or Shopify mutation
- no production migration

## Validation Target

Local/preview validation should verify:

1. `GET /api/auto-social/discover`
2. `GET /api/auto-social/analyze`
3. `GET /api/auto-social/create`
4. `GET /api/auto-social/quarantine`
5. `GET /api/auto-social/approve`
6. `GET /api/auto-social/schedule`
7. `GET /api/auto-social/validate`
8. `GET /api/auto-social/heal`
9. `GET /api/auto-social/n8n-approved-dispatch`
10. `GET /api/cron/auto-social-five-minute`
11. `/admin/auto-social`

Every route must return `productionActionAllowed: false` directly or inside its receipt.

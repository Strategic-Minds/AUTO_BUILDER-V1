# Recursive Bridge Clearance Kit

This packet promotes the AWOS Autonomous Bridge Kit into AUTO_BUILDER as a preview-first, receipt-backed clearance layer.

## Scope

- Adds a 19-bridge registry for GitHub, Vercel, Supabase, Drive, Google Workspace, Google Chat, n8n, Metricool, Playwright, local relay, Shopify, Stripe, HeyGen, connector unblock routing, and audit receipts.
- Adds env-name contracts. Secret values must never be committed or exposed.
- Adds blocker queue ownership and next-test requirements.
- Adds route scaffolds for preview smoke and approval-gate verification.
- Adds validator and smoke workflow scaffolding.

## Non-Goals

- No production deployment.
- No production Supabase migration.
- No secret mutation.
- No live commerce, billing, email, calendar, chat, social, browser, or customer mutation.
- No claim that a blocker is cleared without live evidence.

## Required Preview Smoke

1. `GET /api/bridge/registry`
2. `GET /api/bridge/connectors/status`
3. `POST /api/bridge/connectors/dry-run`
4. `POST /api/bridge/connectors/execute-approved`
5. `GET /api/bridge/unblock/scan`

## Success Rule

A blocker may be marked resolved only when the PR or release receipt links to live evidence. Missing credentials, missing APIs, missing runners, and missing approval remain `HARD_GATE`.

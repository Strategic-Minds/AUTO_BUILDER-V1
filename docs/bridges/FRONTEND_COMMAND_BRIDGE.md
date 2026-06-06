# Frontend Command Bridge

The frontend command bridge is the bidirectional control path between v0/GPT/phone UI and AUTO BUILDER.

## Current State

- Read sync is live through registry, env-name, Supabase, smoke, and repo-visibility routes.
- Command POST route is installed at `/api/bridge/command`.
- Command persistence is gated by `AUTO_BUILDER_ADMIN_WRITE_ENABLED=true`, Supabase env, bearer auth, and table allowlists.
- Direct frontend GitHub/Vercel/Supabase mutation is intentionally not allowed.

## GET Contract

`GET /api/bridge/command` returns command-bridge readiness, auth presence, persistence status, and policy rules.

## POST Contract

`POST /api/bridge/command` accepts commands from:

- GPT
- v0
- phone UI
- workflow runners
- local relay

Required for POST:

- `Authorization: Bearer <AUTO_BUILDER_BRIDGE_TOKEN>`
- `operation`
- `bridgeId`
- `target`
- `riskClass`
- `mutation`

Risk class 2+ also requires `approvalId`.

## Safe Default

By default, commands are accepted as dry-run receipts and are not persisted or executed. This proves the bidirectional path without granting unsafe mutation.

## Widening Path

1. GET route smoke.
2. Unauthorized POST blocks.
3. Authorized dry-run POST returns receipt.
4. Enable Supabase command/receipt table allowlists.
5. Enable `AUTO_BUILDER_ADMIN_WRITE_ENABLED=true` for preview only.
6. Queue harmless read command.
7. Queue harmless write command.
8. Process command through governed worker.
9. Preserve approval gates for external mutations.

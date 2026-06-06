# Governed Supabase Admin Bridge

Route: `/api/bridge/supabase-admin`

## Purpose

Give GPT and the frontend a governed path to read and mutate Supabase state without exposing service-role secrets to the browser.

## GET

Returns names-only configuration state:

- whether `SUPABASE_URL` is present
- whether `SUPABASE_SERVICE_ROLE_KEY` is present
- whether bridge auth token is present
- whether `AUTO_BUILDER_ADMIN_WRITE_ENABLED=true`
- table allowlist
- RPC allowlist

No secret values are returned.

## POST Actions

- `select`
- `insert`
- `upsert`
- `update`
- `delete`
- `rpc`

## Mutation Requirements

Mutating actions require all of the following:

1. `Authorization: Bearer <AUTO_BUILDER_BRIDGE_TOKEN>` or fallback admin bridge token.
2. The table/function must be allowlisted.
3. Request body must include `approvalId`.
4. `AUTO_BUILDER_ADMIN_WRITE_ENABLED=true` must be set in server env.

## Default Table Allowlist

- `bridge_tasks`
- `bridge_receipts`
- `browser_evidence`
- `browser_screenshots`
- `nrw_leads`
- `eden_bridge_queue`
- `eden_tool_receipts`

## Env Names

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTO_BUILDER_BRIDGE_TOKEN`
- `AUTO_BUILDER_ADMIN_WRITE_ENABLED`
- `SUPABASE_BRIDGE_TABLE_ALLOWLIST`
- `SUPABASE_BRIDGE_RPC_ALLOWLIST`

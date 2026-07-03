# AUTO_BUILDER Supabase MCP Read/Write/Execute Surface

## Scope

This branch adds a dedicated governed Supabase MCP endpoint at:

- `POST /api/mcp-supabase`
- `GET /api/mcp-supabase`

The endpoint exposes Supabase read, write, and execute capabilities without storing or returning secrets.

## Tools

- `supabase_status`: readiness and configuration check. Returns only boolean environment status.
- `supabase_read`: reads rows through Supabase REST with secret-redacted output.
- `supabase_write`: plans or performs insert, upsert, update, and guarded delete.
- `supabase_execute`: plans or performs RPC and edge-function invocation. SQL and migrations require an approved executor function.
- `run_supabase_job`: generic router for read/write/execute Supabase work.

## Required environment

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` for read-only calls when service role is unavailable
- `SUPABASE_SERVICE_ROLE_KEY` for writes, RPC, and full-control reads
- `AUTOBUILDER_BRIDGE_KEY` for edge-function bridge invocation when available
- `SUPABASE_PROJECT_REF` optional; defaults to `prhppuuwcnmfdhwsagug`
- `SUPABASE_SQL_EXECUTOR_FUNCTION` optional; required before raw SQL or migration execution can run

Do not commit real keys to the repo. Configure secrets only in the deployment environment.

## Governance

Default mode is `dry_run` except `supabase_read`, which uses `read` mode.

Live writes require:

- `mode: "execute"`
- `approved: true`
- `approved_actions` containing `supabase_write`, `supabase_full_access`, or the specific operation name such as `supabase_insert`

Live execute actions require:

- `mode: "execute"`
- `approved: true`
- `approved_actions` containing `supabase_execute`, `supabase_full_access`, or the specific operation name such as `supabase_rpc`

Destructive operations also require:

- `approvalPhrase: "APPROVE SUPABASE EXECUTE"`

Destructive operations include `delete`, `execute_sql`, `apply_migration`, and `deploy_edge_function`.

## Table Access

Known AUTO_BUILDER tables are allowed by default. Reading or writing a table outside the allowlist requires one of:

- `allow_any_table: true`
- `approved_actions: ["supabase_full_access"]`

This gives full Supabase reach while making broad-table access explicit and auditable.

## Safety Notes

- Responses redact keys with names such as `token`, `secret`, `password`, `authorization`, `api_key`, and `service_role`.
- Update and delete operations require filters so broad mutations are blocked by default.
- Raw SQL and migration execution are blocked unless a reviewed SQL executor edge function is configured.
- Edge-function deployment is intentionally not wired to chat-triggered execution; use a reviewed CI/deployment workflow.

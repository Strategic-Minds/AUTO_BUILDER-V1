# Supabase Read-Only Hardening Inspection Receipt

Date: 2026-06-07
Branch: `auto-builder/frontend-system-port-20260607`
Repository: `Strategic-Minds/AUTO_BUILDER`
PR: https://github.com/Strategic-Minds/AUTO_BUILDER/pull/20

## Purpose

Advance connector readiness after the internal workflow-runtime replacement by inspecting Supabase state without mutating production or development databases.

## Scope

Read-only inspection only. No SQL migrations, data writes, secret changes, branch creation, production mutations, or approval-gated actions were performed.

## Verified Project

Production project:

- name: `Strategic Minds Advisory`
- project ref: `prhppuuwcnmfdhwsagug`
- region: `us-east-2`
- status: `ACTIVE_HEALTHY`
- Postgres: `17.6.1.121`

Development branches:

- `eden-governed-runtime-test`
  - project ref: `jhzrkllkevahrotyyitr`
  - preview status: `ACTIVE_HEALTHY`
  - branch status: `FUNCTIONS_DEPLOYED`
- `eden-skye-sandbox`
  - project ref: `ezoxmpyhjdjjnacjfjzs`
  - preview status: `ACTIVE_HEALTHY`
  - branch status: `FUNCTIONS_DEPLOYED`
- `main`
  - project ref: `prhppuuwcnmfdhwsagug`
  - default branch: true
  - branch status: `MIGRATIONS_FAILED`
  - preview status: `ACTIVE_HEALTHY`

## Security Advisor Evidence

Production security advisor for `prhppuuwcnmfdhwsagug` returned:

- `lints: []`

Development security advisor for `jhzrkllkevahrotyyitr` returned:

- `lints: []`

## Public Schema Evidence

Production public schema table listing showed RLS enabled on all returned public tables, including runtime and connector-critical tables such as:

- `agent_heartbeats`
- `queue_metrics`
- `execution_traces`
- `playwright_sessions`
- `worker_states`
- `bridge_commands`
- `bridge_tasks`
- `bridge_evidence`
- `bridge_blockers`
- `bridge_connector_actions`
- `approval_queue`
- `queue_control_events`
- `runtime_telemetry_events`
- `connector_receipts`
- `bridge_connections`
- `bridge_credentials`

Development branch `jhzrkllkevahrotyyitr` also returned RLS enabled on the public tables inspected.

## Performance Advisor Findings

Production and the `eden-governed-runtime-test` dev branch both returned performance lints. These are not security blockers, but they are hardening work items before operational scale.

Main classes observed:

- unindexed foreign keys across orchestration, bridge, browser, AI, and queue tables
- unused indexes on several runtime, bridge, social, telemetry, and content tables
- multiple permissive policies on selected public tables, including `agent_runs`, `approval_requests`, `leads`, and `tool_receipts`
- Auth database connection strategy warning: fixed absolute connection count instead of percentage-based allocation

Representative impacted runtime/connector tables from advisor output:

- `agent_runs`
- `ai_agent_decisions`
- `ai_agent_runs`
- `ai_cost_ledger`
- `ai_media_jobs`
- `ai_proof_logs`
- `bridge_blockers`
- `bridge_evidence`
- `bridge_next_prompts`
- `bridge_tasks`
- `browser_blockers`
- `browser_claims`
- `browser_evidence`
- `browser_screenshots`
- `bridge_connector_actions`
- `runtime_telemetry_events`
- `bridge_events`
- `bridge_connections`
- `social_bridge_events`

## Operating Decision

Supabase is not blocked by security advisor findings in this read-only pass. The next hardening lane should be performance and policy cleanup on a development branch, starting with connector/runtime-critical foreign key indexes and duplicate permissive policies.

Production mutation remains approval-gated.

## Release Status

Status: `READ-ONLY SUPABASE INSPECTION COMPLETE, HARDENING WORK QUEUED`

PR #20 should remain draft. Security advisor evidence is clean, but performance hardening, route smoke, browser desktop/mobile evidence, connector dry-runs, release hold, and rollback evidence remain incomplete.

## Next Actions

1. Create a branch-safe Supabase hardening packet for connector/runtime-critical performance lints.
2. Apply and verify the packet on `eden-governed-runtime-test` or a fresh development branch only.
3. Re-run Supabase security and performance advisors on the dev branch.
4. Record a dev-branch hardening receipt before requesting any production DB approval.
5. Continue PR #20 route smoke and connector dry-runs one connector at a time.

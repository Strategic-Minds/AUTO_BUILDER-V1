# Vercel Agents Packet

## Current Status

The OS v1 spec requires Vercel Agents, but no verified agent manifests, deployment receipts, or runtime execution receipts were found in this audit.

## Source Truth

AUTO BUILDER OS must separate orchestration from execution and use governed multi-agent execution for planning, building, QA, deployment, recovery, and connectors.

## Required Agents

1. Planner Agent: turns intake into source-truth and build-plan tasks.
2. Builder Agent: prepares branch-scoped implementation tasks for Codex.
3. QA Agent: runs API, browser, schema, and policy checks.
4. Governance Agent: enforces approval gates and release holds.
5. Recovery Agent: classifies failures and chooses retry, reroute, workaround, or hold.
6. Browser Agent: performs Playwright checks and screenshot evidence.
7. Connector Agent: checks GitHub, Vercel, Supabase, Google Chat, Google Workspace, Shopify, n8n, and AI Gateway readiness.

## Backend Plan

- Add `agents` manifest table or config file with tool scopes, allowed actions, risk class, approval rules, and rollback rules.
- Add `agent_runs` receipts for every execution.
- Add `/api/agents/status` and `/api/agents/run` with policy checks.
- Add per-agent max autonomy levels: read, write-branch, execute-sandbox, admin-sandbox, production-gated.

## Frontend Plan

- Add Agents panel showing status, last run, autonomy scope, blocked action, and evidence link.
- Show explicit production-gated state for risky agents.

## Validation Plan

- Each agent can report status.
- Planner produces a harmless build packet.
- QA runs route smoke without mutation.
- Browser Agent captures screenshot evidence.
- Governance Agent blocks protected action without approval.
- Recovery Agent converts a forced failed smoke into retry/hold recommendation.

## Blockers

- Need stable bridge event bus and workflow persistence.
- Need Google Chat approval path.
- Need Supabase policy cleanup before admin-sandbox widening.

## Next Best Prompt

Create Vercel Agent manifests and status/run routes with autonomy scopes, Supabase receipts, and approval gate tests. Do not grant production mutation scopes.

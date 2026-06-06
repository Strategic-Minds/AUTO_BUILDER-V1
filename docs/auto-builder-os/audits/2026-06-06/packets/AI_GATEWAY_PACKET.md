# AI Gateway Packet

## Current Status

AI Gateway is required by the OS v1 spec, but no end-to-end AI Gateway route, model allowlist, cost ledger, or fallback receipt was verified in the current audit.

## Source Truth

- OS v1 alignment spec requires AI Gateway for model routing, cost control, fallback, and observability.
- AUTO BUILDER must remain governed and cost-aware.

## System Boundary

AI Gateway may route model calls and record telemetry. It must not bypass approval gates, leak secrets, or autonomously widen spending limits.

## Backend Plan

- Add env names only: `AI_GATEWAY_API_KEY`, `AI_GATEWAY_BASE_URL`, `AI_GATEWAY_DEFAULT_MODEL`, `AI_GATEWAY_FALLBACK_MODEL`, `AI_GATEWAY_BUDGET_DAILY_USD`.
- Add `/api/ai-gateway/status` returning configured env booleans only.
- Add `/api/ai-gateway/run` for governed model calls with budget checks.
- Add model allowlist and denied-provider list.
- Store receipts in `ai_model_runs` or `model_invocations` with model, tokens, estimated cost, route, status, and error.
- Add fallback policy when provider fails or budget is exceeded.

## Frontend Plan

- Add AI Gateway panel with readiness, model route, budget remaining, recent runs, and failed fallback receipts.
- Never show raw API keys.

## Validation Plan

1. Status route returns env-name booleans only.
2. Harmless test prompt returns a response through allowed model route.
3. Cost receipt writes to sandbox table.
4. Budget exceeded path returns governed refusal.
5. Fallback route records provider switch.

## Blockers

- Env values must be configured through approved Vercel secret channel.
- Cost ledger schema must be branch-tested.
- No verified AI Gateway implementation exists yet.

## Next Best Prompt

Implement AI Gateway status/run routes with secret-name-only readiness, model allowlist, budget guard, fallback, and Supabase receipts. Use sandbox env and stop before production cost widening.

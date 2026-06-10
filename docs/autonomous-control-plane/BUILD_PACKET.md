# Autonomous Control Plane Build Packet

## Current Status

Branch-safe promotion target: `auto-builder/autonomous-control-plane-20260610`.

This packet promotes the local AWOS autonomous control-plane sandbox into the canonical AUTO_BUILDER repo as a preview-only route.

## Source Truth

- User approval on 2026-06-10 for branch-safe promotion, signed cron evidence, Supabase persistence review, browser QA, and preview validation.
- Uploaded Strategic Minds Advisory dashboard/package/journey screenshots.
- AWOS Money Machine operating doctrine.
- Existing MCP self-operating loop implementation.
- Existing AUTO_BUILDER approval and autonomy posture.

## System Boundary

Included:

- `/autonomous-control-plane` preview route.
- `/api/autonomous-control-plane/state` preview-safe state endpoint.
- `/api/autonomous-control-plane/run-loop` dry-run execution endpoint.
- `/api/cron/autonomous-control-plane` signed cron evidence endpoint.
- `scripts/validate-autonomous-control-plane.mjs` local validator.
- Browser QA workflow for preview route checks.

Excluded until separate explicit approval:

- production deploy
- protected branch merge
- live Supabase migration apply
- billing or checkout mutation
- external publishing or outreach
- Vercel environment mutation
- Shopify, Stripe, Slack, Twilio, Gmail, Calendar, or social writes

## Frontend Plan

The preview route renders:

- Strategic Minds brand signal
- package ladder
- 10-step client journey
- self-build queue
- approval gates
- dry-run receipt instructions

## Backend Plan

The state model lives in `src/lib/autonomous-control-plane/state.ts`.

The dry-run endpoint returns:

- 12 AWOS stages checked
- local completed tasks
- approval-gated blocked tasks
- existing MCP self-operating-loop summary
- `productionActionAllowed: false`

The cron route supports:

- HMAC signature via `AUTONOMOUS_CONTROL_PLANE_CRON_SECRET`
- fallback to `CRON_API_TOKEN`
- unsigned dry-run evidence via `?dryRun=1`
- 401 for unsigned live execution

## Repo And File Map

- `src/app/autonomous-control-plane/page.tsx`
- `src/app/autonomous-control-plane/page.module.css`
- `src/app/api/autonomous-control-plane/state/route.ts`
- `src/app/api/autonomous-control-plane/run-loop/route.ts`
- `src/app/api/cron/autonomous-control-plane/route.ts`
- `src/lib/autonomous-control-plane/state.ts`
- `scripts/validate-autonomous-control-plane.mjs`
- `.github/workflows/autonomous-control-plane-preview.yml`
- `docs/autonomous-control-plane/SUPABASE_PERSISTENCE_MIGRATION_REVIEW.md`

## Tool And Integration Plan

- GitHub: branch-safe PR only.
- Vercel: preview deployment and preview route checks only.
- Supabase: migration review doc only; no schema apply in this PR.
- Browser QA: GitHub Actions Playwright route checks against preview URL or production fallback.
- Cron: signed dry-run route; live schedule activation requires environment secret and production approval.

## Validation Plan

Required before merge:

1. `npm run validate:autonomous-control-plane`
2. `npm run build`
3. Preview route loads at `/autonomous-control-plane`.
4. `/api/autonomous-control-plane/state` returns HTTP 200.
5. `/api/autonomous-control-plane/run-loop` returns HTTP 200 with `productionActionAllowed: false`.
6. `/api/cron/autonomous-control-plane?dryRun=1` returns HTTP 200.
7. `/api/cron/autonomous-control-plane` without signature returns HTTP 401 when a signing secret is configured.
8. Browser QA captures screenshot evidence and verifies no framework error overlay.

## Blockers Or Missing Pieces

- Positive signed cron evidence requires a configured signing secret in preview or production.
- Durable Supabase persistence requires migration review, rollback SQL, and explicit apply approval.
- Production deployment remains gated after preview validation.

## Next Best Prompt

After preview deployment is ready, run the browser QA workflow and signed cron dry-run evidence checks, then decide whether to approve production deployment.

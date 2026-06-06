# AUTO BUILDER OS Frontend, Backend, And Workflow Final Build Spec

## Current Status

The backend has route scaffolds for factory readiness, build packets, validation, workflow state, provider readiness, GitHub workflows, and Vercel preview. PR #13 adds bridge/generator/event-bus work but is diverged. The v0 frontend has useful UI work but is not yet fully synced to the final backend contract.

## Source Truth

- AUTO BUILDER OS master system doc.
- AUTO BUILDER OS v1 alignment and Vercel build spec.
- 2026-06-06 proof pack and finalization docs.
- User decision: Google Chat, not Slack.

## System Boundary

AUTO BUILDER OS is cloud-primary and sandbox-first. Local Playwright/browser is a connected worker, not the source of truth. Frontend commands submit governed jobs. Backend routes enforce policy. Workflows execute only allowed stages. Production mutation stays gated.

## Frontend Plan

Required v0 AUTO BUILDER OS panels:

1. Idea Intake
   - New idea form.
   - Source truth upload/link area.
   - Discovery status.

2. Discovery And Benchmark
   - Competitor/benchmark capture.
   - Verified versus inferred facts.
   - Opportunity score.

3. Branding
   - Brand positioning.
   - Offer ladder.
   - Visual/content system.

4. Build Packet Viewer
   - Frontend plan.
   - Backend plan.
   - Workflow plan.
   - Env names.
   - File map.
   - Acceptance criteria.

5. Generator And Queue
   - Queue state.
   - Current stage.
   - Retry count.
   - Dead-letter reason.

6. Agents
   - Agent status.
   - Autonomy scope.
   - Last run.
   - Blocked action.

7. Connectors
   - GitHub, Drive, Supabase, Vercel, Shopify, HeyGen, Xyla, Metricool, n8n, AI Gateway, Codex, Playwright.
   - Read/write/execute/admin state.
   - Secret names only.

8. Browser Evidence
   - Screenshots.
   - Route smoke.
   - UI regression results.

9. Approvals
   - Google Chat approval status.
   - In-app approval queue.
   - Protected action reason.

10. Auto Social System
    - Content calendar.
    - Generated assets.
    - Draft captions/scripts.
    - Approval state.
    - Publishing receipts.
    - Analytics feedback.

11. Store And Admin Control Plane
    - Website preview.
    - Store readiness.
    - Admin dashboard.
    - Data tables.
    - Integration checklist.

12. Release Hold
    - Smoke evidence.
    - Advisor state.
    - Rollback path.
    - Production approval button disabled until gates pass.

## Backend Plan

Required backend route groups:

- `/api/intake/*`: idea intake, source truth, uploaded docs.
- `/api/discovery/*`: benchmark, research, scoring, verified/inferred split.
- `/api/brand/*`: brand guide, offer ladder, content strategy.
- `/api/build-packets/*`: generate, read, validate, export build packets.
- `/api/workflows/*`: Vercel Workflow start/status/tick/retry.
- `/api/sandbox/*`: sandbox runs, evidence, branch preview, rollback.
- `/api/agents/*`: manifests, runs, receipts, policy checks.
- `/api/bridge/*`: inbound, outbound, policy, env names, registry, connector readiness.
- `/api/codex/*`: jobs, branch work, PR receipt, test logs.
- `/api/social/*`: strategy, queue, assets, approvals, publish receipts, analytics.
- `/api/store/*`: Shopify readiness, product/store packet, gated mutations.
- `/api/browser/*`: screenshot jobs, route checks, Playwright receipts.
- `/api/cron/*`: five-minute safe ticks and retry workers.

## Workflow Plan

Universal workflow:

1. Intake idea.
2. Discover and classify.
3. Benchmark and reverse engineer.
4. Brand and offer.
5. Generate build packet.
6. Create sandbox plan.
7. Build branch/sandbox.
8. Validate route/schema/UI/security.
9. Generate auto social system.
10. Request approval for protected actions.
11. Prepare release handoff.
12. Monitor, optimize, and replicate.

## Repo And File Map

- `docs/auto-builder-os/`: canonical OS docs, packets, finalization docs.
- `src/app/api/`: backend routes.
- `src/lib/`: policy, connectors, workflow helpers, Supabase helpers, AI Gateway helpers.
- `supabase/migrations/`: branch-tested migrations.
- `.github/workflows/`: smoke, workflow dispatch, screenshot, and validation actions.
- `apps/web` or v0 repo: frontend command center.
- `n8n/`: workflow JSON exports and setup docs.
- `gpt-business/`: GPT account README, custom instructions, action specs, knowledge index.

## Validation Plan

- Type/build checks.
- Route smoke checks.
- Secret-name-only checks.
- Supabase advisor checks.
- Browser screenshot checks.
- Workflow dry run.
- Codex branch job dry run.
- n8n webhook replay dry run.
- Auto social draft-only run.
- Shopify sandbox/read-only check.
- Release gate lock test.

## Blockers

- Branch drift.
- Supabase policy cleanup.
- Google Chat connector missing.
- v0 frontend not yet reconciled.
- AI Gateway/n8n/Vercel Agents not verified end to end.

## Next Best Prompt

Implement this spec in a fresh branch from current main: first backend route contracts and Supabase sandbox schema, then v0 frontend panels, then workflow/sandbox/agent/AI Gateway/Codex/n8n/social workers, with no production mutation.

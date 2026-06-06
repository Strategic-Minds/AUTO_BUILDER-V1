# Implementation Queue And Acceptance Gates

## Queue 1: Source Truth Merge

- Rebase/update proof docs branch.
- Merge docs after review.
- Mark docs as canonical OS v1 source truth.

Acceptance gate: docs merged or explicitly selected as source truth.

## Queue 2: Clean Backend Bridge Branch

- Create fresh branch from current main.
- Port bridge/generator/event-bus work from PR #13.
- Replace Slack with Google Chat.
- Add route tests and validator updates.

Acceptance gate: build passes, route smoke passes, no secret values exposed.

## Queue 3: Supabase Development Branch

- Apply bridge/event/workflow/social schema to Supabase development branch.
- Fix RLS policies for bridge-critical tables.
- Fix function warnings where needed.
- Run advisors.

Acceptance gate: branch migration passes, advisors clean or documented, no production schema mutation.

## Queue 4: Workflow And Sandbox Runtime

- Add Vercel Workflow runner.
- Add five-minute safe tick.
- Add Vercel Sandbox job model.
- Add receipts, retries, dead-letter.

Acceptance gate: harmless workflow dry run produces receipts.

## Queue 5: Agent System

- Add agent manifests.
- Add agent run routes.
- Add autonomy scopes.
- Add governance/recovery policies.

Acceptance gate: each required agent returns status and one harmless run receipt.

## Queue 6: AI Gateway

- Add status/run routes.
- Add model allowlist.
- Add budget cap.
- Add fallback and cost receipts.

Acceptance gate: harmless model route creates cost receipt and budget gate blocks over-limit.

## Queue 7: Codex And GitHub Actions

- Add Codex job queue.
- Add branch-scoped job route.
- Add GitHub workflow read/dispatch receipts.
- Add draft PR evidence.

Acceptance gate: harmless branch file write and workflow-read smoke succeed.

## Queue 8: n8n Bridge

- Add n8n HMAC inbound/outbound contract.
- Add workflow JSON templates.
- Add replay and retry docs.
- Add Google Chat approval loop.

Acceptance gate: n8n replay returns receipt and duplicate event is idempotent.

## Queue 9: v0 AUTO BUILDER OS Frontend

- Reconcile latest v0 branch and bridge UI branch.
- Add all OS panels.
- Connect to backend route contract.
- Add loading/error/approval states.

Acceptance gate: screenshot smoke confirms panels render and live state loads without secret leakage.

## Queue 10: Auto Social System

- Add social strategy/calendar/assets/approval/publish-draft/analytics routes.
- Add Xyla/HeyGen/Metricool draft connectors.
- Add approval queue and analytics loop.

Acceptance gate: draft-only social pack generated and approval gate blocks live publishing.

## Queue 11: System-In-A-Box Generator

- Add template library for common system types.
- Add generator route for one-hour packet/build flow.
- Add reusable website/admin/store/workflow/social templates.

Acceptance gate: one harmless idea produces docs, preview/sandbox plan, and social pack.

## Queue 12: Full Smoke And Release Hold

- Heartbeat.
- Secret names only.
- Harmless read.
- Harmless write.
- Harmless command.
- Browser screenshot.
- Git status.
- Workflow dry run.
- Supabase branch receipt.
- n8n replay.
- AI Gateway receipt.
- Social draft receipt.
- Frontend screenshot.

Acceptance gate: all required evidence clean; production remains locked until explicit approval.

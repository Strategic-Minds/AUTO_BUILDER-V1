# Vercel Workflow Packet

## Current Status

- `workflow` is present in `package.json`.
- `vercel.json` has cron surfaces, including five-minute routes.
- Durable Vercel Workflow stage receipts were not verified end to end.

## Source Truth

- `AUTO_BUILDER_OS_MASTER_SYSTEM.md`
- `AUTO_BUILDER_OS_V1_ALIGNMENT_AND_VERCEL_BUILD_SPEC.md`
- Live readiness routes from AUTO_BUILDER main

## System Boundary

Vercel Workflow coordinates long-running OS stages. It does not directly approve production deploys, payment actions, social publishing, or store writes.

## Required Workflow Stages

1. `intake`: normalize idea/request.
2. `source_truth`: collect docs, repo state, platform state.
3. `benchmark`: benchmark/reverse engineer when relevant.
4. `build_packet`: create implementation packet.
5. `sandbox_plan`: generate branch/sandbox execution plan.
6. `sandbox_execute`: trigger safe sandbox work only.
7. `validate`: run API/browser/schema tests.
8. `approval_gate`: stop for protected actions.
9. `preview_release`: preview only.
10. `evidence_archive`: store receipts in Supabase.

## Backend Plan

- Add `/api/workflows/autobuilder-os` for workflow start/status.
- Add `/api/cron/autobuilder-os-tick` on five-minute cadence.
- Add idempotency key per workflow run.
- Persist stage state to Supabase.
- Use dead-letter and retry table for failed steps.

## Frontend Plan

- Show workflow run list, current stage, failed stage, retry count, evidence links, and approval state.
- Disable protected buttons unless approval state is valid.

## Validation Plan

- GET status route returns no secret values.
- POST start route accepts a harmless test idea.
- Five-minute cron route performs no protected mutation without queued approved work.
- Retry route replays only idempotent failed work.

## Blockers

- Supabase persistence schema must be approved/applied in branch first.
- Google Chat approval connector must replace Slack.
- PR #13 divergence must be reconciled before event bus dependency is merged.

## Next Best Prompt

Implement the Vercel Workflow runner on a fresh branch from current main. Use Supabase branch persistence, no production deploys, and produce route smoke evidence before PR.

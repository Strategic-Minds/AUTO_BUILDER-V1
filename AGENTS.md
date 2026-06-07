# AUTO BUILDER Agent Instructions

## Master Completion Lock

All agents must start with `docs/auto-builder-os/START_HERE_MASTER_COMPLETION_LOCK.md`.

All system work must route through `docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md` until every item is complete, explicitly not applicable with evidence, or hard-gated with owner, required action, and next test.

Do not perform unrelated planning, redesign, new architecture, side quests, or production mutation while master TODO items remain open.

## Mandatory Source Truth

Read in this order:

1. `docs/auto-builder-os/START_HERE_MASTER_COMPLETION_LOCK.md`
2. `docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md`
3. `docs/auto-builder-os/FINAL_DEFINITION_OF_DONE.md`
4. `docs/auto-builder-os/generator/GENERATOR_MASTER_COMPLETION_PACKET.md`
5. `docs/auto-builder-os/vercel/VERCEL_WORKFLOW_MASTER_COMPLETION_PACKET.md`
6. `docs/auto-builder-os/vercel/VERCEL_SANDBOX_AND_5_MIN_CRON_COMPLETION_PACKET.md`
7. `docs/auto-builder-os/audits/2026-06-07/05_UPLOADED_FRONTEND_COMPLETION_AUDIT_AND_FINAL_HANDOFF.md`

## Allowed Work

Allowed work is limited to completing, validating, evidencing, or unblocking items in the master TODO.

## Protected Gates

Never perform these without explicit approval:

- production deploy
- production database mutation
- secret mutation
- commerce/payment mutation
- live social publish
- customer message
- destructive action
- external spend
- credentialed browser action

## Required Response Format

Every substantial response must include:

- PHASE
- STEP
- TODO item
- VERIFIED
- INFERRED
- COULD NOT VERIFY
- BLOCKERS
- WORKAROUNDS
- NEXT ACTIONS

## Completion Rule

No item is complete without evidence: file path, code path, test/smoke result, receipt, approval state, or hard-gate record.

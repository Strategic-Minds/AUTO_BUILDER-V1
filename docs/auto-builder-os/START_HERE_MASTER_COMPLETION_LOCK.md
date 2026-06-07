# START HERE - Master Completion Lock

Date: 2026-06-07
Status: Mandatory operating lock

## Mandatory Rule

All AUTO BUILDER OS work must route through `docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md` until that checklist is complete or explicitly superseded by a newer operator-approved master checklist.

No agent, GPT, Vercel workflow, generator, v0 agent, Codex agent, or connected automation may start unrelated build work, redesign work, new architecture work, or side quests while open items remain in the master completion list.

## Allowed Work

Allowed work is limited to:

1. Completing an item in `MASTER_SYSTEM_COMPLETION_TODO.md`.
2. Validating an item in `MASTER_SYSTEM_COMPLETION_TODO.md`.
3. Recording evidence for an item in `MASTER_SYSTEM_COMPLETION_TODO.md`.
4. Reporting a blocker for an item in `MASTER_SYSTEM_COMPLETION_TODO.md`.
5. Creating a workaround for a blocker that still advances the checklist.
6. Requesting approval for a protected action required by the checklist.

## Disallowed Work

Disallowed work includes:

1. New feature ideation outside the checklist.
2. Redesigning the locked frontend visual system.
3. Replacing the approved workflow with a new workflow.
4. Calling mocked, sample, static, or env-name-only checks complete.
5. Production deploys without approval.
6. Production database mutations without approval.
7. Secret changes without approval.
8. Billing, commerce, social publishing, customer messaging, destructive actions, or spend without approval.

## Source Truth Order

1. `MASTER_SYSTEM_COMPLETION_TODO.md`
2. `FINAL_DEFINITION_OF_DONE.md`
3. `generator/GENERATOR_MASTER_COMPLETION_PACKET.md`
4. `vercel/VERCEL_WORKFLOW_MASTER_COMPLETION_PACKET.md`
5. `vercel/VERCEL_SANDBOX_AND_5_MIN_CRON_COMPLETION_PACKET.md`
6. PR #19 audit handoff
7. PR #18 bridge clearance packet
8. Drive source truth under `AUTO BUILDER DOCS`

## Required Agent Response

Every substantial agent response must include:

- PHASE
- STEP
- TODO item being completed
- VERIFIED
- INFERRED
- COULD NOT VERIFY
- BLOCKERS
- WORKAROUNDS
- NEXT ACTIONS

## Completion Standard

An item is not complete until it has evidence:

- code path or document path
- smoke/test result where applicable
- receipt or artifact
- approval gate status where applicable
- remaining risk noted

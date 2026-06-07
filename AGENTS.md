# AUTO BUILDER Agent Instructions

## Master Completion Lock

All agents must start with `docs/auto-builder-os/START_HERE_MASTER_COMPLETION_LOCK.md`.

All system work must route through `docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md` until every item is complete, explicitly not applicable with evidence, or hard-gated with owner, required action, and next test.

Do not perform unrelated planning, redesign, new architecture, side quests, local-only completion work, or production mutation while master TODO items remain open.

## Repo-First System Rule

AUTO BUILDER OS is not a local-first system. Durable work belongs in the canonical repo, implementation branches, Vercel workflows/previews, Supabase development branches, Drive source-truth surfaces, and receipt-backed connector bridges.

Local-only proof, local-only servers, sample output, mocked output, and env-name-only checks are not completion evidence.

## Mandatory Source Truth

Read in this order:

1. `docs/auto-builder-os/START_HERE_MASTER_COMPLETION_LOCK.md`
2. `docs/auto-builder-os/LOCKED_FILES_MANIFEST.md`
3. `docs/auto-builder-os/AGENT_WORKFLOW_LOCK.md`
4. `docs/auto-builder-os/LEAN_SYSTEM_OUTPUT_CONTRACT.md`
5. `docs/auto-builder-os/REPEATABLE_AGENT_RUNBOOK.md`
6. `docs/auto-builder-os/WORKFLOW_RECEIPT_SCHEMA.json`
7. `docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md`
8. `docs/auto-builder-os/FINAL_DEFINITION_OF_DONE.md`
9. `docs/auto-builder-os/SYSTEM_STATUS_MATRIX.md`
10. `docs/auto-builder-os/BUILD_EVIDENCE_REQUIREMENTS.md`
11. `docs/auto-builder-os/PROTECTED_ACTION_POLICY.md`
12. `docs/auto-builder-os/generator/GENERATOR_MASTER_COMPLETION_PACKET.md`
13. `docs/auto-builder-os/vercel/VERCEL_WORKFLOW_MASTER_COMPLETION_PACKET.md`
14. `docs/auto-builder-os/vercel/VERCEL_SANDBOX_AND_5_MIN_CRON_COMPLETION_PACKET.md`
15. `docs/auto-builder-os/audits/2026-06-07/05_UPLOADED_FRONTEND_COMPLETION_AUDIT_AND_FINAL_HANDOFF.md`

## Required Workflow

Every substantial agent run must follow this loop:

1. Read locked files.
2. Select exactly one master TODO item unless the operator names another item.
3. Inspect repo/source truth before mutation.
4. Create or update the smallest repo artifact that advances the item.
5. Validate or hard-gate with evidence.
6. Record a receipt shape matching `WORKFLOW_RECEIPT_SCHEMA.json`.
7. Update checklist/status/evidence surfaces when write access is available.
8. Stop only at a real approval gate, missing capability, or source-truth conflict.

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

## Output Rule

Each run must produce one primary output from `LEAN_SYSTEM_OUTPUT_CONTRACT.md`: repo file created, repo file updated, checklist item completed, validation receipt created, hard-gate recorded, approval request created, implementation branch prepared, preview/build evidence recorded, or rollback/release-hold recorded.
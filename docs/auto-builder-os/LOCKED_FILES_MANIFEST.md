# AUTO BUILDER OS - Locked Files Manifest

Date: 2026-06-07
Status: Mandatory locked-file manifest

## Purpose

List the repo files that control AUTO BUILDER OS behavior. Agents must read and obey these before creating plans, changing code, validating work, or requesting approval.

## Primary Locks

1. `docs/auto-builder-os/START_HERE_MASTER_COMPLETION_LOCK.md`
2. `docs/auto-builder-os/AGENT_WORKFLOW_LOCK.md`
3. `docs/auto-builder-os/LEAN_SYSTEM_OUTPUT_CONTRACT.md`
4. `docs/auto-builder-os/REPEATABLE_AGENT_RUNBOOK.md`
5. `docs/auto-builder-os/WORKFLOW_RECEIPT_SCHEMA.json`
6. `docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md`
7. `docs/auto-builder-os/FINAL_DEFINITION_OF_DONE.md`
8. `docs/auto-builder-os/SYSTEM_STATUS_MATRIX.md`
9. `docs/auto-builder-os/BUILD_EVIDENCE_REQUIREMENTS.md`
10. `docs/auto-builder-os/PROTECTED_ACTION_POLICY.md`

## Supporting Locks

- `docs/auto-builder-os/DRIVE_GIT_SOURCE_TRUTH_POLICY.md`
- `docs/auto-builder-os/VERCEL_BUILDS_NOT_GPT_POLICY.md`
- `docs/auto-builder-os/AUTONOMOUS_BRIDGE_REQUIREMENTS.md`
- `docs/auto-builder-os/FRONTEND_BACKEND_SYNC_REQUIREMENTS.md`
- `docs/auto-builder-os/AUTO_SOCIAL_COMPLETION_REQUIREMENTS.md`
- `docs/auto-builder-os/generator/GENERATOR_MASTER_COMPLETION_PACKET.md`
- `docs/auto-builder-os/vercel/VERCEL_WORKFLOW_MASTER_COMPLETION_PACKET.md`
- `docs/auto-builder-os/vercel/VERCEL_SANDBOX_AND_5_MIN_CRON_COMPLETION_PACKET.md`
- `docs/auto-builder-os/validation/MASTER_COMPLETION_VALIDATION_TASK.md`

## File Governance

- Locked files may be updated only to clarify, tighten, or complete the master workflow.
- Locked files must not be bypassed by new planning docs.
- New docs must point back to the locked files instead of becoming a competing source of truth.
- If locked files conflict, use the source-truth order in `AGENT_WORKFLOW_LOCK.md`.

## Completion Rule

The system is not clean or lean until all agents route through this manifest, the workflow lock, the master TODO, and the receipt schema.
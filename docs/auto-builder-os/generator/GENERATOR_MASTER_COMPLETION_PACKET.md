# Generator Master Completion Packet

Date: 2026-06-07
Status: Mandatory generator input

## Mission

The AUTO BUILDER generator must complete `docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md`. It must not generate unrelated work, new features, redesigns, or replacement architecture until the checklist is complete or explicitly superseded by the operator.

## Source Truth

1. `docs/auto-builder-os/START_HERE_MASTER_COMPLETION_LOCK.md`
2. `docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md`
3. `docs/auto-builder-os/FINAL_DEFINITION_OF_DONE.md`
4. `docs/auto-builder-os/audits/2026-06-07/05_UPLOADED_FRONTEND_COMPLETION_AUDIT_AND_FINAL_HANDOFF.md`
5. PR #18 bridge clearance docs
6. Drive folder `AUTO BUILDER DOCS`

## Generator Rules

- Read Git and Drive before modifying anything.
- Work from the checklist in order unless a dependency requires reordering.
- Preserve frontend visual design.
- Do not mark an item complete without evidence.
- Do not use env-name presence alone as proof of connector readiness.
- Do not mutate production.
- Do not modify secrets.
- Do not publish social posts.
- Do not charge cards or alter billing.
- Do not perform Shopify/Stripe writes without approval.
- Do not send customer messages without approval.

## Required Generator Loop

For each checklist item:

1. Identify item ID and file path.
2. Determine whether item is complete, incomplete, blocked, or not applicable.
3. If incomplete, generate the smallest safe implementation packet.
4. Route code work to Vercel Workflow/Sandbox or Codex implementation lane.
5. Run validation.
6. Store receipt.
7. Update status matrix.
8. Move to the next checklist item.

## Generator Output Format

Every generator run must output:

- `run_id`
- `checklist_item`
- `phase`
- `files_changed`
- `actions_taken`
- `tests_run`
- `receipts`
- `blocked_items`
- `next_item`
- `approval_required`

## Build Packet Requirements

For every implementation item, generator must create:

- frontend plan
- backend plan
- database plan
- integration plan
- env-name plan
- validation plan
- rollback plan
- evidence plan

## Exit Criteria

Generator completion is valid only when:

- every master TODO item is complete, blocked with owner/action, or not applicable with evidence;
- all generated code builds;
- all smoke tests pass or hard-gate;
- all protected actions remain gated;
- evidence exists in Git and, when available, Drive.

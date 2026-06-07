# Vercel Workflow Master Completion Packet

Date: 2026-06-07
Status: Mandatory Vercel Workflow packet

## Mission

Use Vercel Workflow to execute the master completion checklist in `docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md` through sandbox-first, preview-first, approval-gated stages.

## Workflow Name

`auto-builder-master-completion`

## Trigger Sources

- manual dispatch
- generator dispatch
- five-minute cron validator
- PR update
- approved operator command

## Workflow Stages

1. `rehydrate_source_truth`
   - Read Git source docs.
   - Read Drive source docs.
   - Load PR #18 and PR #19 state.
   - Emit source-truth receipt.

2. `load_master_todo`
   - Parse `MASTER_SYSTEM_COMPLETION_TODO.md`.
   - Parse `FINAL_DEFINITION_OF_DONE.md`.
   - Emit checklist receipt.

3. `classify_items`
   - Mark each item pending, in_progress, complete, blocked, or not_applicable.
   - Do not infer completion without evidence.

4. `build_next_safe_item`
   - Select the next checklist item that can be safely advanced.
   - Route code work to sandbox/branch.
   - Preserve UI.

5. `run_static_validation`
   - Install.
   - Lint.
   - Typecheck.
   - Build.

6. `run_route_smoke`
   - Engine routes.
   - Project routes.
   - Workflow routes.
   - Gate routes.
   - Bridge routes.

7. `run_browser_smoke`
   - Desktop screenshot.
   - Mobile screenshot.
   - Console check.
   - No secret display.
   - No overlap check.

8. `run_connector_dry_runs`
   - GitHub.
   - Vercel.
   - Supabase dev.
   - Drive read/write where available.
   - Google Chat.
   - n8n.
   - HeyGen.
   - Higgsfield.
   - Metricool.
   - Shopify read-only.
   - Xyla.
   - Gmail/Calendar OAuth gate.

9. `record_evidence`
   - Store receipts.
   - Upload artifacts.
   - Comment PR.
   - Update status matrix.

10. `release_hold`
    - Stop before production deploy.
    - Stop before production DB migration.
    - Stop before secret changes.
    - Stop before commerce/payment/social/customer-message actions.

## Protected Action Policy

All Class 2+ actions require explicit approval:

- production deploy
- production database mutation
- secret mutation
- commerce/payment write
- live social publish
- customer message
- destructive action
- external spend
- credentialed browser action

## Required Receipts

- source truth receipt
- checklist parse receipt
- build receipt
- route smoke receipt
- browser smoke receipt
- connector dry-run receipt
- hard-gate receipt if blocked
- approval receipt where required
- release-hold receipt

## Success Criteria

Workflow succeeds only when it produces a current status matrix with every item complete, blocked, or not applicable with evidence.

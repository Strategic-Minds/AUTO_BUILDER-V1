# AUTO BUILDER OS - Lean System Output Contract

Date: 2026-06-07
Status: Mandatory output contract

## Purpose

Define exactly what AUTO BUILDER must produce. This prevents bloated planning loops, scattered documents, and local-only proof.

## Product Output

AUTO BUILDER OS must produce a clean, lean, repeatable autonomous build operating system that turns an approved idea or project request into:

1. source-truth inspection
2. benchmark/discovery packet when needed
3. build packet
4. repo-backed implementation
5. Vercel preview/build evidence
6. Supabase dev persistence evidence when data is involved
7. browser/API/connector smoke evidence
8. approval-gated release hold
9. rollback record
10. operating/optimization loop

## Runtime Output Per Agent Run

Each run must produce exactly one primary output:

- `repo_file_created`
- `repo_file_updated`
- `checklist_item_completed`
- `validation_receipt_created`
- `hard_gate_recorded`
- `approval_request_created`
- `implementation_branch_prepared`
- `preview_or_build_evidence_recorded`
- `rollback_or_release_hold_recorded`

If none of these happen, the run must explain the blocker and the next exact repo artifact needed.

## Required Evidence

Every completed item must include at least one concrete evidence type:

- repo path
- commit SHA
- PR URL
- Vercel deployment/build receipt
- Supabase dev-branch/advisor receipt
- browser screenshot receipt
- API smoke receipt
- connector dry-run receipt
- hard-gate receipt
- approval receipt
- rollback note

## Invalid Outputs

The following are not valid completion outputs:

- local-only app proof
- local-only server start
- strategy-only response
- new architecture idea
- repeated plan with no repo artifact
- mock data called live
- sample output called complete
- env-name presence called connector proof
- unrun command called validation
- unapproved live mutation

## User-Friendly Output Standard

The operator-facing system must always make these visible:

- what phase the system is in
- what item is being completed
- what is verified
- what remains blocked
- what evidence exists
- what approval is needed
- what happens next

## Clean And Lean Standard

AUTO BUILDER should prefer:

- fewer control files with stronger authority
- one master TODO
- one workflow lock
- one evidence policy
- one protected action policy
- one status matrix
- one receipt schema
- one implementation branch per major lane

Do not create overlapping docs unless they serve a missing required control surface.

## Finish Standard

The system is finished only when `FINAL_DEFINITION_OF_DONE.md` is satisfied and the master TODO has evidence-backed complete, not-applicable, or hard-gated status for every required item.
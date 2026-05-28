# SOL Dehydrate and Rehydrate Protocol

Project: SOL Persistent Live Avatar Assistant v1
Repo: Strategic-Minds/AUTO_BUILDER
Mode: governed continuity preservation

## Purpose
Preserve operational continuity across AUTO BUILDER, AUTO BUILDER 2, ChatGPT sessions, staging runs, preview deployments, and incident recovery cycles.

## Continuity Preservation Rules
- Record phase and step before ending work.
- Record verified facts separately from inferred notes.
- Record blockers, workarounds, and self-heal results.
- Record commit SHAs and evidence links.
- Record unresolved decisions and approval gaps.
- Never rely on memory alone when repo evidence exists.

## Session Restart Rules
On every new session:
1. Read MASTER_INDEX.md.
2. Read AUTO_BUILDER_FULL_STACK_BUILD_PACKET.md.
3. Read EXECUTION_LEDGER.md.
4. Confirm current phase and step.
5. Confirm latest commit or branch state.
6. Identify open blockers.
7. Resume only from the next documented action.

## Required Dehydrate Format
PHASE / STEP:
Verified:
Inferred:
Could Not Verify:
Current Action:
Block:
Workaround:
Self-Heal Result:
Validation:
Evidence:
Next GPT Instruction:

## Runtime Recovery Flow
1. Pause current automation.
2. Read latest ledger entry.
3. Identify last known passing state.
4. Compare expected state to actual state.
5. Restore from rollback checkpoint if needed.
6. Re-run the smallest safe validation.
7. Update EXECUTION_LEDGER.md.
8. Resume only after validation passes.

## Approval Preservation
For any gated action, preserve:
- Approver
- Timestamp UTC
- Scope
- Target environment
- Evidence link
- Related commit SHA
- Rollback reference

## Post-Rehydrate Validation
Before continuing execution, confirm:
- Correct repo and folder.
- Correct project name.
- Correct runtime mode.
- Current branch and commit.
- Approval state.
- Rollback path.
- Open blockers.

## Stop Conditions
Stop rehydration if:
- Project target is ambiguous.
- Approval state is missing.
- Evidence is inconsistent.
- Branch state cannot be verified.
- Rollback path is missing for a risky action.

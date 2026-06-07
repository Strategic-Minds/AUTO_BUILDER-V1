# AUTO BUILDER OS - Repeatable Agent Runbook

Date: 2026-06-07
Status: Mandatory runbook

## Purpose

Make every AUTO BUILDER run repeatable, user-friendly, and evidence-backed.

## Run Loop

### 1. Read Locks

Read these first:

1. `START_HERE_MASTER_COMPLETION_LOCK.md`
2. `AGENT_WORKFLOW_LOCK.md`
3. `LEAN_SYSTEM_OUTPUT_CONTRACT.md`
4. `MASTER_SYSTEM_COMPLETION_TODO.md`
5. `FINAL_DEFINITION_OF_DONE.md`
6. `SYSTEM_STATUS_MATRIX.md`
7. `BUILD_EVIDENCE_REQUIREMENTS.md`
8. `PROTECTED_ACTION_POLICY.md`

### 2. Select One Item

Choose the highest-priority incomplete TODO item unless the operator names a specific item.

Do not open a second work lane unless the operator explicitly asks for parallel work or the second task is required to unblock the first.

### 3. Inspect Source Truth

Inspect the relevant repo files and connected surfaces before changing anything.

Minimum inspection:

- target repo path
- target branch or PR
- relevant lock doc
- relevant checklist section
- relevant source file or missing file
- current evidence or blocker state

### 4. Create Or Update Repo Artifact

Create or update the smallest repo artifact that advances the selected TODO item.

Preferred artifact types:

- source file
- route
- schema
- test
- smoke script
- requirement doc
- evidence doc
- status matrix update
- PR evidence comment

### 5. Validate

Run or record the best available validation.

Required validation classes by work type:

- docs: source-truth consistency and checklist alignment
- frontend: install, lint, typecheck, build, desktop/mobile browser smoke
- backend/API: route smoke, error handling, auth/gate behavior
- Supabase: dev branch migration, RLS/policy/advisor evidence
- connectors: read/status, harmless dry-run, hard-gate receipt, approval state
- Vercel: preview/build receipt and non-mutating validator path

### 6. Record Receipt

Every run must produce a receipt shape matching `WORKFLOW_RECEIPT_SCHEMA.json` or explain why no receipt could be created.

### 7. Update Status

Update the relevant checklist/status/evidence surface when repo write access is available.

Status values:

- `pending`
- `in_progress`
- `complete`
- `blocked`
- `not_applicable`

### 8. Stop At Gate Or Continue

Continue to the next safe repo artifact only if it advances the same selected item and does not require protected approval.

Stop and ask for approval when the next action touches:

- production deploy
- production database mutation
- secret mutation
- commerce/payment mutation
- live social publish
- customer message
- destructive action
- external spend
- credentialed browser action

## Required Final Response

Every substantial response must include:

```text
PHASE:
STEP:
TODO item:

VERIFIED:

INFERRED:

COULD NOT VERIFY:

BLOCKERS:

WORKAROUNDS:

NEXT ACTIONS:
```

## Repeatability Check

Before ending a run, confirm:

- one selected item is named
- one primary output is named
- evidence or blocker is named
- next action is concrete
- no local-only proof is presented as done
- no protected mutation occurred without approval
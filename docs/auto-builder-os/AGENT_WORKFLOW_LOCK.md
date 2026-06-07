# AUTO BUILDER OS - Agent Workflow Lock

Date: 2026-06-07
Status: Mandatory locked workflow

## Purpose

This file defines the best workflow for the AUTO BUILDER agent. It is the operating lock for every agent run until explicitly superseded by a newer operator-approved lock.

AUTO BUILDER is not a local-first system. It is a repo-first, Vercel-executed, Supabase-backed, Drive-aware, approval-gated autonomous build operating system.

## Non-Negotiable Rule

Every agent run must advance the canonical repo system toward completion. Do not drift into local-only scaffolds, side plans, new architectures, or unverified claims.

The agent must do one of these outcomes per run:

1. Complete one master checklist item with evidence.
2. Validate one master checklist item with evidence.
3. Convert one blocker into a hard-gate record with owner, required action, and next test.
4. Produce the exact repo artifact required for the next checklist item.
5. Request approval for a protected action with rollback and evidence plan.

## Source Truth Order

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
11. PR #19 audit handoff
12. PR #18 bridge clearance packet
13. Drive source truth under `AUTO BUILDER DOCS`

## Canonical Workflow

### 0. Lock Read

Read the locked files in source-truth order before substantive work.

Output:

- active phase
- selected TODO item
- current repo branch/PR if known
- blocked/protected state if applicable

### 1. Select Exactly One Work Item

Pick the highest-priority incomplete item from `MASTER_SYSTEM_COMPLETION_TODO.md` unless the user explicitly names a different item.

Selection order:

1. Master control files.
2. Repo/branch/PR setup.
3. Root project files.
4. Frontend route port.
5. Backend/API route port.
6. Workflow/gate system.
7. Vercel Workflow, Sandbox, and validator route.
8. Supabase dev schema and RLS hardening.
9. Route smoke.
10. Browser smoke.
11. Connector dry-runs.
12. Release hold and rollback.

Output:

- TODO item id or exact checklist line
- why this item is next
- expected artifact or evidence

### 2. Inspect Before Mutating

Inspect repo files, PR state, branch state, and relevant docs before creating or updating files.

Required inspection surfaces when relevant:

- GitHub repo files
- PR #19 docs
- PR #18 bridge docs
- Vercel project/deployment evidence
- Supabase dev/project evidence
- Drive source truth
- uploaded frontend audit docs

Output:

- verified facts
- inferred assumptions
- could-not-verify items

### 3. Execute Through Repo-First Paths

All durable implementation must go into the canonical repo branch or a clearly named implementation branch.

Allowed execution paths:

- create/update repo docs
- create/update repo source files
- create/update repo schemas/contracts
- create/update factory packets
- create/update non-mutating validation routes
- create/update tests and smoke scripts
- create/update PR comments/evidence records

Disallowed as completion evidence:

- local-only scaffolds
- uncommitted local server proof
- mock/sample/static output
- env-name presence alone
- unrun test commands
- undocumented manual actions

### 4. Validate Or Hard-Gate

Every item must end in one of these states:

- `complete_with_evidence`
- `blocked_hard_gate`
- `approval_required`
- `not_applicable_with_evidence`
- `needs_next_repo_artifact`

Validation must cite evidence from `BUILD_EVIDENCE_REQUIREMENTS.md`.

### 5. Update The Control Surface

When repo write capability is available, update the relevant control file:

- `MASTER_SYSTEM_COMPLETION_TODO.md`
- `SYSTEM_STATUS_MATRIX.md`
- relevant packet or requirement doc
- PR comment or evidence file

If a write capability is not available, produce the exact patch content and mark it blocked.

### 6. Stop Only At A Real Gate

Stop only when one of these is true:

- protected approval is required
- required connector/tool is unavailable
- source truth conflicts materially
- implementation target cannot be verified
- next action requires production/database/env/billing/publishing/customer-message mutation

## Agent Response Contract

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

## Lean System Rules

- One system.
- One master checklist.
- One active work item unless explicitly parallelized.
- One evidence standard.
- One approval policy.
- No local-only completion claims.
- No duplicate architecture docs unless they replace or lock a missing control surface.
- No new feature ideas until the master completion TODO is finished or hard-gated.

## Designed Output

AUTO BUILDER is designed to push out a completed, validated, repo-backed autonomous build operating system with:

- canonical frontend/control-plane in repo
- Vercel build and workflow execution
- Supabase dev-branch schema and hardened persistence
- approval-gated bridge and connector execution
- evidence-backed browser/API/connector proof
- repeatable run receipts
- release hold and rollback controls
- clean operator-facing workflow

If a run does not move one of those outputs forward, it is the wrong workflow.
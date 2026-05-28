# SOL System Source of Truth

Project: SOL Persistent Live Avatar Assistant v1
Repo: Strategic-Minds/AUTO_BUILDER
Mode: governed source-truth hierarchy

## Purpose
Define the canonical authority order and evidence hierarchy for SOL across planning, sandbox, staging, preview, and production.

## Canonical Authority Order
1. Current explicit Jeremy authorization in the active session.
2. Strategic Minds governance and AUTO BUILDER operating rules.
3. This repo folder: docs/sol-persistent-live-avatar.
4. Runtime evidence from connected systems.
5. Deployment logs and build artifacts.
6. Supabase schema state and RLS validation results.
7. Vercel preview or production runtime behavior.
8. GitHub commit history and pull request evidence.
9. Operator notes and inferred planning.

## Trusted Runtime Evidence Hierarchy
1. Live system response from the target runtime.
2. Build logs from the exact commit being reviewed.
3. Database schema and policy inspection from target environment.
4. Environment variable presence by name only.
5. API route validation output.
6. GitHub commit SHA and file contents.
7. Execution ledger entry.
8. Chat transcript or operator summary.

## Repo Truth Rules
- Repo docs define intended behavior.
- Repo code defines proposed implementation.
- Commit SHA identifies the reviewed state.
- Repo truth is not proof of runtime deployment.
- If repo and runtime conflict, runtime evidence wins for operational state.

## Runtime Truth Rules
- Runtime health checks prove current availability only.
- Runtime route tests prove behavior for the tested commit and environment only.
- Runtime logs are required for debugging and incident response.
- Runtime state must be tied to environment, commit, and timestamp.

## Deployment Truth Rules
- Preview deployment truth is separate from production truth.
- Production truth requires production URL, deployment ID, commit SHA, and approval evidence.
- Deployment success does not prove database safety, policy correctness, or approval compliance.
- Promotion requires all final deploy readiness gates.

## Evidence Conflict Resolution
When evidence conflicts:
1. Prefer current runtime evidence.
2. Prefer exact commit evidence over summaries.
3. Prefer system logs over operator notes.
4. Mark unverifiable claims as Could Not Verify.
5. Pause if conflict affects production, secrets, billing, public posting, or data integrity.

## Required Evidence Fields
Every operational claim should include:
- Environment
- Timestamp UTC
- Commit SHA or deployment ID
- System touched
- Result
- Evidence reference
- Approval state when relevant

## Stop Conditions
Stop execution when:
- Source truth is ambiguous.
- Runtime evidence contradicts repo assumptions.
- Approval state is missing.
- Production target is unclear.
- Rollback evidence is absent for a risky action.

# SOL Operational Phase Map

Project: SOL Persistent Live Avatar Assistant v1
Mode: governed lifecycle progression

## Purpose
Define operational phases, validation checkpoints, and promotion criteria from planning through production.

## Phase Overview

| Phase | Purpose | Allowed Scope | Promotion Requirement |
|---|---|---|---|
| Planning | Design, governance, documentation | Read only planning | Intake docs complete |
| Sandbox | Disposable validation | Local or isolated checks | Sandbox validation passes |
| Staging | Controlled environment testing | Staging only mutations | Staging validation passes |
| Preview | Deployment validation | Preview runtime only | Preview validation passes |
| Production | Live runtime | Approved production operations | Explicit approval evidence |

## Phase 1 - Planning
### Purpose
Create architecture, governance, workflows, rollback planning, and validation docs.

### Required Validation Checkpoints
- Governance docs exist.
- Rollback plan exists.
- Approval gates exist.
- Source truth hierarchy exists.
- Intake folder is indexed.

### Promotion Criteria
- MASTER_INDEX.md complete.
- Governance framework complete.
- Human direction confirmed.

## Phase 2 - Sandbox
### Purpose
Validate builds and logic in disposable runtime.

### Allowed Actions
- Dependency install.
- Type checks.
- Build checks.
- Policy gate tests.
- Health route tests.
- Draft SQL review.

### Required Validation Checkpoints
- Build passes.
- Policy gate blocks unsafe prompts.
- Environment variables validated by name.
- Rollback checkpoints documented.
- Evidence logged.

### Promotion Criteria
- SANDBOX_BUILD_RUNBOOK.md validation complete.
- No unresolved blocker affecting staging.
- Approval captured for staging mutation if required.

## Phase 3 - Staging
### Purpose
Validate integrated behavior in controlled environment.

### Allowed Actions
- Staging preview deploy.
- Staging SQL execution.
- OpenAI route validation.
- Limited HeyGen validation.

### Required Validation Checkpoints
- RLS validated.
- Auth validated.
- OpenAI route validated.
- HeyGen readiness validated.
- Approval gates active.
- Rollback path verified.

### Promotion Criteria
- STAGING_EXECUTION_CHECKLIST.md complete.
- PREVIEW_DEPLOY_VALIDATION.md ready.
- Human approval captured for preview promotion if required.

## Phase 4 - Preview
### Purpose
Validate deployment candidate before production.

### Allowed Actions
- Preview deployment testing.
- Health route validation.
- Chat route validation.
- Policy gate validation.
- Limited production-like checks.

### Required Validation Checkpoints
- Preview deployment stable.
- No unresolved route failures.
- Audit logging active.
- Secrets protected.
- Rollback plan validated.

### Promotion Criteria
- FINAL_DEPLOY_READINESS_GATE.md passes.
- STAGING_TO_PRODUCTION_PROMOTION.md reviewed.
- Explicit human approval evidence captured.

## Phase 5 - Production
### Purpose
Operate approved live runtime.

### Allowed Actions
- Approved runtime operations.
- Logged maintenance.
- Approved deployments.
- Approved rollback actions.

### Required Validation Checkpoints
- Production monitoring active.
- Audit logging active.
- Rollback path maintained.
- Approval evidence stored.
- Incident response process available.

### Production Stop Conditions
Stop production actions when:
- Approval evidence is missing.
- Runtime instability exists.
- Secrets are exposed.
- RLS validation fails.
- Rollback path is missing.
- Policy gate is bypassed.
- Production target is ambiguous.

## Cross Phase Rules
- Never skip a phase.
- Preserve evidence between phases.
- Revalidate after rollback.
- Keep staging and production isolated.
- Pause before irreversible actions.
- Record blocker, workaround, and self-heal results.

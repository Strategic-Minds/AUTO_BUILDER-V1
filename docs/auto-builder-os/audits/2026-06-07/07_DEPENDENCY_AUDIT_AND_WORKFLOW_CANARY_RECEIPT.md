# Dependency Audit And Workflow Canary Receipt

Date: 2026-06-07
Branch: `auto-builder/frontend-system-port-20260607`
Repository: `Strategic-Minds/AUTO_BUILDER`
PR: https://github.com/Strategic-Minds/AUTO_BUILDER/pull/20

## Purpose

Continue the frontend system port readiness lane after install/lint/typecheck/build passed. The next blocker was the dependency vulnerability count reported by `npm install`.

## Repo Changes Added For Repeatability

- Added `scripts/audit-dependencies.mjs`.
- Added `.github/workflows/dependency-audit.yml`.
- Added `.github/workflows/workflow-dependency-canary.yml`.

## Baseline Validation Still Passes

Latest baseline validation on the branch head that added the audit workflows:

- Workflow: `preview-validation`
- Run: `27086223597`
- Job: `validate-frontend-system-port`
- Job ID: `79941121801`
- Result: `success`
- Steps passed:
  - `npm install`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`

## Dependency Audit Result

Workflow: `dependency-audit`
Run: `27086223602`
Job: `audit-dependencies`
Job ID: `79941121784`
Result: `failure`

The failure is intentional and release-blocking because high vulnerabilities remain.

Summary printed by `scripts/audit-dependencies.mjs`:

- total: `18`
- critical: `0`
- high: `7`
- moderate: `2`
- low: `9`

High severity advisory cluster:

- `workflow`, direct dependency, fix suggested by npm audit: `workflow@2.0.6`
- `@workflow/cli`, transitive through workflow
- `@workflow/core`, transitive through workflow
- `@workflow/world-local`, transitive through workflow
- `@workflow/world-vercel`, transitive through workflow
- `devalue`, transitive through workflow
- `undici`, transitive through workflow

Moderate advisories:

- `next`, direct dependency, npm audit suggested fix path points to `next@9.3.3`, which is not a safe blind change for this Next 15 app.
- `postcss`, transitive through next.

Low advisories are all in `@workflow/*` transitive packages.

## Workflow Downgrade Canary

Workflow: `workflow-dependency-canary`
Run: `27086223609`
Job: `workflow-206-canary`
Job ID: `79941121793`
Result: `failure`

Canary steps:

- `npm install`: success
- temporary `npm install workflow@2.0.6 --no-save`: success
- `npm run lint`: success
- `npm run typecheck`: failure
- `npm run build`: skipped
- canary audit: skipped

Typecheck failure after installing `workflow@2.0.6`:

- `src/app/api/cron/recursive-control/route.ts(124,14): Cannot find module 'workflow/api' or its corresponding type declarations.`
- `src/app/api/workflows/awos-recursive-control/route.ts(57,14): Cannot find module 'workflow/api' or its corresponding type declarations.`

## Decision

Do not downgrade `workflow` blindly to `2.0.6`.

The package is used by live repo routes through `workflow/api`, and the audit-suggested version removes or fails to expose that API. A safe remediation must either:

1. identify a non-vulnerable workflow package version that still exposes `workflow/api`, then rerun install/lint/typecheck/build/audit, or
2. replace the `workflow/api` integration with a stable supported runtime path, then rerun install/lint/typecheck/build/audit, or
3. keep this as an explicit governed release blocker until the dependency owner accepts the risk.

## Release Status

Status: `BUILD VALIDATED, DEPENDENCY AUDIT BLOCKED`

This branch remains suitable for draft PR review and continued implementation work, but it is not release-ready.

## Next Required Move

Run a workflow runtime compatibility remediation pass. The first safe pass should inspect the current `workflow/api` integration and determine whether the system can move to a supported `workflow` package line without losing route behavior.

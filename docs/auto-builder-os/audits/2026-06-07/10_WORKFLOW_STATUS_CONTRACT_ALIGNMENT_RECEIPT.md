# Workflow Status Contract Alignment Receipt

Date: 2026-06-07
Branch: `auto-builder/frontend-system-port-20260607`
Repository: `Strategic-Minds/AUTO_BUILDER`
PR: https://github.com/Strategic-Minds/AUTO_BUILDER/pull/20

## Purpose

Align the public workflow status contract with the internal direct recursive-control runtime adopted after removing the external `workflow` package.

## Problem Found

After the internal-runtime replacement, `/api/workflows/status` still reported:

- `runtime: "vercel_workflow_contract"`
- a route list that did not describe the repo-owned recursive-control, queue-runner, bridge, telemetry, and health surfaces now carrying the runtime path

That could mislead an operator into expecting generated `.well-known/workflow` runtime routes even though those routes were intentionally removed with the package.

## Repo Change

Updated `src/lib/autobuilder/runtime-contracts.ts` so `workflowContract()` now reports:

- `runtime: "internal_direct_recursive_control"`
- `generatedWorkflowRoutes: "not_required_workflow_package_removed"`
- required runtime routes owned by this repo:
  - `/api/workflows/status`
  - `/api/workflows/awos-recursive-control`
  - `/api/cron/recursive-control`
  - `/api/factory/queue-runner`
  - `/api/bridge/queue`
  - `/api/bridge/dispatch`
  - `/api/runtime/telemetry`
  - `/api/runtime/health`

## Operating Decision

The branch should not depend on the external workflow runtime or generated `.well-known/workflow` routes. The recursive loop is now a repo-owned internal control-plane path and must stay validated by install, lint, typecheck, build, dependency audit, workflow canary, preview health, queue-runner evidence, and connector dry-runs.

## Validation Requirement

This receipt is complete only after the final commit passes:

- preview validation
- dependency audit
- internal runtime canary
- bridge/browser smoke
- Vercel preview deployment
- `/api/workflows/status` smoke showing `internal_direct_recursive_control`

## Release Status

Status: `CONTRACT ALIGNED, FINAL VALIDATION REQUIRED`

PR #20 should remain draft until connector readiness, Supabase hardening, browser desktop/mobile evidence, connector dry-runs, release hold, and rollback receipt are complete.

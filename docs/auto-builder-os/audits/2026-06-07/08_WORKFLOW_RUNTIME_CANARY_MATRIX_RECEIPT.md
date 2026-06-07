# Workflow Runtime Canary Matrix Receipt

Date: 2026-06-07
Branch: `auto-builder/frontend-system-port-20260607`
Repository: `Strategic-Minds/AUTO_BUILDER`
PR: https://github.com/Strategic-Minds/AUTO_BUILDER/pull/20

## Purpose

Continue the dependency-audit remediation lane without redesigning the canonical frontend/control-plane. The goal was to test whether the `workflow` dependency blocker can be resolved by moving to another published package line while preserving the current `workflow/api` runtime contract.

## Repo Change

Updated `.github/workflows/workflow-dependency-canary.yml` into a matrix canary with these lanes:

- `workflow@3`
- `workflow@latest`
- `workflow@2.0.6`

The canary now checks:

1. `npm install`
2. temporary canary install without saving to `package.json`
3. resolved package reporting
4. `workflow/api` import and `start` export verification
5. `npm run lint`
6. `npm run typecheck`
7. `npm run build`
8. `node scripts/audit-dependencies.mjs`

## Latest Branch Head Tested

Commit: `0854853aff21511c70435c60126758181511087a`

## Baseline Validation

Workflow: `preview-validation`
Run: `27086422939`
Job: `validate-frontend-system-port`
Job ID: `79941679280`
Result: `success`

Passed steps:

- `npm install`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Dependency Audit Gate

Workflow: `dependency-audit`
Run: `27086422942`
Job: `audit-dependencies`
Job ID: `79941679270`
Result: `failure`

Summary:

- total: `18`
- critical: `0`
- high: `7`
- moderate: `2`
- low: `9`

The failure is intentional and release-blocking because high vulnerabilities remain.

## Canary Matrix Results

Workflow: `workflow-dependency-canary`
Run: `27086422951`
Result: `failure`

### `workflow@3`

Job ID: `79941679352`
Result: `failure`
Failure point: canary package install

Evidence:

- `npm install workflow@3 --no-save` failed with `ETARGET`.
- npm reported `No matching version found for workflow@3`.

Decision: `workflow@3` is not a viable package target from the current registry evidence.

### `workflow@2.0.6`

Job ID: `79941679347`
Result: `failure`
Failure point: `workflow/api` import verification

Evidence:

- `npm install workflow@2.0.6 --no-save` succeeded, but npm warned the package is unsupported and says to upgrade to a version `>=3`.
- `npm ls workflow --depth=0` reported `workflow@2.0.6 invalid: "^4.0.1-beta.26" from the root project`.
- `node -e "import('workflow/api')..."` failed with `ERR_MODULE_NOT_FOUND` for `node_modules/workflow/api`.

Decision: `workflow@2.0.6` is not viable because it removes or fails to expose the API used by the current cron and manual workflow routes.

### `workflow@latest`

Job ID: `79941679348`
Result: `failure`
Failure point: dependency audit

Evidence:

- `workflow@latest` resolved to `workflow@4.3.1`.
- `workflow/api` import and `start` export verification passed.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `node scripts/audit-dependencies.mjs` failed with the same high-severity workflow cluster.

Decision: `workflow@latest` preserves runtime compatibility but does not remediate the dependency audit gate.

## Final Decision

Version choice alone does not currently finish this blocker.

- The audit-suggested `workflow@2.0.6` downgrade is runtime-incompatible.
- The expected supported major line `workflow@3` is not available from the registry evidence in this canary.
- The current/latest `workflow@4.3.1` line preserves build/runtime compatibility but remains audit-blocked.

## Release Status

Status: `BUILD VALIDATED, WORKFLOW DEPENDENCY BLOCKED`

PR #20 must remain draft. The frontend/control-plane port can continue review and hardening, but it is not operationally release-ready while high vulnerabilities remain.

## Next Required Move

Move from package-version remediation to runtime replacement or dependency-owner escalation:

1. inspect the current `workflow/api` runtime surface and generated `.well-known/workflow` routes,
2. decide whether the durable workflow layer can be replaced with an internal queue-runner/control-plane path already present in this repo,
3. if replacement is safe, patch both `workflow/api` callers and remove the vulnerable dependency,
4. if replacement is not safe, keep `workflow` as an explicit governed release blocker and continue connector readiness only in draft/preview mode.

# Dependency And Security Review - 18 Finding Intake

## Status

Mapped from connected GitHub Actions audit evidence and Vercel build logs. Remediation remains blocked on workflow runtime replacement or explicit governed risk acceptance.

## Scope Lock

This review is part of Wave 0/1 hardening only. Keep it focused on:

- GitHub evidence and branch safety.
- Vercel deployment/runtime evidence.
- Supabase receipt persistence safety.

Do not use this review to widen provider adapters beyond GitHub, Vercel, and Supabase receipt persistence.

## Evidence Sources

Verified current PR #25 build evidence:

- Vercel deployment `dpl_9kmosgq4xvLj2CYNnpZcgyGfwrzN` installed dependencies and reported 18 vulnerabilities: 9 low, 2 moderate, 7 high.
- Vercel build completed successfully after the audit warning.

Verified prior audit artifact used for exact mapping:

- PR #20 dependency-audit workflow run `27086422942`, job `79941679270`.
- Audit receipt file: `docs/auto-builder-os/audits/2026-06-07/07_DEPENDENCY_AUDIT_AND_WORKFLOW_CANARY_RECEIPT.md` on branch `auto-builder/frontend-system-port-20260607`.
- Canary matrix receipt file: `docs/auto-builder-os/audits/2026-06-07/08_WORKFLOW_RUNTIME_CANARY_MATRIX_RECEIPT.md` on branch `auto-builder/frontend-system-port-20260607`.

Important limitation:

- `package-lock.json` is not committed on the PR #25 branch, so exact transitive resolution is derived from connected workflow/Vercel install evidence rather than a durable lockfile in this branch.
- Local npm reproduction was blocked by the runtime network policy, so this document treats connected GitHub Actions and Vercel logs as the current evidence source.

## Current Verified Package Surface

From `package.json` on `auto-builder/mcp-universe-build-20260608`:

- Next.js `^15.3.3`
- React `^19.1.0`
- `@supabase/supabase-js` `^2.49.8`
- `@vercel/sandbox` `^1.8.0`
- `@modelcontextprotocol/sdk` `^1.26.0`
- `mcp-handler` `^1.1.0`
- Playwright `^1.53.0`
- `workflow` `^4.0.1-beta.26`
- Zod `^3.25.76`

## Finding Map

| Finding | Package / Area | Severity | Direct | Range | Fix Reported By Audit | Wave 0/1 Decision | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | `@workflow/cli` | high | no | `*` | `workflow@2.0.6` | blocked | Transitive through `workflow`; fix path is runtime-breaking. |
| 02 | `@workflow/core` | high | no | `*` | `workflow@2.0.6` | blocked | Transitive through `workflow`; fix path is runtime-breaking. |
| 03 | `@workflow/world-local` | high | no | `<=5.0.0-beta.12` | `workflow@2.0.6` | blocked | Transitive through `workflow`; fix path is runtime-breaking. |
| 04 | `@workflow/world-vercel` | high | no | `<=5.0.0-beta.10` | `true` | blocked | Transitive through `workflow`; must validate runtime before any change. |
| 05 | `devalue` | high | no | `<=5.8.0` | `workflow@2.0.6` | blocked | Transitive through `workflow`; fix path is runtime-breaking. |
| 06 | `undici` | high | no | `7.0.0 - 7.23.0` | `workflow@2.0.6` | blocked | Transitive through `workflow`; fix path is runtime-breaking. |
| 07 | `workflow` | high | yes | `>=4.0.1-beta.0` | `workflow@2.0.6` | hard gate | Direct dependency and root of high cluster. |
| 08 | `next` | moderate | yes | `9.3.4-canary.0 - 16.3.0-canary.5` | `next@9.3.3` | reject blind fix | Audit fix would downgrade a Next 15 app to Next 9. |
| 09 | `postcss` | moderate | no | `<8.5.10` | `next@9.3.3` | reject blind fix | Transitive through Next; fix path is not acceptable blindly. |
| 10 | `@workflow/astro` | low | no | `*` | `true` | hold | Transitive through `workflow`. |
| 11 | `@workflow/builders` | low | no | `*` | `true` | hold | Transitive through `workflow`. |
| 12 | `@workflow/nest` | low | no | `*` | `true` | hold | Transitive through `workflow`. |
| 13 | `@workflow/next` | low | no | `*` | `true` | hold | Transitive through `workflow`. |
| 14 | `@workflow/nitro` | low | no | `*` | `true` | hold | Transitive through `workflow`. |
| 15 | `@workflow/nuxt` | low | no | `*` | `true` | hold | Transitive through `workflow`. |
| 16 | `@workflow/rollup` | low | no | `*` | `true` | hold | Transitive through `workflow`. |
| 17 | `@workflow/sveltekit` | low | no | `*` | `true` | hold | Transitive through `workflow`. |
| 18 | `@workflow/vite` | low | no | `*` | `true` | hold | Transitive through `workflow`. |

## Canary Evidence

The audit-suggested direct fix was tested in PR #20 and is not safe as a blind downgrade.

- `workflow@2.0.6` installed but failed `workflow/api` import verification.
- Typecheck failed because current routes import `workflow/api`.
- `workflow@3` had no matching version in registry evidence.
- `workflow@latest` resolved to `workflow@4.3.1`, preserved `workflow/api`, lint, typecheck, and build, but still failed dependency audit.

Known `workflow/api` callers from the prior canary:

- `src/app/api/cron/recursive-control/route.ts`
- `src/app/api/workflows/awos-recursive-control/route.ts`

## Wave 0/1 Decision

Do not run `npm audit fix --force`.

Do not downgrade Next or Workflow blindly.

The only safe remediation lanes are:

1. Replace the `workflow/api` runtime with an internal queue-runner/control-plane path already present in the repo, then remove `workflow` and rerun install/lint/typecheck/build/audit.
2. Identify a non-vulnerable `workflow` package line that preserves `workflow/api`, then rerun the same validation gates.
3. Keep the dependency cluster as a governed release blocker with explicit risk acceptance; do not promote to production while high vulnerabilities remain.

## Next Evidence Needed

1. Inspect current PR #25 `workflow/api` usage and compare it to the PR #20 canary callers.
2. Decide whether Wave 0/1 needs the workflow runtime at all for GitHub, Vercel, and Supabase receipt persistence.
3. If not needed, draft a runtime-isolation/removal patch in a branch-safe PR.
4. If needed, keep the dependency issue as a hard release gate and continue only preview/read-only route evidence.
5. Re-run Vercel preview route probes after any dependency/runtime patch.

# AUTO_BUILDER Autonomous Package Loop

Date: 2026-07-03
Scope: AUTO_BUILDER V1 autonomous self-fix, self-heal, self-harden, and package loop.

## Mission

Turn AUTO_BUILDER from a manually triggered repair system into a governed self-operating loop:

`queue -> validate -> score -> fix -> retest -> harden -> retest -> package -> receipt -> next queue item`

The loop can progress autonomously only inside approved branch-safe and dry-run boundaries. Protected production actions remain blocked until explicit operator approval.

## Two-Lane Operation

### Autonomous Lane

Allowed by default when cron auth succeeds:

- rehydrate queue and current state
- generate validation plans
- run dry-run-safe workers when enabled
- score package readiness
- create branch-safe repair/hardening plans
- generate package candidates
- write branch/draft receipts when receipt persistence is explicitly enabled
- advance to ready-for-review state

### Protected Lane

Always requires explicit approval:

- production deploy
- protected branch merge
- destructive database change
- live Supabase write or execute
- secret creation or exposure
- DNS or domain change
- payment execution
- customer message or external publishing
- live Vercel cron/workflow activation

## Cron Family

- Every 5 minutes: `/api/cron/auto-builder`
  - queue heartbeat
  - approval refresh
  - stale job detection
  - package-loop state refresh

- Every 15 minutes: `/api/cron/auto-builder-reconcile`
  - artifact sync planning
  - receipt normalization planning
  - registry reconciliation planning

- Twice daily: `/api/cron/auto-builder-full-validate`
  - full validation planning
  - score regeneration
  - drift audit planning
  - hardening review planning

- Nightly: `/api/cron/auto-builder-nightly`
  - repair queue drain planning
  - hardening queue drain planning
  - package candidate generation
  - morning summary inputs

## Cron Auth Tokens

Staging and production cron requests must be signed with one of these approved env values:

- `CRON_SECRET`
- `AUTO_BUILDER_CRON_TOKEN`
- `CRON_API_TOKEN`
- `EPOXY_CRON_SECRET`

Accepted request headers:

- `Authorization: Bearer <token>`
- `x-cron-token: <token>`
- `x-cron-secret: <token>`

Without one of those env values, cron routes are open only in local development and fail closed outside local development.

## Worker Execution

The loop plans worker execution by default. It executes workers only when one of these is true:

- request query includes `executeWorkers=1`
- `AUTO_BUILDER_AUTONOMOUS_WORKERS_ENABLED=1`
- cadence-specific enablement is set, such as `AUTO_BUILDER_FULL_VALIDATE_WORKERS_ENABLED=1` or `AUTO_BUILDER_NIGHTLY_WORKERS_ENABLED=1`

Even when workers execute, PR #75 makes the adapters dry-run safe unless `AUTO_BUILDER_MODE=live` and receipt persistence is explicitly enabled.

## Supabase Persistence

The forward migration draft is in:

`supabase/migrations/20260703110000_autonomous_package_loop.sql`

The rollback migration draft is in:

`supabase/migrations/20260703110001_autonomous_package_loop_rollback.sql`

The forward migration defines:

- `automation_queue`
- `automation_runs`
- `automation_jobs`
- `automation_scorecards`
- `automation_repair_queue`
- `automation_hardening_queue`
- `automation_package_candidates`
- `automation_approvals`
- `automation_receipts`

Persistence is disabled unless:

- `AUTO_BUILDER_AUTONOMOUS_LOOP_PERSISTENCE_ENABLED=1`
- and, for dry-run receipt writes, `AUTO_BUILDER_RECEIPT_WRITES_ENABLED=1`

## Package Done Standard

A package can be called ready for operator review only when:

- final score is at or above `AUTO_BUILDER_PACKAGE_READY_SCORE`, default `90`
- lint/typecheck/build validation passes
- hardening validator passes
- Vercel preview is green
- no critical protected blocker is hidden
- rollback strategy exists
- package manifest exists
- receipts exist
- protected action approvals are explicit

A package is not production-ready until merge/deploy/live cron/live Supabase gates are approved and verified.

## Rollback

Branch-safe rollback:

- close the draft PR
- discard the package-loop branch
- revert the PR if it is later merged

Vercel rollback:

- revert `vercel.json` cron additions
- redeploy previous approved deployment

Supabase rollback:

- do not apply the migration until reviewed
- review `20260703110001_autonomous_package_loop_rollback.sql` before staging application
- apply rollback only in staging first, with backup/restore evidence and an approval receipt

## Validation

Run:

```bash
npm run validate:package-loop
npm run validate:hardening
npm run secret-scan:lite
npm run typecheck
npm run build
```

The loop is intentionally not allowed to call itself done without executable evidence.

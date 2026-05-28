# SOL Sandbox Build Runbook

Project: SOL Persistent Live Avatar Assistant v1
Environment: sandbox and staging first

## Purpose
Provide a safe build order for AUTO BUILDER and AUTO BUILDER 2 before any production deployment.

## Sandbox Build Order
1. Confirm repo branch and base commit.
2. Import or update SOL app files.
3. Confirm package files exist.
4. Install dependencies in disposable runtime.
5. Run type check.
6. Run lint if configured.
7. Run build.
8. Validate environment variable presence by name only.
9. Test health route.
10. Test OpenAI chat route with safe prompt.
11. Test policy gate blocked response.
12. Validate Supabase staging SQL in review mode.
13. Apply SQL only to staging after approval.
14. Confirm HeyGen avatar readiness before video test.
15. Run one short HeyGen staging test only after entitlement is confirmed.
16. Record all evidence in EXECUTION_LEDGER.md.

## Failure Recovery Flow
1. Stop the current build step.
2. Record exact failing command or check.
3. Classify the failure as dependency, TypeScript, env, OpenAI, HeyGen, Supabase, Vercel, policy, or unknown.
4. Apply smallest safe patch.
5. Re-run only the failed check and direct dependencies.
6. Update blocker, workaround, and self-heal result.
7. Escalate if the same failure repeats twice.

## Rollback Checkpoints
- Branch base commit before changes.
- Last known passing commit.
- Staging database pre-migration state.
- Environment variable change log by variable name only.
- Preview deployment URL and timestamp.
- Workflow pause method.

## Evidence Logging Rules
Each build run must record:
- Timestamp UTC
- Branch
- Commit SHA
- Command or check performed
- Result
- Error summary if failed
- Fix applied
- Rollback path
- Approval state

## Sandbox Stop Conditions
Pause before:
- Production deploy
- Production SQL
- Billing or subscription changes
- Shopify live changes
- Public posting or scheduling
- Bulk outbound messages
- Destructive rollback
- Repeated cost-bearing video generation

## Validation Complete Criteria
Sandbox build is complete only when:
- Install passes.
- Type check passes.
- Build passes.
- Health route passes.
- Chat route passes.
- Policy gate passes.
- Supabase staging plan is validated.
- HeyGen readiness is documented.
- Rollback path exists.
- Evidence is logged.

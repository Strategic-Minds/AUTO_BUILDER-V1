# SOL Staging To Production Promotion

Project: SOL Persistent Live Avatar Assistant v1
Environment Flow: sandbox -> staging -> preview -> production

## Purpose
Define the controlled promotion sequence from staging validation into production.

## Promotion Sequence
1. Complete sandbox validation.
2. Complete staging validation.
3. Complete preview deployment validation.
4. Capture approval evidence.
5. Confirm rollback readiness.
6. Promote environment variables.
7. Promote approved build.
8. Validate production health.
9. Monitor logs and policy gates.
10. Pause before enabling expanded automation.

## Environment Promotion Rules
- Never reuse staging secrets as production secrets unless explicitly approved.
- Promote variables by name only.
- Verify production URLs separately.
- Keep service role keys server only.
- Confirm SOL_READ_ONLY_MODE and SOL_REQUIRE_APPROVALS state before promotion.

## OpenAI Production Promotion
Before production:
- Confirm OpenAI route passes in preview.
- Confirm policy gate blocks unsafe requests.
- Confirm structured errors work.
- Confirm no secret leakage.
- Confirm rate limiting and auth are active.

## HeyGen Production Promotion
Before production:
- Confirm avatar readiness.
- Confirm voice compatibility.
- Confirm entitlement for video generation.
- Confirm entitlement for streaming if enabled.
- Confirm approval gate for repeated generation.
- Start with limited production testing only.

## Supabase Production Safeguards
- Review production SQL separately.
- Confirm RLS on all user facing tables.
- Confirm rollback snapshot exists.
- Confirm backup or restore process exists.
- Confirm service role isolation.
- Pause before destructive SQL.

## Audit Logging Verification
Confirm production logging captures:
- Timestamp UTC
- Environment
- Action
- Actor
- Result
- Blocker
- Workaround
- Rollback path
- Evidence reference

## Rollback Readiness
Before production:
- Record last known passing commit.
- Record deployment identifier.
- Record rollback branch or commit.
- Confirm workflow pause method.
- Confirm incident owner.
- Confirm recovery communication path.

## Explicit Production Stop Conditions
Do not promote if:
- Preview checks fail.
- Approval evidence is missing.
- Audit logging is incomplete.
- Rollback path is missing.
- RLS validation is incomplete.
- Secrets are exposed.
- OpenAI route instability exists.
- HeyGen entitlement is unresolved.
- Production environment target is unclear.

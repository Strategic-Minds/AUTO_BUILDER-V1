# SOL Final Deploy Readiness Gate

Project: SOL Persistent Live Avatar Assistant v1
Repo: Strategic-Minds/AUTO_BUILDER
Mode: final gate before production promotion

## Purpose
This document defines the final validation gates required before SOL moves from staging or preview into production.

## Final Validation Gates
All gates must pass before production promotion:

1. Preview build passes.
2. Health route passes.
3. OpenAI chat route passes.
4. Policy gate blocks restricted requests.
5. Authentication plan is active.
6. Rate limiting is active.
7. Supabase RLS is validated.
8. HeyGen avatar readiness is confirmed.
9. HeyGen voice mapping is confirmed.
10. Audit logging is active.
11. Rollback path is verified.
12. Human approval evidence is captured.

## Production Approval Evidence Requirements
Record the following before production action:

- Approver name
- Approval timestamp UTC
- Approved scope
- Target environment
- Commit SHA
- Preview URL
- Rollback plan reference
- Known risks
- Stop conditions reviewed

## Rollback Readiness Checks
Before production promotion, confirm:

- Last known passing commit is recorded.
- Preview deployment URL is recorded.
- Staging database snapshot or restore point is recorded.
- Environment variable changes are documented by variable name only.
- Scheduled jobs can be paused.
- Production promotion can be reverted.
- Incident owner is identified.

## OpenAI Production Validation
- OPENAI_API_KEY exists only in approved secret storage.
- OPENAI_MODEL is set.
- Input validation is active.
- Client supplied system messages are stripped.
- Errors do not expose secrets.
- Policy gate runs before model execution.

## HeyGen Production Validation
- HEYGEN_API_KEY exists only in approved secret storage.
- HEYGEN_SOL_AVATAR_ID is ready.
- HEYGEN_SOL_VOICE_ID is compatible.
- Video generation entitlement is confirmed.
- Streaming entitlement is confirmed if live streaming is enabled.
- Cost-bearing use is approval gated.

## Supabase Production Safeguards
- Production SQL is reviewed separately from staging SQL.
- RLS is enabled before user-facing access.
- Service role key is server only.
- Production database backup or restore plan exists.
- Migration order is documented.
- Rollback path is documented.

## Audit Logging Verification
Confirm logs capture:

- Timestamp UTC
- Actor
- Runtime mode
- Environment
- Action
- Result
- Blocker
- Workaround
- Rollback path
- Evidence reference

## Explicit Production Stop Conditions
Stop production promotion if:

- Any final validation gate fails.
- Human approval evidence is missing.
- RLS is incomplete.
- Secrets are exposed.
- Rollback path is missing.
- HeyGen entitlement is unverified.
- OpenAI route returns unresolved errors.
- Audit logging is incomplete.
- Production environment target is ambiguous.

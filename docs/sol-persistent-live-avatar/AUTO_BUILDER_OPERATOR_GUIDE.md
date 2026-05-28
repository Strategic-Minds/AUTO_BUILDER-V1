# AUTO BUILDER Operator Guide

Project: SOL Persistent Live Avatar Assistant v1
Repo: Strategic-Minds/AUTO_BUILDER
Mode: governed staging first

## Operator Responsibilities
- Maintain staging first discipline.
- Use evidence before assumptions.
- Log every build, test, blocker, workaround, and rollback.
- Keep production actions behind approval checkpoints.
- Keep secrets out of commits, logs, screenshots, and docs.
- Separate verified facts from inferred planning notes.

## Staging First Workflow
1. Read the full intake folder.
2. Confirm current phase and step.
3. Confirm branch and base commit.
4. Validate environment variables by name only.
5. Run sandbox checks.
6. Run preview checks.
7. Record evidence.
8. Pause before production promotion.

## Approval Escalation Logic
Escalate for human approval before:
- Production deploy.
- Production SQL.
- Billing change.
- Shopify live edit.
- Public post or schedule.
- Bulk outbound message.
- Destructive rollback.
- Repeated cost bearing media generation.

## Policy Gate Behavior
- Screen user requests before model or media generation.
- Block unsafe or out of scope requests.
- Rewrite risky requests into safe, platform aware alternatives.
- Log policy decisions without recording secrets.
- Keep Eden Skye fictional, adult coded, non identifiable, platform safe, and luxury editorial.

## OpenAI Governance
- Validate input size and shape.
- Strip client supplied system messages.
- Use the approved SOL system prompt.
- Return structured errors.
- Do not expose prompts, keys, or internal secrets.
- Log failures with concise evidence.

## HeyGen Governance
- Confirm avatar readiness before testing.
- Confirm voice compatibility before generation.
- Treat generation and streaming as cost bearing actions.
- Run one short staging test first.
- Pause before repeated generation or public use.

## Audit Logging Standards
Each entry must include:
- Timestamp UTC
- Phase and step
- System touched
- Action taken
- Actor
- Result
- Blocker
- Workaround
- Rollback path
- Evidence link or commit SHA

## Runtime Safety Controls
- Keep SOL_READ_ONLY_MODE enabled until approved.
- Keep SOL_REQUIRE_APPROVALS enabled.
- Enforce server only handling for service keys.
- Use RLS for user data.
- Rate limit public routes before production.
- Require authentication before persistent memory.

## Rollback Authority
Operators may prepare rollback plans in staging.
Destructive rollback requires approval unless needed to stop an active incident in staging.
Production rollback requires explicit approval and evidence capture.

## Production Stop Conditions
Stop before production when:
- Preview checks have not passed.
- RLS has not been validated.
- Secrets are missing or exposed.
- HeyGen entitlement is unverified.
- OpenAI route errors are unresolved.
- Rollback path is missing.
- Approval evidence is missing.

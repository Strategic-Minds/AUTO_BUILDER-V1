# SOL Workflow Specs Safe

Project: SOL Persistent Live Avatar Assistant v1
Repo: Strategic-Minds/AUTO_BUILDER
Folder: docs/sol-persistent-live-avatar
Mode: governed staging first build plan

## Purpose
This document gives AUTO BUILDER and AUTO BUILDER 2 a simple execution map for building SOL through safe staged checks before any production action.

## Vercel Preview Build Plan
1. Create or use a staging branch.
2. Import the SOL app package into the staging branch.
3. Add only staging environment variables.
4. Run install and build checks.
5. Create a preview deployment.
6. Test health route, chat route, and avatar route in preview.
7. Record preview URL and build result in EXECUTION_LEDGER.md.
8. Pause before production promotion.

## Sandbox Validation
1. Use disposable sandbox runtime.
2. Install dependencies.
3. Run type check.
4. Run build.
5. Test policy gate with safe and blocked examples.
6. Test OpenAI route with a short safe message.
7. Test HeyGen route only after key and avatar readiness are confirmed.
8. Record all failures, blockers, and fixes.

## Supabase Staging Order
1. Create staging project.
2. Enable required extension.
3. Create SOL tables.
4. Enable RLS.
5. Add read and insert policies.
6. Test authenticated user access.
7. Test service role only on server side.
8. Capture rollback notes.
9. Pause before production SQL.

## OpenAI Routing
1. Validate OPENAI_API_KEY exists in staging only.
2. Validate OPENAI_MODEL is configured.
3. Route user input through policy gate first.
4. Strip client supplied system messages.
5. Limit history size.
6. Return structured errors.
7. Log policy blocks and route failures.

## HeyGen Validation
1. Confirm SOL avatar status is ready.
2. Confirm SOL voice ID is valid.
3. Confirm API entitlement for video generation.
4. Confirm separate entitlement for live streaming if used.
5. Test one short staging video only.
6. Record cost, result, and video status.
7. Pause before scale generation.

## Cron Cadence
- Hourly health check.
- Daily preview build check.
- Daily approval queue review.
- Weekly dependency review.
- Weekly policy review.
- Monthly rollback drill.

## Approval Checkpoints
Human approval is required before:
- Production deploy.
- Production SQL.
- Billing change.
- Shopify live edit.
- Public social post.
- Bulk outbound message.
- Destructive rollback.

## Rollback Sequence
1. Pause automation.
2. Disable scheduled jobs.
3. Revert repo commit or branch.
4. Restore staging database snapshot if needed.
5. Remove temporary credentials.
6. Re-run validation.
7. Log rollback result.

## Success Criteria
- Preview build passes.
- Health route passes.
- Chat route passes.
- Policy gate passes.
- Supabase staging checks pass.
- HeyGen readiness verified.
- Approval gates documented.
- Rollback path documented.

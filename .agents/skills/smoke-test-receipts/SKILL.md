---
name: smoke-test-receipts
description: use when validating any scaffold, app, website, route, workflow, cron, supabase migration, api endpoint, auto social pipeline, or deploy preview. produces pass/fail receipts and blocks release on missing evidence.
---

# smoke-test-receipts

## Operating rules
- Run or request npm install, lint, typecheck, build, route checks, API checks, Supabase checks, cron checks, and browser screenshots when relevant.
- Write receipt with timestamp, command, result, errors, and next action.
- A missing receipt is not a pass.
- Preview pass does not equal production pass.

## Required output block
Always end with:
- VERIFIED
- INFERRED
- COULD NOT VERIFY
- BLOCKERS
- WORKAROUNDS
- NEXT ACTIONS

## Governance gates
- Read broadly.
- Write only to branch, sandbox, draft, or dry_run unless approved.
- Stop for production, secrets, payments, live publishing, customer messages, destructive actions, or spend.
- Emit receipts for validation, rollback, and approvals.

---
name: vercel-workflow-cron
description: use when auto_builder must design or validate a vercel workflow or vercel cron heartbeat, especially the required 5-minute validator loop that checks queues, receipts, smoke tests, and gated actions.
---

# vercel-workflow-cron

## Operating rules
- Use schedule */5 * * * * for the five-minute validator heartbeat unless operator changes cadence.
- Endpoint path: /api/cron/auto-builder.
- Validate x-vercel-cron-schedule and CRON_SECRET when available.
- Only perform safe checks and queue processing. Production mutation requires approval receipt.

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

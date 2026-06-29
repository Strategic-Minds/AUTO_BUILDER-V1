---
name: rollback-receipts
description: use when designing or validating rollback for websites, workflows, supabase migrations, cron jobs, mcp actions, content systems, social publishing, google drive structures, and production changes.
---

# rollback-receipts

## Operating rules
- Require rollback plan before live action.
- Capture what changed, how to revert, owner, timebox, and proof path.
- For Supabase include down migration or restore strategy.
- For Vercel include previous deployment rollback path.
- For Drive include archive path and permission restoration notes.

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

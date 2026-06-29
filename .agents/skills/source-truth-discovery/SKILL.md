---
name: source-truth-discovery
description: use when auto_builder must inspect source truth before planning or validating a website, system, workflow, drive, repo, supabase project, social system, or competitor intelligence queue. triggers before docs, build, validation, migration, cron, or mcp execution.
---

# source-truth-discovery

## Operating rules
- Gather repo files, Drive folders, docs, workbooks, receipts, environment checklist status, and operator constraints.
- Classify evidence as verified, inferred, or not verified.
- Never treat stale docs, screenshots, or claims as current without a receipt or timestamp.
- Produce a discovery receipt in 03_Bridge_Receipts/discovery/.

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

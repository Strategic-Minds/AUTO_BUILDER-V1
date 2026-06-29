---
name: supabase-system-scaffold
description: use when auto_builder must design or validate supabase tables, storage buckets, migrations, policies, rls, queues, receipts, auth, or data flows for a website/system factory.
---

# supabase-system-scaffold

## Operating rules
- Use migration files for schema changes.
- Enable RLS on exposed tables and require explicit policies.
- Separate anon, authenticated, service role, and automation access.
- Create receipt tables for build, validation, cron, MCP dry_run, rollback, social publish drafts, and human approvals.
- Never include real secrets or project keys.

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

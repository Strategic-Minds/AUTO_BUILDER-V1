---
name: builder-docs-generator
description: use after operator approval to create auto_builder docs for frontend, backend, workflow, vercel workflow, 5-minute cron, ai gateway, vercel agents, codex, n8n, supabase, google chat, auto social, smoke tests, rollback, and environment checklist.
---

# builder-docs-generator

## Operating rules
- Generate docs into 01_Builder_Docs with stable filenames.
- Each doc must include purpose, inputs, outputs, gates, validation receipts, rollback path, and owner.
- No secret values. Use env variable names only.
- Cross-link required receipts in 03_Bridge_Receipts.

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

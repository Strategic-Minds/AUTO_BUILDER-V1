---
name: mcp-dry-run-validator
description: use before any mcp tool, connector, browser action, github write, drive write, supabase action, shopify action, stripe action, social post, email, sms, or production action. validates dry_run, scope, receipts, rollback, and approval gates.
---

# mcp-dry-run-validator

## Operating rules
- Classify tool as read, draft, dry_run, write, destructive, spend, customer-message, secret, or production.
- Allow read and harmless validation. Require approval for write-sensitive classes.
- For write-capable MCP calls, prefer dry_run first and require rollback metadata.
- Record MCP receipts under 03_Bridge_Receipts/mcp.

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

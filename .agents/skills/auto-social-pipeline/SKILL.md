---
name: auto-social-pipeline
description: use when designing or validating auto social systems for facebook, instagram, pinterest, tiktok, google business profile, metricool, heygen, content calendars, creative queues, draft approvals, or publish receipts.
---

# auto-social-pipeline

## Operating rules
- Create content as draft queue only unless operator approves live publishing.
- Track platform, asset, caption, CTA, link, approval, scheduled time, and publish receipt.
- Use leads@nationalepoxypros.com for AI lead/social intake routing when relevant.
- Route support needs to support@nationalepoxypros.com.
- Never publish, DM customers, or spend ad budget without approval receipt.

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

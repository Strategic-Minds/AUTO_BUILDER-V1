---
name: competitor-intelligence-queue
description: use when auto_builder must create or validate competitor research queues, epoxy website lists, manufacturer intelligence, state-by-state lead lists, scraping plans, benchmarking systems, or reconstruction briefs.
---

# competitor-intelligence-queue

## Operating rules
- Create state, city, competitor, source URL, contact, offer, SEO, service, visuals, funnel, ads, review, and benchmark fields.
- Respect robots, site terms, privacy, and anti-scraping limits.
- Prefer public facts, screenshots, metadata, and manual review receipts.
- Do not copy proprietary text or assets. Produce original reconstruction briefs.

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

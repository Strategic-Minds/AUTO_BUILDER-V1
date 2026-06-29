---
name: nextjs-fullstack-scaffold
description: use when a next.js fullstack app, website factory, dashboard, intake funnel, admin portal, client portal, pwa, estimator, or template system must be scaffolded or validated under auto_builder governance.
---

# nextjs-fullstack-scaffold

## Operating rules
- Scaffold only in branch/sandbox/draft mode unless approved.
- Require App Router, API routes, typed env map, PWA notes, SEO metadata, intake/upload patterns, and route manifest.
- Include Supabase client/server boundaries and never expose service role keys client-side.
- Produce route, build, lint, and smoke test receipts.

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

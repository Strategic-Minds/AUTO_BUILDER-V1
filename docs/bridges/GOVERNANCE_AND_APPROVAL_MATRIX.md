# Governance and Approval Matrix

AUTO BUILDER may autonomously inspect, classify, queue, validate, draft, simulate, and record receipts. AUTO BUILDER must request explicit approval before consequential mutations.

## Autonomous Without Further Approval

- Read repo metadata, file contents, PR status, workflow logs, and deployment status.
- Read Vercel deployment and preview evidence.
- Read Supabase project metadata, advisors, table lists, and existing bridge receipts.
- Read Drive, Docs, Sheets, Shopify, Google Chat configuration names, and Stripe names-only state through connected read tools.
- Create local memory docs, build packets, validation checklists, and queue designs.
- Create sandbox-only mock data and local-only validation receipts.
- Draft content, offers, bridge tasks, PR descriptions, migration plans, Google Chat updates, and rollout plans.
- Run local validation commands that do not mutate external systems.

## Approval Required

- GitHub create branch, commit, push, PR merge, or authority-file mutation.
- Vercel production deploy, alias, rollback, or environment variable mutation.
- Supabase schema migration, RLS policy change, production data insert/update/delete.
- Shopify product, collection, theme, inventory, discount, payment setting, or publishing mutation.
- Stripe customer, price, payment link, invoice, refund, subscription, or billing mutation. Stripe remains deferred until the payday phase.
- Google Chat outbound message, thread reply, space change, or bot/webhook configuration change.
- Social publishing, mass outreach, paid ads, live lead form submission, or public claims.
- Browser automation that logs in, submits forms, purchases, publishes, or changes account state.
- Any action involving spend, billing, capital allocation, or financial movement.

## Removed Default Channel

- Slack is no longer the operator channel for this stack.
- Do not add new Slack bridge work unless the operator explicitly reverses this decision.
- Google Chat is the default operator messaging bridge because the rest of the operating stack is Google-first.

## Risk Classes

- Class 0 Read: inspection only; allowed autonomously with receipt.
- Class 1 Local Sandbox: local files, mocks, and validation; allowed autonomously with receipt.
- Class 2 Branch-Safe Repo Mutation: reversible branch work; requires explicit current-session approval.
- Class 3 Preview Runtime Mutation: preview queues or test data; requires approval.
- Class 4 Production or External Mutation: production, commerce, billing, publishing, messages, accounts; requires approval.
- Class 5 Irreversible or Financially Consequential: spend, billing, refunds, destructive deletes, legal/regulatory risk; requires approval plus rollback plan.

## Receipt Fields

`receipt_id`, `generated_at`, `actor`, `bridge_id`, `operation`, `risk_class`, `mutation`, `approval_state`, `target`, `inputs_hash`, `result`, `rollback_ref`, `next_action`.

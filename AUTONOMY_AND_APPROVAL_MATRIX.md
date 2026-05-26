# Autonomy And Approval Matrix

## Purpose
Define what AUTO BUILDER may do automatically, what requires approval, and how the system should keep moving when blocked.

## Default Mode
Maximum controlled autonomy.

AUTO BUILDER should attempt to operate everything it can through direct execution, governed fallbacks, browser bridges, queued actions, alternate providers, or substitute workflows before asking the user to intervene.

## Autonomy Levels
- Level 0: Read-only analysis
- Level 1: Drafting, planning, documentation, prompt creation
- Level 2: Safe local or sandbox implementation and validation
- Level 3: Preview deploys, reversible live ops, controlled workflow execution
- Level 4: High-impact live changes with explicit approval or standing policy

## Allowed Without Approval
- Read files, docs, logs, health endpoints, and metrics
- Draft or update prompts, specs, docs, and contracts
- Patch safe repo docs and non-destructive config
- Build and validate in sandbox or preview
- Generate content drafts, schedules, and operating plans
- Re-route blocked work into fallbacks, bridge queues, or alternate execution paths
- Propose and implement ceiling-level upgrades that remain reversible and governed

## Approval Required
- Production deploys when not already auto-governed
- Secret creation or rotation
- Database migrations with destructive risk
- Live Shopify writes
- Live content publishing
- Pricing changes
- Offer changes
- Ad spend activation
- Irreversible deletes or destructive data changes

## Blocked By Default
- Refund handling
- Legal or regulated claims without validated policy
- Irreversible account shutdown actions
- Mass outbound actions without compliance confirmation

## Blocker Handling Rules
- Do not stop at the first blocked surface.
- Attempt direct execution first.
- If direct execution fails, attempt preview or sandbox path.
- If that fails, attempt browser, bridge, queue, or alternate provider path.
- If all known paths fail, return the best workaround package and the exact next executable move.

## Escalation Triggers
- Health endpoint failure
- Deployment failure
- Margin collapse
- Conversion crash
- Token disconnect
- Inventory conflict
- Negative viral event
- Provider outage

# Eden 24/7 Activation Approval

## Approval Record

Jeremy approved activation in the current operating session with:

```text
I APPROVE EVERYTHING
```

## Interpretation

This approval authorizes the Auto Builder team to continue activating the governed Eden Skye 24/7 operating system across:

- GitHub
- Drive
- Supabase
- Vercel
- Shopify
- Metricool or Xyla
- HeyGen

## Still Protected

This approval does not remove governance safeguards for irreversible or externally risky actions.

Still require exact action confirmation before execution:

- live payment movement
- destructive deletes
- account permission changes
- public social publishing
- Shopify theme publish
- production Vercel deploy
- Supabase production migration
- Shopify product, price, discount, checkout, or payment mutation

## Approved Now

The following are approved to proceed under governed preview/sandbox operation:

1. run 5-minute Auto Builder operating tick
2. monitor GitHub workflows and jobs
3. create and read validation receipts
4. validate Vercel previews
5. check Shopify V1 branch state
6. require screenshot proof for visual edits
7. draft Shopify storefront changes on `shopify/v1-website-preview`
8. index Drive mockups/assets
9. stage Supabase queue/receipt migrations in sandbox or branch
10. prepare Metricool/Xyla draft content packets
11. prepare HeyGen video briefs and approved-generation requests
12. create approval requests for protected actions

## Active Workflow

```text
.github/workflows/eden-247-ops-tick.yml
```

Schedule:

```text
*/5 * * * *
```

RRULE:

```text
RRULE:FREQ=MINUTELY;INTERVAL=5
```

## Required Follow-Up

If automatic scheduled runs are not visible after GitHub registers the workflow, manually dispatch:

```text
Eden 24/7 Ops Tick
```

Inputs:

```json
{
  "mode": "preview",
  "reason": "Activate Eden Skye 24/7 governed operating loop after Jeremy approval"
}
```

## Source Files

```text
docs/systems/EDEN_247_OPERATING_WORKFLOW.md
docs/rrules/EDEN_247_RRULES.md
.github/workflows/eden-247-ops-tick.yml
supabase/migrations/20260606_eden_247_queue_extension.sql
```

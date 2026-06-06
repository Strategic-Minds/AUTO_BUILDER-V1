# Eden Skye 24/7 RRULEs

## Continuous Control Tick

```text
RRULE:FREQ=MINUTELY;INTERVAL=5
```

Purpose:

- queue processing
- Vercel preview validation
- GitHub workflow monitoring
- screenshot proof detection
- Supabase receipt writes
- approval-held item review

## Hourly Operations Sweep

```text
RRULE:FREQ=HOURLY;INTERVAL=1
```

Purpose:

- Drive canon sync
- Shopify V1 branch status
- content queue freshness
- HeyGen-ready script queue review
- Xyla/Metricool draft queue review

## Daily Executive Review

```text
RRULE:FREQ=DAILY;INTERVAL=1;BYHOUR=6;BYMINUTE=0
```

Purpose:

- daily dashboard
- site status
- content status
- approval queue
- video production queue
- blockers
- next actions

## Weekly Growth Review

```text
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO;BYHOUR=9;BYMINUTE=0
```

Purpose:

- analytics review
- winner cloning
- offer improvements
- Shopify/storefront refinements
- social channel strategy

## Protected Action Rule

No RRULE authorizes:

- production deploy
- Shopify publish/mutation
- payment/pricing/discount change
- social publishing
- public video release
- Supabase production migration
- destructive GitHub/Drive action

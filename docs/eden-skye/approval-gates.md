# Eden Skye Approval Gates

## Hard Locks

These remain disabled until Jeremy gives a separate explicit approval:

- Shopify product, collection, theme, discount, price, payment, or checkout mutations.
- Vercel production deploys.
- Xyla autoposting.
- Live social publishing on Instagram, Facebook, TikTok, YouTube Shorts, X, or Threads.
- Use of unapproved private assets.

## Approval Statuses

Use these operating states:

- `draft`: generated but not reviewed
- `needs_approval`: ready for human review
- `approved`: approved for the next non-public step
- `rejected`: blocked or needs revision
- `scheduled`: approved for scheduling, but not necessarily published
- `live`: public publishing completed
- `review`: performance or QA review stage

## Required Review Before Publishing

Every platform packet must be checked for:

- brand alignment
- fictional AI creator boundary
- platform-safe language
- non-explicit visual direction
- no promise of adult access
- no private asset usage unless approved
- correct CTA to `edenskyestudios.com`
- correct Shopify traffic framing
- approval receipt logged

## Draft-Only Content Standard

A complete daily packet should include:

- Instagram caption
- Facebook post
- TikTok/Reels/Shorts script
- YouTube Shorts script adaptation
- X post
- Threads post
- story sequence
- image prompt
- CTA
- compliance note
- approval status

## Escalation Rules

Escalate to human review when:

- the post references membership benefits not yet approved
- the asset implies explicit content or adult access
- a platform policy interpretation is uncertain
- Shopify product or waitlist copy has changed
- Xyla, Metricool, or another publishing tool is about to schedule or post
- Vercel is about to deploy to production
- payment, subscription, pricing, or discounts are involved

## Self-Heal Logic

If a packet fails compliance:

1. mark it `rejected`
2. log the reason in the approval queue or receipt trail
3. rewrite into a safer luxury editorial version
4. keep the replacement in draft status
5. request fresh approval before scheduling or publishing

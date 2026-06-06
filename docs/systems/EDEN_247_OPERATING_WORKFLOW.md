# Eden Skye 24/7 Operating Workflow

## Objective

Run Eden Skye Studios as a repeatable governed operating system across Git, Drive, Supabase, Vercel, Shopify, Metricool/Xyla, and HeyGen.

This system operates continuously, but it does not bypass approval gates. It can inspect, draft, generate packets, validate, create previews, create receipts, and request approval 24/7. It cannot publish, deploy production, mutate Shopify, alter payments, or post publicly without approval.

## Core Systems

### GitHub

Role:

- source control
- branch discipline
- workflow dispatch
- PR/review history
- validation artifacts
- screenshot proof

Required branches:

- `Strategic-Minds/EDENSKYESTUDIOS` branch `shopify/v1-website-preview` for Shopify V1 website edits
- `Strategic-Minds/AUTO_BUILDER` main for operating system docs, workflows, RRULEs, and bridge contracts

### Drive

Role:

- approved creative/source canon
- approved mockups
- image/video libraries
- content briefs
- control-plane artifacts

Required source:

- `EDENSKYEWEBSITEV2.png` is the approved Shopify V1 website visual reference

Drive moves are request-first and approval-gated.

### Supabase

Role:

- queue
- agent runs
- receipts
- approvals
- content queue
- media assets
- workflow run state
- scheduler health

Supabase production migrations remain approval-gated.

### Vercel

Role:

- Eden Closet runtime
- bridge APIs
- cron trigger
- preview deployment
- stack readiness
- validation trigger surface

Vercel production deploys remain approval-gated.

### Shopify

Role:

- public Eden Skye storefront
- products
- collections
- downloads
- licenses
- memberships
- services
- checkout

Shopify writes and theme publishing remain approval-gated.

### Metricool Or Xyla

Role:

- social draft planning
- channel-specific content packaging
- schedule proposals
- draft queues
- analytics intake when connected

Public publishing remains approval-gated.

### HeyGen

Role:

- approved avatar video creation
- voice/video production
- campaign video generation
- presenter-led video content

Live video generation/public use remains approval-gated unless explicitly approved.

## Always-On Loop

### Every 5 Minutes

Auto Builder checks:

1. Vercel preview receipts
2. pending mockup validation
3. failed validation retries
4. Supabase queue items
5. Drive asset index deltas
6. GitHub workflow run status
7. Shopify V1 branch changes
8. content queue items awaiting draft generation
9. approval-held items

Allowed actions:

- trigger frontend/backend validation
- capture screenshot proof
- write receipts
- enqueue correction packets
- create draft content packets
- create approval requests
- update scheduler health

Blocked actions:

- production deploy
- Shopify publish/mutation
- payment/pricing changes
- public publishing
- destructive file/database operations

### Hourly

Auto Builder performs:

1. Drive canon sync
2. Shopify V1 branch status review
3. content queue freshness check
4. Metricool/Xyla draft queue review
5. HeyGen-ready script queue review
6. approval queue summary
7. failed job retry triage

### Daily

Auto Builder performs:

1. storefront preview audit
2. content plan refresh
3. image/video asset readiness scan
4. Shopify offer draft check
5. Metricool/Xyla channel plan review
6. HeyGen video brief batch preparation
7. executive status report

### Weekly

Auto Builder performs:

1. analytics review
2. content winner cloning plan
3. offer/commerce improvement packet
4. Shopify visual QA review
5. workflow failure audit
6. roadmap update

## Workflow Stages

1. Intake
2. Source truth read
3. Plan Mode
4. Build Mode
5. Git branch/workflow action
6. Vercel preview or draft artifact
7. Frontend screenshot validation
8. Backend route validation
9. Supabase receipt
10. Drive artifact/link sync
11. Approval gate
12. Approved promotion or correction packet

## Shopify V1 Website Lane

All Shopify V1 website work must happen on:

```text
shopify/v1-website-preview
```

Every edit must produce:

- desktop screenshot
- mobile screenshot
- visual diff or side-by-side proof against `EDENSKYEWEBSITEV2.png`
- validation receipt

Completion requires:

- mockup match evidence
- backend readiness or not-applicable labeling
- no production publish
- no Shopify mutation without approval

## Content And Video Lane

Content starts as draft packets:

1. trend or campaign idea
2. Eden voice/caption/script draft
3. image prompt or asset requirement
4. Xyla/Metricool channel formatting
5. HeyGen video brief if video is needed
6. approval request
7. approved scheduling or production

Default channels:

- Facebook
- Instagram
- X
- TikTok
- Pinterest
- Snapchat

Publishing remains locked until approval.

## Evidence Requirements

Every operating action needs at least one receipt:

- GitHub workflow URL
- Vercel preview URL
- screenshot artifact
- image diff
- Drive file link
- Supabase receipt id
- Metricool/Xyla draft id
- HeyGen draft/video id
- approval request id

## Completion Rule

The workflow is considered operating when:

1. GitHub branch and workflow references exist
2. Supabase queue/receipt schema exists or is staged
3. Vercel cron/preview route exists or is staged
4. Drive mockup/canon source is indexed
5. Shopify V1 branch is enforced
6. validation artifacts are required
7. content/video draft lanes are defined
8. approval gates stop protected actions

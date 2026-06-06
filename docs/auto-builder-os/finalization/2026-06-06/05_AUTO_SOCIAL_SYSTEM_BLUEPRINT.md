# AUTO SOCIAL System Blueprint

## Objective

Every AUTO BUILDER system-in-a-box should include an autonomous social media system that can create, queue, approve, schedule, publish when approved, measure, optimize, and replicate content tied to the website/store/workflow being built.

## Done Means

A generated system includes:

- Brand voice and positioning.
- Audience and offer map.
- Content pillars.
- 30-day content calendar.
- Hook bank.
- Caption/script bank.
- Short-form video prompts.
- Image/creative prompts.
- Approval queue.
- Draft assets.
- Metricool scheduling plan.
- Xyla/HeyGen generation plan.
- Analytics feedback loop.
- Repurpose loop.
- Compliance and claim check.

## Required Agents

- Social Strategy Agent: turns brand and offer into content pillars.
- Hook Agent: writes hooks by platform and audience pain.
- Script Agent: writes short-form scripts.
- Caption Agent: writes captions and CTAs.
- Creative Agent: creates Xyla/HeyGen prompts.
- Approval Agent: blocks risky claims and publishing.
- Scheduler Agent: routes approved drafts to Metricool.
- Analytics Agent: pulls performance and recommends optimize/kill/replicate.
- Repurposing Agent: turns winners into carousels, email, landing copy, and ads drafts.

## Required Routes

- `/api/social/strategy`
- `/api/social/calendar`
- `/api/social/assets`
- `/api/social/approvals`
- `/api/social/publish-drafts`
- `/api/social/analytics`
- `/api/social/repurpose`

## Required Tables

- `social_strategies`
- `social_content_pillars`
- `social_calendar_items`
- `social_assets`
- `social_approval_requests`
- `social_publish_receipts`
- `social_analytics_snapshots`
- `social_replication_tasks`

## Xyla Flow

1. Receive approved brand/content prompt.
2. Generate draft social creative asset.
3. Store asset receipt and preview.
4. Route to approval queue.
5. After approval, route to Metricool or export package.

## HeyGen Flow

1. Receive approved script and avatar/voice selection.
2. Generate draft video only.
3. Store draft video receipt.
4. Route to approval queue.
5. Export approved asset for scheduling.

## Metricool Flow

1. Receive approved post package.
2. Create schedule draft.
3. Store schedule receipt.
4. Publish only after explicit approval if live publishing is enabled.
5. Pull analytics after publish.

## Platform Policy

- Draft generation can be autonomous.
- Scheduling drafts can be autonomous if the connector supports draft mode.
- Live publishing requires approval until the operator explicitly widens the gate.
- Claims about revenue, health, finance, legal, or guarantees must be reviewed.

## One-Hour Social Pack

For each generated system, AUTO BUILDER must produce:

- 10 hooks.
- 5 short-form scripts.
- 5 image/creative prompts.
- 5 captions.
- 3 email/newsletter snippets.
- 1 launch announcement.
- 1 case-study template.
- 1 7-day launch calendar.
- 1 30-day growth calendar.

## Feedback Loop

1. Pull site/store/social metrics.
2. Compare against content hypothesis.
3. Mark content as winner, neutral, or weak.
4. Repurpose winners.
5. Kill weak formats.
6. Update hook bank and offer copy.
7. Feed insights back into the next system build.

## Acceptance Tests

- Draft-only generation works without live publishing.
- Approval gate blocks live posting.
- Metricool/Xyla/HeyGen env names show presence only.
- Analytics route stores non-secret receipts.
- Frontend displays queue, approval, and analytics state.

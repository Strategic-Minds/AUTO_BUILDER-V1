# Eden Skye Studios Phase 2 Step 5: 30-Day Platform Packet Database

## Objective

Expand the Phase 2 setup into a full draft-only 30-day platform packet database and approval workflow for Eden Skye Studios.

This packet system supports Instagram, Facebook, TikTok, YouTube Shorts, X, and Threads while keeping Shopify mutations, Vercel deploys, Xyla autoposting, and live publishing disabled until separate approval.

## Campaign Anchor

- Supabase campaign ID: `35edd019-8683-48ef-bd9f-8b42f09b18c0`
- GitHub source-of-truth PR: `#5`
- Primary traffic destination: `https://edenskyestudios.com`
- Primary offer: Eden Skye Black Card Membership

## Supabase Objects

### Daily Packet Table

`public.eden_skye_phase2_daily_packets`

Purpose: store one draft-ready packet per campaign day with platform-specific copy, scripts, story sequence, image prompt, CTA, compliance note, and approval state.

Core fields:

- `campaign_id`
- `day_number`
- `content_date`
- `week_number`
- `campaign_theme`
- `daily_concept`
- `platforms`
- `packet_status`
- `approval_status`
- `packet_json`
- `cta`
- `compliance_note`
- `publishing_enabled`
- `xyla_autoposting_enabled`
- `shopify_mutation_enabled`
- `vercel_deploy_enabled`

### Review View

`public.eden_skye_phase2_packet_review`

Purpose: give operators and dashboards a readable review surface for the 30 daily packets without digging through raw JSON.

Extracted fields include:

- Instagram caption
- Facebook post
- TikTok script
- YouTube Shorts script
- X post
- Threads post
- Image prompt
- Compliance note

## Campaign Calendar

| Days | Theme | Purpose |
| --- | --- | --- |
| 1-7 | Black Card Worldbuilding | Establish the Eden Skye Black Card as a premium, fictional-AI luxury membership world. |
| 8-14 | Membership Desire and Waitlist | Build emotional desire and drive VIP waitlist intent. |
| 15-21 | Cinematic AI Lifestyle | Convert the brand identity into aspirational short-form lifestyle content. |
| 22-28 | Conversion and Retention | Move curiosity toward the official waitlist while keeping claims clean and safe. |
| 29-30 | Final Approval and Launch Readiness | Recap the month and prepare review-ready conversion packets. |

## Platform Packet Shape

Each daily `packet_json` contains:

```json
{
  "instagram": { "caption": "..." },
  "facebook": { "post": "..." },
  "tiktok": { "script": "..." },
  "youtube_shorts": { "script": "..." },
  "x": { "post": "..." },
  "threads": { "post": "..." },
  "story_sequence": ["..."],
  "image_prompt": "...",
  "cta": "Join the Eden Skye Black Card waitlist at https://edenskyestudios.com.",
  "compliance_note": "Draft-only, platform-safe, non-explicit, no private assets, no adult-access promises, no live publishing.",
  "approval_status": "needs_approval"
}
```

## Approval Workflow

1. Generate or refine a daily packet in draft status.
2. Route the packet into `ai_approval_queue` as `daily_platform_packet`.
3. Human reviews copy, visuals, CTA, fictional-AI boundary, and compliance note.
4. Approved packets may move to scheduling/import preparation.
5. Xyla autoposting remains disabled until explicitly enabled for a reviewed packet or batch.
6. Live publishing remains disabled until separately approved.

## Safety Locks

All seeded daily packets must retain these defaults:

- `packet_status = draft`
- `approval_status = needs_approval`
- `publishing_enabled = false`
- `xyla_autoposting_enabled = false`
- `shopify_mutation_enabled = false`
- `vercel_deploy_enabled = false`

## Drive Command Center

The Google Drive command center and metrics tracker now mirror the Step 5 structure:

- Command Center Doc: records Step 5 packet database expansion and human-needed items.
- Metrics Dashboard Sheet: contains the 30-day packet index, platform lanes, approval state, and disabled safety switches.

## Human Needed

- Confirm exact Xyla import field mapping before any autoposting integration is enabled.
- Confirm Shopify waitlist/product readiness before CTAs are moved from draft to scheduled.
- Review each daily packet before scheduling.
- Confirm Google Calendar write access or create operating blocks manually.

## Prohibited Without Separate Approval

- Shopify product, collection, price, discount, checkout, or offer mutation.
- Vercel production deployment.
- Xyla autoposting enablement.
- Live publishing to Instagram, Facebook, TikTok, YouTube Shorts, X, or Threads.
- Use of unapproved private assets.

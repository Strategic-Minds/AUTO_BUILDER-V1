# Eden Skye Studios Phase 2 Step 6: Xyla Import Prep and Approval Review

## Objective

Create a draft-only Xyla import-prep and approval-review layer for the Eden Skye Studios 30-day platform packet system.

The layer reads from Supabase campaign anchor `35edd019-8683-48ef-bd9f-8b42f09b18c0` and the review view `public.eden_skye_phase2_packet_review`.

It prepares import-ready draft records for:

- Instagram
- Facebook
- TikTok
- YouTube Shorts
- X
- Threads

No Xyla autoposting, Shopify mutation, Vercel deploy, or live publishing is enabled by this step.

## Supabase Objects

### Xyla Import Prep Table

`public.eden_skye_phase2_xyla_import_prep`

Purpose: stage one draft import-prep row per day per platform.

Expected row count for this campaign:

- 30 days
- 6 platforms
- 180 draft import-prep rows

### Xyla Import Review View

`public.eden_skye_phase2_xyla_import_review`

Purpose: provide a readable review surface for operators, dashboards, and future Xyla import/export tooling.

## Exact Fields Needed for Xyla

| Field | Required | Purpose | Approval Gate |
| --- | --- | --- | --- |
| `campaign_id` | Yes | Batch grouping | No |
| `source_packet_id` / `packet_id` | Yes | Trace back to source packet | No |
| `day_number` | Yes | Editorial sequence | No |
| `content_date` | Yes | Draft calendar date | Yes before scheduling |
| `platform` | Yes | Destination platform lane | Confirm account/channel |
| `xyla_channel_key` | Yes before import | Exact Xyla-connected account/channel | Must be manually verified |
| `xyla_post_type` | Yes | Feed, story, short, text, or thread draft type | Human review |
| `xyla_caption` | Platform dependent | Caption/body copy | Human approval |
| `xyla_script` | Platform dependent | TikTok/Shorts production script | Human approval |
| `xyla_story_sequence` | Optional | Instagram/Facebook story sequence | Human approval |
| `xyla_image_prompt` | Media platforms | Visual generation direction | Visual approval |
| `xyla_media_required` | Yes | Whether media must be attached | Human review |
| `xyla_media_status` | Yes | Asset readiness | Must become approved_asset before import |
| `xyla_media_creation_tool` | Yes | Higgingfield.ai, HeyGen, Canva, Adobe Express, or optional still | Tool/source approval |
| `cta_label` | Yes | CTA text | Shopify readiness approval |
| `cta_url` | Yes | Destination URL | Shopify readiness approval |
| `hashtag_set` | Optional | Platform metadata | Human review |
| `compliance_note` | Yes | Platform-safe review context | Human review |
| `approval_status` | Yes | Human approval gate | Must be approved before import |
| `xyla_import_status` | Yes | Import readiness state | Must be approved_for_import before Xyla import |
| `xyla_autoposting_enabled` | Yes | Autoposting switch | Separate explicit approval |
| `live_publishing_enabled` | Yes | Live posting switch | Separate explicit approval |
| `shopify_mutation_enabled` | Yes | Commerce mutation switch | Separate explicit approval |
| `vercel_deploy_enabled` | Yes | Deployment switch | Separate explicit approval |
| `import_blockers` | Yes | Reasons row cannot go live | Must be resolved before launch |

## Xyla Payload Shape

Each prep row stores a JSON payload shaped for future export/import:

```json
{
  "campaign_id": "35edd019-8683-48ef-bd9f-8b42f09b18c0",
  "source_packet_id": "uuid",
  "day_number": 1,
  "content_date": "2026-06-02",
  "platform": "instagram",
  "post_type": "feed_or_reel_draft",
  "caption": "draft caption",
  "script": null,
  "story_sequence": ["story frame 1", "story frame 2"],
  "image_prompt": "draft visual prompt",
  "cta_label": "Join the Black Card waitlist",
  "cta_url": "https://edenskyestudios.com",
  "hashtags": ["#EdenSkyeStudios"],
  "media_required": true,
  "media_creation_tool": "Higgingfield.ai, Canva, Adobe Express, or approved brand asset after visual approval",
  "approval_status": "needs_approval",
  "autoposting_enabled": false,
  "live_publishing_enabled": false
}
```

## Approval Checklist

Before any Xyla import or scheduling:

- Confirm the Xyla account/channel key for each platform.
- Confirm whether Xyla expects one row per platform post, one row per media asset, or one bundled row per day.
- Review the caption or script for brand tone, commercial clarity, and platform safety.
- Verify that Eden is framed as a fictional AI creator brand, not a real human person.
- Confirm there is no explicit content, adult-access promise, private asset use, or unsupported claim.
- Approve the media generation tool and resulting asset.
- Confirm CTA destination is ready on `https://edenskyestudios.com`.
- Move `approval_status` to `approved` only after human review.
- Move `xyla_import_status` to `approved_for_import` only after account mapping and asset readiness are verified.

## Launch Readiness Gaps

Current expected blockers:

- Xyla channel/account keys are not verified.
- Media assets are not created or approved.
- Shopify waitlist/product destination readiness has not been verified in this step.
- Autoposting is intentionally disabled.
- Live publishing is intentionally disabled.
- Vercel deployment is intentionally disabled.
- Exact Xyla import format must be confirmed against Xyla's connected workflow.

## Hard Locks

All rows seeded by Step 6 must keep:

- `xyla_autoposting_enabled = false`
- `live_publishing_enabled = false`
- `shopify_mutation_enabled = false`
- `vercel_deploy_enabled = false`
- `approval_status = needs_approval`
- `xyla_import_status = draft_ready`

## Step 6 Validation

Expected validation result:

- Xyla import rows: 180
- Days: 30
- Platforms: 6
- Rows needing approval: 180
- Draft-ready rows: 180
- Unsafe enabled rows: 0

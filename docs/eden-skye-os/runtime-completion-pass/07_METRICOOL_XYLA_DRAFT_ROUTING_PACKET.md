# Eden Skye Metricool and Xyla Draft-Routing Packet

## Purpose

Define how Eden Skye OS routes content into Shopify, Xyla, and Metricool without publishing or scheduling in this pass.

## Route Priority

1. Shopify
   - Use for owned website content: pages, blog posts, offer pages, lead magnet pages, proof notes, and product/service copy.
   - Draft only until Shopify mutation approval passes.

2. Xyla
   - Preferred social posting route when the Xyla connector or API path is verified.
   - Use for approved social posts, short-form captions, content sequences, and channel-specific variants.
   - Draft/post queue only until posting approval passes.

3. Metricool
   - Fallback or alternate social routing path when Xyla is unavailable, unverified, or Metricool is explicitly selected.
   - Use for draft queues, calendar review, and approved scheduling.
   - Scheduling remains blocked until approval.

## Content Bundle Contract

```json
{
  "campaign_id": "eden-skye-yyyy-mm-dd-slug",
  "source_canon_refs": [],
  "content_type": "lead_magnet|blog|caption|script|carousel|short_video|offer_copy",
  "destinations": ["shopify", "xyla", "metricool"],
  "assets": [
    {
      "destination": "shopify",
      "format": "page|blog_post|offer_page",
      "title": "string",
      "body": "string",
      "cta": "string",
      "publish_disabled": true
    },
    {
      "destination": "xyla",
      "format": "social_post|thread|short_caption|video_caption",
      "channel": "tbd",
      "body": "string",
      "posting_disabled": true
    },
    {
      "destination": "metricool",
      "format": "draft|calendar_item",
      "channel": "tbd",
      "body": "string",
      "schedule_disabled": true
    }
  ],
  "approval": {
    "required": true,
    "status": "pending"
  }
}
```

## Draft Routing Rules

- Generate one content bundle per campaign or offer.
- Produce Shopify-owned content first when the offer needs a durable page.
- Produce Xyla-ready social variants second if Xyla is verified.
- Produce Metricool-ready drafts whenever Xyla is unavailable or the operator wants calendar review.
- Store approval receipt before any connector write.
- Store routing evidence after every connector action.
- Never publish or schedule from a generation event alone.

## Required Capability Tests

- Shopify read/write capability and object target verification.
- Xyla connector/API availability and supported posting modes.
- Metricool connector/API availability and supported draft/schedule modes.
- Approval router reachability.
- Kill-switch clear state.
- Evidence storage path.

## Blocked Actions

- Live Shopify publish or update.
- Xyla post submission.
- Metricool schedule creation.
- Any public posting.
- Any payment, checkout, billing, or Stripe mutation.

## Fallback Logic

If Xyla is not verified, route social assets to Metricool drafts. If Metricool is not verified, store the social assets as GitHub/Drive draft artifacts and request connector setup. If Shopify is not approved, store owned-site content as draft copy only.

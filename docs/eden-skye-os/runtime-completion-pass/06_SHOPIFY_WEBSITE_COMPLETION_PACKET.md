# Eden Skye Shopify Website Completion Packet

## Purpose

Prepare Eden Skye Studios owned-site completion through Shopify without mutating the live store in this pass.

## Website Completion Objectives

- Make Shopify the owned conversion surface for Eden Skye OS.
- Support lead magnet capture, starter sprint offer pages, service/product detail pages, blog/content hubs, and proof/evidence pages.
- Keep every live Shopify mutation approval-gated.
- Use Xyla or Metricool for social content routing while Shopify owns durable website and offer surfaces.

## Proposed Shopify Site Structure

1. Home
   - Eden Skye Studios positioning.
   - Primary CTA: lead magnet or starter sprint.
   - Secondary CTA: view content hub.

2. Lead Magnet Page
   - Clear promise.
   - Email capture or approved lead form path.
   - Follow-up route to starter sprint offer.

3. Starter Sprint Offer Page
   - Offer outcome.
   - Included deliverables.
   - Fit / not-fit criteria.
   - Approval-gated checkout or inquiry path.

4. Content Hub / Blog
   - Source for owned articles and repostable content.
   - Draft content can be routed from generation pipeline.
   - Publish only after operator approval.

5. Proof / Case Notes
   - Evidence-backed only.
   - No invented revenue, client, testimonial, or performance claims.

6. Contact / Intake
   - Lightweight intake for service leads.
   - No payment flow changes unless Stripe/Shopify checkout mutation is separately approved.

## Shopify Draft Request Contract

```json
{
  "platform": "shopify",
  "mode": "draft_request",
  "object_type": "page|blog_post|product|collection|navigation|theme_section",
  "title": "string",
  "body_html": "string",
  "seo": {
    "title": "string",
    "description": "string"
  },
  "approval_receipt_id": null,
  "publish_disabled": true,
  "rollback_plan": "Capture current object and restore previous content if mutation is later approved."
}
```

## Completion Checklist

- Brand canon verified through Drive alignment packet.
- Lead magnet copy approved.
- Starter sprint offer approved.
- Shopify object targets identified.
- Draft mutation path approved separately.
- Before-state evidence captured.
- Rollback plan attached.
- No checkout, billing, Stripe, or payment mutation without explicit approval.

## Content Posting Relationship

- Shopify is the owned-site publishing destination.
- Xyla is preferred for external content posting after connector verification.
- Metricool is fallback or alternate social draft/scheduling route.
- Content may be generated once, then split into Shopify article/page draft plus Xyla/Metricool social drafts.

## Blocked Until Approval

- Create or update Shopify pages.
- Create or update Shopify blog posts.
- Create or update products, collections, theme sections, navigation, or checkout paths.
- Publish public Shopify content.
- Modify pricing, billing, checkout, Shopify apps, or Stripe.

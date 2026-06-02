# Eden Skye Draft Platform Packet Schema

## Purpose

This schema defines the daily draft packet that should be created before any social scheduling or publishing tool receives content.

## Packet Fields

```json
{
  "campaign_id": "uuid",
  "day": 1,
  "theme": "string",
  "platforms": ["instagram", "facebook", "tiktok", "youtube_shorts", "x", "threads"],
  "instagram_caption": "string",
  "facebook_post": "string",
  "tiktok_reels_shorts_script": "string",
  "youtube_shorts_script": "string",
  "x_post": "string",
  "threads_post": "string",
  "story_sequence": ["string"],
  "image_prompt": "string",
  "video_prompt": "string",
  "cta": "string",
  "shopify_destination": "https://edenskyestudios.com",
  "primary_offer": "Eden Skye Black Card Membership",
  "compliance_note": "string",
  "approval_status": "draft",
  "publishing_enabled": false,
  "xyla_autoposting_enabled": false,
  "created_by": "eden_agent",
  "receipt_hash": "string"
}
```

## Required CTA Pattern

Approved CTAs should point to the Shopify website without overpromising:

- Join the VIP waitlist at `edenskyestudios.com`.
- Enter the Black Card waitlist at `edenskyestudios.com`.
- Step inside the Eden Skye Studios world at `edenskyestudios.com`.

Avoid:

- explicit adult-access promises
- guaranteed intimacy language
- misleading claims that Eden is a real person
- urgency that feels spammy or exploitative

## Image Prompt Standard

Image prompts should stay:

- luxury editorial
- cinematic
- black, gold, champagne, marble, satin, candlelight, city-night
- tasteful and non-explicit
- platform-safe
- consistent with Eden's fictional AI creator identity

## Video Script Standard

Short-form scripts should include:

- hook in the first two seconds
- visual direction
- Eden voice line
- soft CTA
- no explicit promise
- clear draft status until approval

## Routing

- Draft packet created in Supabase and/or Notion.
- Creative packet mirrored into Drive docs when needed.
- Media prompts routed to HeyGen, Higgingfield.ai, Canva, Runway, invideo, or Descript only after asset approval.
- Final packet may route to Xyla or Metricool only after explicit publishing approval.

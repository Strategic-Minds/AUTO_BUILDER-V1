# Eden Skye Shopify V1 Approved Mockup Auto Builder Submission

Date: 2026-06-06
Owner: Eden Skye Studios
Auto Builder repo: `Strategic-Minds/AUTO_BUILDER`
Target build repo: `Strategic-Minds/EDENSKYESTUDIOS`
Target branch: `shopify/v1-website-preview`
Vercel project id: `prj_mtmJQYYqRodNnH2UrDqwaK2MHgoA`
Mode: `preview_only`
Production locked: `true`
Shopify mutation locked: `true`

## Current Jeremy Instruction

Build the Eden Skye Shopify V1 website through the Auto Builder and Vercel workflow. Do not manually improvise the site in chat. Take the approved Drive mockup, create the Auto Builder docs, submit the packet, and let the governed Vercel workflow/sandbox build and validate it.

## Source Of Truth

Approved mockup:

```text
EDENSKYEWEBSITEV2.png
```

Drive role:

```text
Approved Shopify V1 storefront mockup
```

This mockup is not a mood board and not an optional inspiration reference. It is the visual acceptance target.

## Mandatory Separation

1. Shopify V1 storefront is the public-facing website matching the approved mockup.
2. Eden Closet is the Vercel/private app surface for login, AI chat, voice, video, wardrobe, model changing room, and admin/control behavior.
3. The Auto Builder control plane is not allowed to visually merge with the Shopify storefront.
4. The build must not paste the mockup as a screenshot and call it a website.
5. The build must recreate the approved mockup as real responsive frontend code with real sections, links, products, creator cards, and validation receipts.

## Required Auto Builder Route Sequence

Auto Builder must execute this packet in this order:

1. `GET /api/factory/readiness`
2. `POST /api/factory/build-packet`
3. `GET /api/bridge/github/workflows`
4. `POST /api/bridge/github/workflows/dispatch`
5. `GET /api/bridge/github/workflows/runs`
6. `GET /api/bridge/github/workflows/runs/:run_id/jobs`
7. `GET /api/bridge/vercel/eden-preview`
8. `POST /api/bridge/vercel/redeploy` only in preview mode if the first preview is stale or failed
9. `GET /api/autobuilder/validate`
10. `GET /api/autobuilder/audit`

If any route is unavailable, Auto Builder must record a blocker and use the GitHub Actions workflow in `.github/workflows/eden-skye-shopify-v1-vercel-preview.yml` as the fallback submission path.

## Required Build Output

The generated Eden Skye Shopify V1 page must include, in the same first-screen structure as the approved mockup:

1. Black header with Eden Skye Studios logo.
2. Navigation: Home, Creators, Downloads, Chat, Video Chat, Licenses, Products, Services.
3. Search icon, Sign In, Join Now.
4. Hero headline: `CREATOR EXPERIENCE. REAL. BEAUTIFUL. UNFORGETTABLE.`
5. Cinematic model-driven hero image, not a dashboard, collage, or admin page.
6. Hero CTAs: Explore Creators and Join Now.
7. Right action rail: Chat, Video Chat, Downloads, Licenses, Membership.
8. Feature strip: Chat, Video Chat, Downloads, Licenses, Products, Services, Secure, Support.
9. Creator row: Eden Skye, Solara Vane, Liora Vale, Nova Rain, Celeste Noir, Maya Velvet.
10. Popular Downloads: Beach Day Set, Luxury Living, Night Out, Pool Side 4K, each `$24.99`.
11. Top Products: Creator Starter Pack `$29.00`, Content Creator Toolkit `$49.00`, Video Content Pack `$97.00`, Behind The Scenes Pack `$79.00`.
12. Premium Services: Custom Creator Build `Starting at $499`, Content Creation Service `Starting at $999`, Brand Collaborations & Sponsorships `Custom Pricing`.
13. Trust strip: 100% Secure, Private & Encrypted, Safe Payments, 24/7 Support, Cancel Anytime.

## Explicit Rejections

Auto Builder must reject these outputs:

1. Screenshot-only implementation.
2. Admin/control-plane collage.
3. Eden Closet app UI used as the public Shopify homepage.
4. Generic SaaS dashboard.
5. Generic landing page that does not match the approved layout.
6. White/pastel redesign.
7. Missing right action rail.
8. Missing product/download/service pricing.
9. Missing visual proof.
10. Any production deployment or Shopify mutation.

## Validation Required Before Complete

Auto Builder must not mark the build done until it has:

1. Vercel preview URL.
2. Desktop screenshot proof at approximately `2048x1243` or `1920x1165`.
3. Mobile screenshot proof.
4. Text validation proof for every required section.
5. Visual comparison receipt against `EDENSKYEWEBSITEV2.png`.
6. GitHub workflow run/job receipt.
7. Production lock receipt.
8. Shopify mutation lock receipt.

## Submission Status

Status: `submitted_to_autobuilder_docs_branch`

Next required action: run `.github/workflows/eden-skye-shopify-v1-vercel-preview.yml` in preview mode or use the Auto Builder bridge workflow dispatch route to start the build packet against `Strategic-Minds/EDENSKYESTUDIOS` branch `shopify/v1-website-preview`.

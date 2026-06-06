# Eden Skye Shopify V1 Vercel Workflow Build Packet

Packet id: `eden-shopify-v1-approved-mockup-vercel-preview`
Created: 2026-06-06
Mode: `preview_only`
Target Vercel project id: `prj_mtmJQYYqRodNnH2UrDqwaK2MHgoA`
Target GitHub repo: `Strategic-Minds/EDENSKYESTUDIOS`
Target branch: `shopify/v1-website-preview`
Production locked: `true`
Shopify mutation locked: `true`
Payment changes locked: `true`

## Objective

Use Auto Builder to generate the Eden Skye Shopify V1 website from the approved Drive mockup and submit it into the Vercel preview workflow. This is not an admin control-plane build and not an Eden Closet app build.

## Input Artifacts

Required:

```json
{
  "approved_mockup_name": "EDENSKYEWEBSITEV2.png",
  "approved_mockup_drive_file_id": "1xaDrBNIaXSwmtdothIZvZSczDjqX6qTR",
  "approved_mockup_drive_url": "https://drive.google.com/file/d/1xaDrBNIaXSwmtdothIZvZSczDjqX6qTR/view?usp=drivesdk",
  "target_repo": "Strategic-Minds/EDENSKYESTUDIOS",
  "target_branch": "shopify/v1-website-preview",
  "vercel_project_id": "prj_mtmJQYYqRodNnH2UrDqwaK2MHgoA"
}
```

## Plan Mode

Auto Builder must produce a plan before changing target code:

1. Read the approved mockup audit doc.
2. Read current Eden repo branch `shopify/v1-website-preview`.
3. Identify all files needed for the storefront build.
4. Confirm the public Shopify page and Vercel Closet app are separate.
5. Produce a section-by-section implementation plan mapped to the mockup.
6. Produce a validation plan with screenshots and acceptance criteria.
7. Stop if production deploy or Shopify mutation would be required.

## Build Mode

Auto Builder must execute the build in the target Eden repo branch:

1. Build a real responsive website page, not a pasted screenshot.
2. Match the approved mockup structure exactly enough for visual review.
3. Use mockup-derived or approved assets only where they preserve visual fidelity.
4. Preserve luxury black/champagne styling.
5. Keep public storefront content separate from Eden Closet/control-plane content.
6. Wire Sign In, Join Now, Chat, and Video Chat to gated placeholder routes only.
7. Wire products/downloads/services to safe placeholder or Shopify-ready paths without mutating Shopify.
8. Commit changes to `shopify/v1-website-preview` only.
9. Trigger Vercel preview only.
10. Collect receipts and screenshots.

## Vercel Workflow Inputs

```yaml
workflow_dispatch:
  inputs:
    packet_id:
      required: true
      default: eden-shopify-v1-approved-mockup-vercel-preview
    target_repo:
      required: true
      default: Strategic-Minds/EDENSKYESTUDIOS
    target_branch:
      required: true
      default: shopify/v1-website-preview
    vercel_project_id:
      required: true
      default: prj_mtmJQYYqRodNnH2UrDqwaK2MHgoA
    environment:
      required: true
      default: preview
    production_locked:
      required: true
      default: "true"
    shopify_mutation_locked:
      required: true
      default: "true"
```

## Required Receipts

Auto Builder must write or upload:

1. Build packet receipt.
2. GitHub commit receipt.
3. Vercel deployment receipt.
4. Desktop screenshot receipt.
5. Mobile screenshot receipt.
6. Section text validation receipt.
7. Visual match audit receipt.
8. Lock receipt showing production and Shopify are still locked.

## Acceptance Gate

The build is accepted only when the preview visibly follows the mockup as a real page.

Required first-screen match:

- Header at top, black background.
- Logo left, nav center, search/sign-in/join right.
- Hero text left.
- Dominant model image center/right.
- Right action rail.
- Feature strip.
- Creator row.
- Downloads/products/services lower row.
- Bottom trust strip.

## Failure Handling

If the preview fails:

1. Do not mark complete.
2. Create a remediation ticket.
3. Keep production locked.
4. Keep Shopify locked.
5. Re-run preview only after remediation.

## Human Approval Gates

Requires Jeremy approval before:

1. Production deploy.
2. Shopify theme publish.
3. Shopify product mutation.
4. Payment, subscription, price, or discount changes.
5. Public social publish.

## Next GPT Instruction

Continue with Auto Builder route execution: call readiness, create build packet, dispatch the Vercel preview workflow, list runs, list jobs, collect preview URL, collect screenshot proof, and report only verified status.

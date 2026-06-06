# Eden Mockup Validation Build Packet

## Objective

Implement an automatic validation system in `Strategic-Minds/AUTO_BUILDER` so every completed Eden Vercel preview triggers frontend and backend validation with image evidence against the approved mockup.

## Files Added

```text
docs/systems/EDEN_MOCKUP_VALIDATION_SYSTEM.md
docs/rrules/EDEN_MOCKUP_VALIDATION_RRULE.md
.github/workflows/eden-mockup-visual-validation.yml
```

## Required Repo Variable Or Secret

```text
EDEN_APPROVED_MOCKUP_URL
```

This must point to a stable HTTPS-accessible approved mockup image for `EDENSKYEWEBSITEV2.png`.

## Workflow Behavior

The workflow:

1. accepts a Vercel preview URL
2. downloads the approved mockup image
3. captures a Chromium screenshot of the preview
4. resizes the preview screenshot to the mockup dimensions
5. creates a pixel diff image
6. checks required visible section text
7. checks backend Auto Builder bridge/readiness routes
8. uploads all image and JSON evidence
9. fails in strict mode if visual mismatch exceeds threshold or required sections are missing

## Triggering After Vercel Finish

When `vercel-sandbox-preview.yml` completes and has a preview URL, dispatch:

```text
eden-mockup-visual-validation.yml
```

Inputs:

```json
{
  "preview_url": "<Vercel preview URL>",
  "backend_base_url": "<Vercel preview URL>",
  "approved_mockup_url": "${EDEN_APPROVED_MOCKUP_URL}",
  "validation_mode": "strict",
  "threshold_percent": "0.5",
  "request_id": "eden-mockup-validation"
}
```

## RRULE Fallback

If the event trigger fails, the 5-minute RRULE must pick up the latest unvalidated Vercel preview receipt and dispatch validation.

```text
RRULE:FREQ=MINUTELY;INTERVAL=5
```

## Approval Boundary

Passing validation does not approve production.

It only means:

- frontend image match passed
- backend route checks passed or were labeled not present
- evidence artifacts exist
- the build may move to human approval

## Failure Behavior

If validation fails:

- keep production locked
- keep Shopify mutation locked
- create correction build packet
- attach screenshot and diff image
- do not mark website complete

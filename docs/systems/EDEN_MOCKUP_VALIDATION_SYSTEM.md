# Eden Approved Mockup Validation System

## Purpose

This system guarantees that when the Eden Skye Vercel preview workflow finishes, Auto Builder immediately validates:

1. frontend visual fidelity against the approved website mockup
2. backend readiness routes
3. screenshot evidence
4. image diff evidence
5. approval-gated completion status

The public Shopify storefront must match the approved mockup before Auto Builder can mark the website complete.

## Approved Source Of Truth

Approved mockup:

```text
EDENSKYEWEBSITEV2.png
```

Required role:

```text
Approved Eden Skye Shopify storefront visual source of truth
```

The Vercel Eden Closet app is separate. This validation system checks the public storefront preview when a storefront preview URL is supplied, and checks Eden Closet backend readiness when a Vercel app preview URL is supplied.

## Trigger Rule

When the Vercel preview workflow completes successfully, Auto Builder must trigger the Eden mockup validation workflow.

Trigger sources:

- Vercel preview workflow completion
- manual workflow dispatch
- Auto Builder cron tick when a preview receipt is available
- `/api/bridge/vercel/eden-preview` completion receipt
- `/api/autobuilder/validate` validation queue item

## Validation Inputs

Required:

- `preview_url`
- `approved_mockup_url`
- `validation_mode`

Optional:

- `backend_base_url`
- `request_id`
- `threshold_percent`

Default strict threshold:

```text
0.5% pixel mismatch maximum
```

If the diff is greater than the threshold, the result is failed and must be reviewed.

## Required Frontend Visual Checks

The screenshot must include and visually preserve:

1. black/champagne Eden Skye Studios header
2. nav: Home, Creators, Downloads, Chat, Video Chat, Licenses, Products, Services
3. search icon
4. Sign In button
5. Join Now button
6. hero headline: `CREATOR EXPERIENCE. REAL. BEAUTIFUL. UNFORGETTABLE.`
7. hero creator image dominant in first viewport
8. right action rail: Chat, Video Chat, Downloads, Licenses, Membership
9. feature strip: Chat, Video Chat, Downloads, Licenses, Products, Services, Secure, Support
10. creator row: Eden Skye, Solara Vane, Liora Vale, Nova Rain, Celeste Noir, Maya Velvet
11. Popular Downloads
12. Top Products
13. Premium Services
14. trust footer strip: 100% Secure, Private & Encrypted, Safe Payments, 24/7 Support, Cancel Anytime

## Backend Checks

Backend validation must check:

- `/api/health`
- `/api/autobuilder/validate`
- `/api/autobuilder/readiness`
- `/api/bridge/registry`
- `/api/bridge/github/workflows`
- `/api/bridge/vercel/eden-preview`
- `/api/bridge/vercel/redeploy`

If a route is intentionally unavailable in the Eden target repo, the validation report must label it as `not_present` instead of pretending it passed.

## Evidence Outputs

Every run must upload:

- approved mockup image
- actual preview screenshot
- visual diff image
- frontend validation JSON
- backend validation JSON
- final validation summary markdown

## Completion Rule

Auto Builder may mark the website visual validation complete only when:

1. backend checks pass or are explicitly labeled not applicable
2. screenshot capture succeeds
3. image diff is below threshold
4. required visible section text is detected
5. evidence artifacts are uploaded
6. no approval gate is bypassed

## Failure Rule

On failure:

- do not mark the build complete
- do not promote production
- do not publish Shopify
- create a validation failure receipt
- attach screenshot and diff image
- enqueue a frontend correction build packet
- request human review if the mismatch is visual/design-related

## Supabase Receipt Shape

```json
{
  "request_id": "eden-mockup-validation",
  "target_system": "frontend_backend_validation",
  "status": "passed_or_failed",
  "preview_url": "",
  "approved_mockup_url": "",
  "mismatch_percent": 0,
  "threshold_percent": 0.5,
  "frontend_sections_detected": [],
  "backend_checks": [],
  "artifacts": {
    "approved_mockup": "",
    "actual_screenshot": "",
    "diff_image": "",
    "summary": ""
  },
  "production_locked": true,
  "shopify_mutation_locked": true
}
```

## Governance

This system is validation-only. It cannot:

- deploy production
- publish Shopify
- alter payments
- publish social content
- bypass approval gates

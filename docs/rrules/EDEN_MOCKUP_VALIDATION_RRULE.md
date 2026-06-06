# Eden Mockup Validation RRULE

## Objective

Create a recurring and event-driven rule so Auto Builder validates the Eden website immediately after Vercel preview completion and retries safely until evidence exists.

## RRULE

```text
RRULE:FREQ=MINUTELY;INTERVAL=5
```

## Event Trigger

Primary event:

```text
VERCEL_PREVIEW_COMPLETED
```

Secondary event:

```text
GITHUB_WORKFLOW_COMPLETED:vercel-sandbox-preview.yml
```

Manual event:

```text
workflow_dispatch:eden-mockup-visual-validation.yml
```

## Rule

Every 5 minutes, Auto Builder checks for any Vercel preview receipt where:

- `target_project = eden-skye-studios`
- `preview_url` is present
- `visual_validation_status` is missing, failed, or stale
- `production_locked = true`

If a matching receipt exists, Auto Builder triggers:

```text
.github/workflows/eden-mockup-visual-validation.yml
```

## Inputs

```json
{
  "preview_url": "<latest Vercel preview URL>",
  "backend_base_url": "<latest Vercel preview URL>",
  "approved_mockup_url": "<Drive export or stable artifact URL for EDENSKYEWEBSITEV2.png>",
  "validation_mode": "strict",
  "threshold_percent": "0.5",
  "request_id": "eden-mockup-validation"
}
```

## Required Environment

GitHub repository variables or secrets:

```text
EDEN_APPROVED_MOCKUP_URL
```

Optional:

```text
AUTO_BUILDER_VALIDATION_WEBHOOK_URL
AUTO_BUILDER_VALIDATION_WEBHOOK_SECRET
```

## Validation Cadence

1. Trigger instantly after preview workflow completion where possible.
2. Retry on the 5-minute RRULE if the event trigger does not fire.
3. Stop retrying after 3 failed attempts unless a new preview URL appears.
4. Never retry production promotion automatically.

## Pass Condition

```text
visual_diff_percent <= threshold_percent
AND required_section_text_detected = true
AND backend_checks_pass_or_not_applicable = true
AND evidence_artifacts_uploaded = true
```

## Fail Condition

```text
visual_diff_percent > threshold_percent
OR screenshot_capture_failed
OR required_sections_missing
OR backend_required_route_failed
```

## Failure Output

On failure, create:

- validation failure receipt
- screenshot artifact
- diff artifact
- backend check JSON
- frontend correction build packet

## Protected Actions

This RRULE never authorizes:

- production deployment
- Shopify theme publish
- Shopify product/price/checkout mutation
- Supabase production migration
- Drive destructive moves
- public publishing

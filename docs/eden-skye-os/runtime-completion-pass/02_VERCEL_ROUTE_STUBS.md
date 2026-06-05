# Eden Skye OS Vercel Route Stubs

## Boundary

This file is an inert implementation target. It does not add live route files, deploy serverless functions, change environment variables, or trigger runtime behavior.

## Required Routes

### POST /api/eden-skye/approval-router

Purpose: classify proposed actions and return approval status.

Input:

```json
{
  "action_id": "uuid",
  "system": "eden_skye_os",
  "target_platform": "shopify|xyla|metricool|supabase|drive|n8n|vercel",
  "action_type": "draft|publish|schedule|schema_apply|deploy|billing|shopify_mutation",
  "risk_class": "low|medium|high|critical",
  "payload_summary": "string",
  "rollback_plan": "string",
  "evidence_refs": []
}
```

Output:

```json
{
  "approved": false,
  "state": "blocked|needs_approval|approved|rejected",
  "reason": "string",
  "required_gate": "operator_approval|capability_test|readiness_audit|kill_switch_clear"
}
```

### POST /api/eden-skye/content-draft-router

Purpose: route content drafts to Shopify, Xyla, or Metricool draft queues after approval.

Routing priority:

1. Shopify for owned-site pages, posts, offer pages, product detail copy, and lead capture surfaces.
2. Xyla for social posting when connector capability is verified and approval is granted.
3. Metricool for draft routing or social scheduling when Xyla is unavailable or Metricool is explicitly selected.

Output must include destination, draft identifier when available, approval receipt, and publish-disabled state.

### POST /api/eden-skye/readiness-audit

Purpose: evaluate whether activation criteria are satisfied before any launch or posting.

Checks:

- capability tests complete
- source canon aligned
- Shopify website packet complete
- content packet complete
- approval-router passes
- kill-switch clear
- rollback plan present
- evidence references persisted

### POST /api/eden-skye/kill-switch

Purpose: read or set halt state. Setting halt state requires critical approval unless the request is emergency stop.

Output:

```json
{
  "halted": true,
  "scope": "global|shopify|xyla|metricool|supabase|n8n|vercel|drive",
  "reason": "string",
  "expires_at": null
}
```

### POST /api/eden-skye/final-activation-gate

Purpose: verify all readiness and approval requirements before any launch, publish, schedule, deployment, migration, or connected mutation.

Default output: blocked until explicit activation approval is recorded.

## Non-Goals

- No automatic deploy.
- No schema application.
- No Shopify mutation.
- No Xyla or Metricool publish/schedule.
- No Stripe or billing mutation.
- No Drive mutation.
- No n8n activation.

## Implementation Note

Future implementation should keep these routes idempotent, evidence-first, and deny-by-default. The routes should return dry-run decisions unless a signed approval receipt is present and the kill switch is clear.

# Eden Skye OS Approval-Router Contract

## Purpose

Classify proposed Eden Skye OS actions and return a deny-by-default authorization decision.

## Default Policy

No consequential action is allowed without an approval receipt. Draft generation is allowed as a planning action. Connector writes, publishing, scheduling, deployments, schema changes, Shopify mutations, Stripe mutations, and billing changes are blocked by default.

## Action Classes

Allowed without live mutation:

- create inert GitHub documentation artifacts
- generate draft content
- prepare implementation packets
- run read-only inspection

Approval required:

- Vercel deploy or route activation
- Supabase schema apply or data mutation
- Shopify page, blog, product, collection, navigation, checkout, app, or theme mutation
- Xyla posting or draft submission
- Metricool draft creation or scheduling
- n8n import or activation
- Drive write or canon update
- Stripe, pricing, payment, checkout, or billing changes

## Request Contract

```json
{
  "action_id": "uuid-or-deterministic-id",
  "system": "eden_skye_os",
  "actor": "operator|agent|workflow|manual",
  "target_platform": "github|shopify|xyla|metricool|supabase|drive|n8n|vercel|stripe",
  "action_type": "artifact_create|draft_create|connector_write|publish|schedule|deploy|schema_apply|billing|checkout|price_change",
  "risk_class": "low|medium|high|critical",
  "payload_summary": "human readable summary",
  "evidence_refs": [],
  "rollback_plan": "required for mutation",
  "requested_at": "iso-8601"
}
```

## Response Contract

```json
{
  "allowed": false,
  "state": "allowed_dry_run|needs_approval|blocked|approved|rejected",
  "risk_class": "low|medium|high|critical",
  "reason": "string",
  "required_evidence": [],
  "approval_receipt_id": null,
  "kill_switch_clear": false
}
```

## Risk Classification Rules

Low:

- additive docs
- inert scaffolds
- read-only checks

Medium:

- disabled n8n import
- draft connector writes where publish is disabled
- Drive canon edits

High:

- route deployment
- Supabase schema apply
- Shopify mutation
- social scheduling

Critical:

- public publishing
- checkout, Stripe, payment, billing, pricing
- autonomous workflow activation
- clearing global kill switch

## Distribution Decision Rule

For content workflows, approval router should classify Shopify, Xyla, and Metricool separately:

- Shopify website draft: medium after connector verification.
- Shopify public publish: critical.
- Xyla draft/post queue: medium if draft-only, critical if public posting.
- Metricool draft: medium.
- Metricool schedule/publish: high or critical depending channel and audience.

## Enforcement Invariants

- Deny if kill switch is halted.
- Deny if connector capability is unverified.
- Deny if rollback plan is missing for mutation.
- Deny if evidence refs are missing for high or critical action.
- Deny if operator approval is absent.
- Never infer approval from user frustration, urgency, or prior approval for a different gate.

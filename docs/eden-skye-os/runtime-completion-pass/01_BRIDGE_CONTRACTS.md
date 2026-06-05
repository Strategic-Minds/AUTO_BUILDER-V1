# Eden Skye OS Bridge Contracts

## Purpose

Define the inert bridge contracts required to connect Eden Skye OS orchestration to controlled execution layers. These contracts are additive documentation and do not create live routes or mutate connected systems.

## Bridge Set

### 1. Approval Router Bridge

- Contract: receive proposed actions, classify risk, and return approval state.
- Runtime class: governance.
- Mutation permission: none by default.
- Required evidence: action summary, target system, risk class, rollback plan, operator approval receipt.

### 2. Content Draft Bridge

- Contract: receive content drafts and route them to approved draft destinations.
- Primary destinations: Shopify owned-site draft surfaces, Xyla draft/post queue when verified, Metricool draft/schedule queue as fallback.
- Runtime class: distribution.
- Mutation permission: draft creation only after explicit approval and connector verification.
- Publishing permission: never automatic.

### 3. Shopify Website Bridge

- Contract: transform approved content and offers into Shopify page, blog, product, collection, or navigation change requests.
- Runtime class: commerce and owned-site distribution.
- Mutation permission: no live Shopify mutation until approval gate passes.
- Required evidence: target object, before-state, proposed after-state, rollback notes.

### 4. Xyla Posting Bridge

- Contract: route approved social content to Xyla when a verified Xyla connector or API path exists.
- Runtime class: social distribution.
- Mutation permission: disabled until connector capability test passes.
- Fallback: Metricool draft-routing bridge.

### 5. Metricool Draft-Routing Bridge

- Contract: submit approved content bundles into Metricool as drafts or scheduled items only when approved.
- Runtime class: social distribution and scheduling.
- Mutation permission: disabled until connector capability and operator approval pass.
- Publishing permission: approval-gated per campaign.

### 6. n8n Workflow Bridge

- Contract: import a disabled n8n workflow skeleton that routes events between source truth, approval, draft creation, readiness audit, and activation gate.
- Runtime class: automation.
- Mutation permission: import only; activation remains gated.

### 7. Supabase Evidence Bridge

- Contract: persist approval receipts, content drafts, kill-switch status, readiness audit events, and routing evidence after schema approval.
- Runtime class: evidence and state.
- Mutation permission: schema application disabled until explicit Supabase approval.

### 8. Drive Canon Bridge

- Contract: align source-of-truth docs, canonical brand materials, operating packets, and launch evidence into a Drive canon map.
- Runtime class: canon and documentation.
- Mutation permission: no Drive writes until approval.

## Shared Request Envelope

```json
{
  "system": "eden_skye_os",
  "bridge": "approval_router|content_draft|shopify_website|xyla_posting|metricool_draft|n8n_workflow|supabase_evidence|drive_canon",
  "mode": "draft|validate|request_approval|activate",
  "risk_class": "low|medium|high|critical",
  "target": {
    "platform": "shopify|xyla|metricool|supabase|drive|n8n|vercel",
    "object_type": "page|post|workflow|route|migration|doc|evidence",
    "object_id": null
  },
  "payload": {},
  "evidence": [],
  "approval": {
    "required": true,
    "status": "not_requested|pending|approved|rejected",
    "approved_by": null,
    "approved_at": null
  },
  "rollback": {
    "available": true,
    "plan": "Describe rollback before mutation."
  }
}
```

## Bridge Invariants

- Orchestration can propose, score, route, and validate.
- Execution requires connector capability, approval state, evidence receipt, and rollback path.
- Publishing is never implied by draft completion.
- Shopify, Xyla, and Metricool are distribution paths, not autonomous authority.
- Kill-switch state overrides approval state.

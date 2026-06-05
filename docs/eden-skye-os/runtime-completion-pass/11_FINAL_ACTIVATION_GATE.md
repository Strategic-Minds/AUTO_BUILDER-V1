# Eden Skye OS Final Activation Gate

## Gate Status

Status: blocked until explicit final activation approval after implementation and evidence review.

This artifact does not activate any route, workflow, schema, store change, publishing path, schedule, billing change, or connected mutation.

## Activation Criteria

All criteria must pass before live activation:

1. Artifact branch reviewed and accepted.
2. Bridge contracts implemented in sandbox or preview.
3. Vercel route stubs converted into tested routes after deployment approval.
4. Supabase migration reviewed, RLS designed, and schema application approved.
5. n8n packet imported disabled, reviewed, and activation approved.
6. Drive canon map completed and conflicts resolved.
7. Shopify website targets verified with before-state evidence.
8. Xyla connector/API capability verified or Metricool fallback selected.
9. Metricool connector/API capability verified if used.
10. Content bundles approved for each destination.
11. Approval-router returns approved for the exact action.
12. Kill switch is clear for the exact scope.
13. Rollback plan exists for every mutation.
14. Evidence receipt path is working.
15. Operator gives final activation approval.

## Final Activation Request Contract

```json
{
  "system": "eden_skye_os",
  "activation_id": "uuid",
  "requested_scope": "global|shopify|xyla|metricool|supabase|n8n|vercel|drive|stripe",
  "requested_actions": [],
  "readiness_audit_id": "string",
  "approval_receipt_ids": [],
  "kill_switch_state": "clear|required_block",
  "evidence_refs": [],
  "rollback_refs": [],
  "operator_final_approval": false
}
```

## Default Decision

```json
{
  "activation_allowed": false,
  "state": "blocked",
  "reason": "final_activation_approval_not_recorded",
  "next_required_step": "complete_readiness_audit_and_request_operator_approval"
}
```

## Shopify, Xyla, Metricool Activation Rule

- Shopify may activate only for approved owned-site objects with before-state and rollback evidence.
- Xyla may activate only after connector verification and explicit posting approval.
- Metricool may activate as fallback or alternate route only after connector verification and explicit draft/schedule approval.
- If Xyla is unverified, Metricool may be selected for drafts, but scheduling remains separately gated.
- If both Xyla and Metricool are unverified, store social content as inert drafts only.

## Explicitly Blocked By This Gate

- Production deployment without approval.
- Supabase schema application without approval.
- Shopify mutation without approval.
- Stripe or billing mutation without approval.
- Xyla posting without approval.
- Metricool scheduling or publishing without approval.
- n8n activation without approval.
- Drive mutation without approval.

## Next Safe State

After this artifact pass, the safest next state is branch review, then capability testing for Xyla and Metricool, then sandbox implementation of the route contracts. Activation remains blocked until a later final approval.

# Eden Skye OS Kill-Switch Contract

## Purpose

Provide a deny-first halt mechanism across Eden Skye OS bridges and execution routes.

## Default State

The kill switch should default to halted until explicitly cleared by operator approval after readiness audit passes.

## Scopes

- global
- shopify
- xyla
- metricool
- supabase
- n8n
- vercel
- drive
- stripe

## Kill-Switch State Contract

```json
{
  "system": "eden_skye_os",
  "scope": "global|shopify|xyla|metricool|supabase|n8n|vercel|drive|stripe",
  "halted": true,
  "reason": "default_halt_until_activation_approval",
  "set_by": "operator|governance_agent|system",
  "set_at": "iso-8601",
  "expires_at": null,
  "evidence_refs": []
}
```

## Enforcement Rules

- Global halt blocks every mutation, deployment, schema change, post, schedule, Shopify update, Stripe action, and n8n activation.
- Scoped halt blocks only the named platform or domain.
- Emergency stop can set halted=true without prior approval.
- Clearing halt requires approval-router approval, readiness audit pass, and evidence receipt.
- Clearing halt for Stripe, billing, checkout, or public publishing requires critical approval.

## Required Route Behavior

Every future route must check kill-switch state before connector mutation.

Required decision order:

1. Validate request envelope.
2. Read kill-switch state.
3. If global halted, block.
4. If scoped halted, block.
5. Run approval-router classification.
6. Verify capability evidence.
7. Verify rollback plan.
8. Execute only if all gates pass.

## Block Response

```json
{
  "allowed": false,
  "blocked_by": "kill_switch",
  "scope": "global",
  "reason": "default_halt_until_activation_approval",
  "next_required_gate": "final_activation_gate"
}
```

## Audit Requirements

- Every halt and clear event should be persisted as evidence after schema approval.
- Every blocked action should include action_id, target platform, and reason.
- Kill-switch state should be visible to readiness audit and final activation gate.

## Non-Mutation Boundary

This contract does not create a live kill switch, update Supabase, deploy routes, or alter any connected service.

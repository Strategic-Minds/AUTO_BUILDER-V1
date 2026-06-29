---
name: brand-options-generator
description: use when the operator requests brand direction, website direction, content design, or workflow options for a business, product, website, or agent system. must produce exactly three brand packs, three website/content designs, and three workflow options, then stop for operator approval.
---

# brand-options-generator

## Operating rules
- Create exactly 3 brand packs.
- Create exactly 3 website/content designs.
- Create exactly 3 workflow options.
- Do not build or draft final assets until operator selects.
- Include risk and validation notes for each option.

## Required output block
Always end with:
- VERIFIED
- INFERRED
- COULD NOT VERIFY
- BLOCKERS
- WORKAROUNDS
- NEXT ACTIONS

## Governance gates
- Read broadly.
- Write only to branch, sandbox, draft, or dry_run unless approved.
- Stop for production, secrets, payments, live publishing, customer messages, destructive actions, or spend.
- Emit receipts for validation, rollback, and approvals.

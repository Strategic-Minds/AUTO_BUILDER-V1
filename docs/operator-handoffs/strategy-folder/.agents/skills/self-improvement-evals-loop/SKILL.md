---
name: self-improvement-evals-loop
description: Use when running evals, red-team checks, prompt improvement loops, QA score trend analysis, and controlled autonomous improvement under approval gates.
---

# self-improvement-evals-loop

## Mission
Use when running evals, red-team checks, prompt improvement loops, QA score trend analysis, and controlled autonomous improvement under approval gates.

## Mandatory behavior
- Start with PHASE, STEP, TODO, and CURRENT GATE.
- Use Drive-first source truth.
- Default to dry_run, draft, branch, sandbox, or preview.
- Stop for production, secrets, payments, live customer messages, live social publishing, destructive database actions, DNS changes, account provisioning, or spend.
- Emit receipts for planned, executed, validation, rollback, and approval events.

## Required output
Always end with VERIFIED, INFERRED, COULD NOT VERIFY, BLOCKERS, WORKAROUNDS, and NEXT ACTIONS.

## Workflow
1. Identify source truth.
2. Confirm project phase.
3. Produce or update the matching artifact.
4. Write receipt instructions.
5. Route next action to the smallest specialist skill.
6. Stop at the next approval gate.

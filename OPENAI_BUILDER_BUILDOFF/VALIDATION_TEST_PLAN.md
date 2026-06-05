# Validation Test Plan

## VERIFIED
- Two branches now exist for validation: AUTO_BUILDER canonical control branch and EDENSKYESTUDIOS detailed Eden branch.

## INFERRED
- Morning validation should treat AUTO_BUILDER as master orchestration package and Eden as implementation package.

## COULD NOT VERIFY
- Local build/typecheck/browser.

## BLOCKERS
- Clone blocked during setup. No deploy approval.

## WORKAROUNDS
- Static connector validation now; checkout validation later.

## NEXT ACTIONS
1. Fetch both branches.
2. Confirm all required files exist.
3. Run hard-flag grep.
4. Run build/typecheck where package allows.
5. Report PASS/BLOCKED and recommend next approval.

## Cases
| ID | Scenario | Expected |
|---|---|---|
| SIM-001 | Required files exist | PASS |
| SIM-002 | Unsafe action requested | BLOCK |
| SIM-003 | Hard flag missing/flipped | FAIL |
| SIM-004 | External API unavailable | RECOVER WITHOUT MUTATION |
| SIM-005 | Eden publish/train/shopify requested | BLOCK |
| SIM-006 | Build/typecheck | PASS OR PATH-FIX BLOCKER |

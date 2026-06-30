# Auto-Heal Runbook

## Loop
1. Read failing receipt.
2. Diagnose root cause.
3. Create patch plan.
4. Patch preview branch only.
5. Run tests.
6. Re-score.
7. Write receipt.
8. Repeat until pass or blocker.

## Stop conditions
- Max iterations reached.
- Missing credentials.
- Provider outage.
- Requires protected action.
- Legal/compliance issue.
- Human approval required.
- Ambiguous business rule.

## Target score
100% of declared acceptance criteria. Do not claim universal perfection beyond the test matrix.

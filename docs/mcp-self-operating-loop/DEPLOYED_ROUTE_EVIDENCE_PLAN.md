# MCP Self-Operating Loop Deployed Route Evidence Plan

## Status

Draft for workflow validation after PR #25 is deployed to preview.

## Routes To Validate

| Route | Purpose | Expected Safe Behavior |
| --- | --- | --- |
| `/api/mcp-universe/registry` | Registry, ranking, summary, validation | Returns registry metadata and no secrets. |
| `/api/mcp-universe/readiness` | Provider/env readiness summary | Returns env names and booleans only, no secret values. |
| `/api/mcp-universe/approval-needed` | Guarded action queue | Returns approval requirements only, executes nothing. |
| `/api/mcp-universe/receipts` | Receipt contract and internal receipt creation | GET returns contract; POST creates internal receipt/dry-run. |
| `/api/cron/auto-builder-mcp-pulse` | 5-minute pulse | Reads metadata, creates internal receipt, reports queues. |
| `/api/mcp-universe/self-operating-loop` | Full internal self-operating loop | Runs pulse, readiness inventory, validation, auto-fix planning, optimization. |
| `/api/cron/mcp-self-operating-loop` | Scheduled self-operating loop | Same as above with cron token guard. |

## Required Evidence

For each route capture:

- HTTP status.
- Response `ok` or expected auth result.
- `productionActionAllowed: false` when applicable.
- No secret values in response.
- Receipt id or dry-run receipt summary where applicable.
- Error output if blocked.

## Browser / Playwright Evidence

Preview browser validation should capture:

- Route list page or direct JSON route response.
- Console errors.
- Network errors.
- Screenshot artifact for any UI route added later.
- Mobile viewport smoke if a UI dashboard is added.

## Command Shape

```bash
BASE_URL="https://<preview-url>"
curl -s "$BASE_URL/api/mcp-universe/registry" | jq '.ok, .productionActionAllowed'
curl -s "$BASE_URL/api/mcp-universe/readiness" | jq '.ok, .secretsExposed'
curl -s "$BASE_URL/api/mcp-universe/approval-needed" | jq '.ok, .productionActionAllowed'
curl -s "$BASE_URL/api/mcp-universe/receipts" | jq '.ok, .productionActionAllowed'
curl -s "$BASE_URL/api/cron/auto-builder-mcp-pulse" | jq '.ok, .productionActionAllowed'
curl -s "$BASE_URL/api/mcp-universe/self-operating-loop" | jq '.ok, .productionActionAllowed, .runId'
curl -s "$BASE_URL/api/cron/mcp-self-operating-loop" | jq '.ok, .productionActionAllowed, .runId'
```

## Pass Conditions

- Routes return 200 or expected 401 when cron token is configured and missing.
- No response leaks secret values.
- Approval-needed route lists guarded actions but performs none.
- Pulse and self-operating loop return internal work queues.
- Receipt creation uses telemetry helper or dry-run fallback.

## Fail Conditions

- Secret value appears in response.
- Any route performs live connector mutation.
- Any route deploys, publishes, sends, charges, refunds, changes DNS, changes secrets, or writes production DB schema.
- Pulse fails before returning a structured blocker.

## Next Step After Evidence

If preview evidence passes, create the staged adapter expansion packet and begin connector family dry-runs.

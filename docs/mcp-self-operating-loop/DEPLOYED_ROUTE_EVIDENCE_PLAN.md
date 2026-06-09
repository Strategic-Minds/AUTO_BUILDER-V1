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
| `/api/cron/auto-builder-mcp-pulse` | Protected 5-minute pulse | Requires cron token; unsigned public calls should return 401. |
| `/api/mcp-universe/cron-evidence/auto-builder-mcp-pulse` | Signed pulse evidence route | Requires HMAC signature; captures dry-run evidence for the protected cron path. |
| `/api/mcp-universe/self-operating-loop` | Full internal self-operating loop | Runs pulse, readiness inventory, validation, auto-fix planning, optimization. |
| `/api/cron/mcp-self-operating-loop` | Protected scheduled self-operating loop | Requires cron token; unsigned public calls should return 401. |
| `/api/mcp-universe/cron-evidence/self-operating-loop` | Signed self-operating loop evidence route | Requires HMAC signature; captures dry-run evidence for the protected cron path. |

## Required Evidence

For each route capture:

- HTTP status.
- Response `ok` or expected auth result.
- `productionActionAllowed: false` when applicable.
- No secret values in response.
- Receipt id or dry-run receipt summary where applicable.
- Error output if blocked.

## Signed Cron Evidence Headers

The signed dry-run evidence routes require:

- `x-awos-timestamp`: ISO-8601 timestamp within a 5-minute skew window.
- `x-awos-signature`: HMAC-SHA256 hex digest, optionally prefixed with `sha256=`.

Signing payload:

```text
<target>.<timestamp>.<pathname>
```

Targets:

- `auto-builder-mcp-pulse`
- `mcp-self-operating-loop`

The signing secret is resolved server-side from `CRON_DRY_RUN_SIGNING_SECRET` first, then `CRON_API_TOKEN`. Do not print, log, or expose the secret.

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
curl -i -s "$BASE_URL/api/cron/auto-builder-mcp-pulse" | head
curl -s "$BASE_URL/api/mcp-universe/self-operating-loop" | jq '.ok, .productionActionAllowed, .runId'
curl -i -s "$BASE_URL/api/cron/mcp-self-operating-loop" | head
```

Signed evidence example:

```bash
BASE_URL="https://<preview-url>"
TARGET="auto-builder-mcp-pulse"
PATHNAME="/api/mcp-universe/cron-evidence/auto-builder-mcp-pulse"
TS="$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
SIG="$(printf '%s' "$TARGET.$TS.$PATHNAME" | openssl dgst -sha256 -hmac "$CRON_DRY_RUN_SIGNING_SECRET" -hex | awk '{print $2}')"
curl -s "$BASE_URL$PATHNAME" \
  -H "x-awos-timestamp: $TS" \
  -H "x-awos-signature: sha256=$SIG" | jq '.ok, .productionActionAllowed, .evidenceMode, .signatureVerified'
```

Repeat with:

```bash
TARGET="mcp-self-operating-loop"
PATHNAME="/api/mcp-universe/cron-evidence/self-operating-loop"
```

## Pass Conditions

- Public routes return 200 and no secrets.
- Protected cron routes return expected 401 when unsigned.
- Signed cron evidence routes return 200 only with a valid HMAC signature.
- No response leaks secret values.
- Approval-needed route lists guarded actions but performs none.
- Pulse and self-operating loop return internal work queues.
- Receipt creation uses telemetry helper or dry-run fallback.

## Fail Conditions

- Secret value appears in response.
- Signed cron evidence route accepts missing, stale, or invalid signatures.
- Any route performs live connector mutation.
- Any route deploys, publishes, sends, charges, refunds, changes DNS, changes secrets, or writes production DB schema.
- Pulse fails before returning a structured blocker.

## Next Step After Evidence

If preview evidence passes, keep Wave 0/1 focused on GitHub, Vercel, and Supabase receipt persistence before widening adapters.

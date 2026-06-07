# Connector Router Vercel Workflow Builder Doc

Date: 2026-06-07
PR: #19
Phase: DOCS -> VERCEL WORKFLOW SUBMISSION
Status: builder-doc ready for Vercel Workflow intake

## 1. Current Status

The AUTO BUILDER OS finalization lane has these verified receipts:

- Generator tick verified by GitHub Actions artifact `7461773179`.
- Protected bridge policy smoke verified by artifact `7461814915`.
- Browser screenshot smoke verified by artifact `7461814915`.
- Supabase `runtime_telemetry_events` hardening verified on dev branch `eden-governed-runtime-test` / `jhzrkllkevahrotyyitr`.
- Generic bridge status routes verified for five supported bridge surfaces.

Remaining blocker for connector widening:

- Connector-specific router routes are missing on the PR #19 preview.

Missing routes currently return HTTP `404` with `{ "error": "Unsupported request" }`:

- `GET /api/bridge/connectors/status`
- `POST /api/bridge/connectors/dry-run`
- `POST /api/bridge/connectors/execute-approved`
- `GET /api/bridge/unblock/scan`

## 2. Source Truth

Use these files as source truth:

- `docs/auto-builder-os/connectors/CONNECTOR_DRY_RUN_RECEIPT_2026-06-07.md`
- `docs/auto-builder-os/supabase/RUNTIME_TELEMETRY_EVENTS_DEV_BRANCH_RECEIPT_2026-06-07.md`
- `docs/auto-builder-os/SYSTEM_STATUS_MATRIX.md`
- `docs/auto-builder-os/PROTECTED_ACTION_POLICY.md`
- `docs/auto-builder-os/AUTONOMOUS_BRIDGE_REQUIREMENTS.md`
- `docs/auto-builder-os/BUILD_EVIDENCE_REQUIREMENTS.md`
- `src/app/api/bridge/[bridge]/[action]/route.ts`
- `src/app/api/bridge/policy-check/route.ts`
- `scripts/bridge-smoke.mjs`
- `.github/workflows/awos-autonomous-bridge-smoke.yml`

## 3. System Boundary

Vercel builds and executes the system. GPT/AUTO BUILDER only orchestrates, documents, validates, queues, and gates.

This packet may implement preview-safe connector status/dry-run routes and receipt generation.

This packet must not execute:

- production deploy
- production database migration
- secret mutation
- outbound Google Chat message
- n8n workflow mutation
- Metricool live publish/schedule
- HeyGen paid render or publish
- Higgsfield paid render or publish
- credentialed browser action
- Shopify/Stripe/payment action
- customer message
- destructive action
- capital spend

## 4. Frontend Plan

Do not redesign the frontend.

Allowed frontend work, only if the current frontend already has matching panels:

- Show connector status cards.
- Show secret names only, never values.
- Show dry-run receipts.
- Show blockers and next actions.
- Show `execute-approved` as disabled unless approval proof exists.

If no matching panel exists, do not add a new visual system in this packet. Backend routes and receipts are the priority.

## 5. Backend Plan

Add a connector router under:

```text
src/app/api/bridge/connectors/status/route.ts
src/app/api/bridge/connectors/dry-run/route.ts
src/app/api/bridge/connectors/execute-approved/route.ts
src/app/api/bridge/unblock/scan/route.ts
src/lib/bridge/connector-registry.ts
src/lib/bridge/connector-dry-run.ts
src/lib/bridge/connector-receipts.ts
```

If local conventions prefer fewer files, keep route behavior equivalent and receipt-backed.

## 6. Required Connector Registry

Create a registry with these connectors:

| Connector | Required env names | Dry-run behavior | Mutation default |
|---|---|---|---|
| Google Chat | `GOOGLE_CHAT_WEBHOOK_URL` or `GOOGLE_CHAT_BOT_TOKEN` | verify env names/status only; do not send message | blocked |
| n8n | `N8N_BASE_URL`, `N8N_API_KEY`, `N8N_WEBHOOK_SECRET` | verify env names/status only; do not trigger live workflow | blocked |
| Metricool | `METRICOOL_API_KEY`, `METRICOOL_BRAND_ID`, `METRICOOL_PROFILE_ALLOWLIST` | verify env names/status only; do not schedule/publish | blocked |
| HeyGen | `HEYGEN_API_KEY` | verify env names/status only; do not render/publish | blocked |
| Higgsfield | `HIGGSFIELD_API_KEY` or `HIGGINGFIELD_API_KEY` | verify env names/status only; do not render/publish | blocked |
| Playwright runner | `PLAYWRIGHT_RUNNER_URL`, `PLAYWRIGHT_RUNNER_SECRET` | verify runner config/status only; do not use credentials | blocked |

Never return secret values. Only return:

- env name
- present boolean
- missing boolean
- masked status only

## 7. Route Contracts

### `GET /api/bridge/connectors/status`

Returns all connector readiness states.

Required response:

```json
{
  "ok": true,
  "mutation": false,
  "secretsExposed": false,
  "connectors": [
    {
      "id": "metricool",
      "name": "Metricool",
      "status": "ready|missing_env|blocked",
      "env": [
        { "name": "METRICOOL_API_KEY", "present": true, "valueExposed": false }
      ],
      "mutationDefault": "blocked",
      "nextAction": "run dry-run or add missing env"
    }
  ]
}
```

### `POST /api/bridge/connectors/dry-run`

Body:

```json
{
  "connector": "google_chat|n8n|metricool|heygen|higgsfield|playwright_runner|all",
  "mode": "names_only|harmless_probe",
  "approvalState": "not_required"
}
```

Required behavior:

- If connector is `all`, run all dry-runs.
- Do not mutate external systems.
- Do not send messages.
- Do not publish or schedule content.
- Do not render paid media.
- Do not expose secrets.
- Return receipt object.

Required response:

```json
{
  "ok": true,
  "mutation": false,
  "protectedActionsExecuted": false,
  "secretsExposed": false,
  "receipts": [
    {
      "connector": "google_chat",
      "status": "passed|missing_env|hard_gate",
      "checkedEnvNames": ["GOOGLE_CHAT_WEBHOOK_URL"],
      "missingEnvNames": [],
      "nextAction": "ready for approved execute gate"
    }
  ]
}
```

### `POST /api/bridge/connectors/execute-approved`

Body:

```json
{
  "connector": "google_chat|n8n|metricool|heygen|higgsfield|playwright_runner",
  "action": "string",
  "approval": {
    "approved": true,
    "approvalId": "string",
    "approvedBy": "operator",
    "approvedAt": "ISO timestamp"
  }
}
```

Required behavior:

- If approval proof is missing, return HTTP `423` or `403`.
- If action is protected and approval is pending/missing, block.
- No live action should be implemented until separate connector-by-connector approval and test receipts exist.

Required blocked response:

```json
{
  "ok": false,
  "allowed": false,
  "approvalRequired": true,
  "reason": "approval_proof_required",
  "mutation": false,
  "protectedActionsExecuted": false
}
```

### `GET /api/bridge/unblock/scan`

Returns all known bridge blockers and maps each blocker to a connector, route, missing env, or approval gate.

Required response:

```json
{
  "ok": true,
  "mutation": false,
  "blockers": [
    {
      "id": "connector_router_missing",
      "status": "open|cleared|hard_gate",
      "owner": "AUTO_BUILDER",
      "nextAction": "implement connector dry-run route",
      "receiptRequired": true
    }
  ]
}
```

## 8. Vercel Workflow Plan

Use Vercel Workflow as the durable orchestration layer for connector clearance.

Workflow name:

```text
connector-router-clearance-workflow
```

Workflow phases:

1. Load connector registry.
2. Run secret names-only status check.
3. Run connector dry-runs in order.
4. Verify `execute-approved` blocks without approval proof.
5. Write receipts.
6. Update system status matrix or receipt artifact.
7. Stop at production/external mutation gates.

Connector dry-run order:

1. Google Chat
2. n8n
3. Metricool
4. HeyGen
5. Higgsfield
6. Playwright runner

## 9. Five-Minute Cron Plan

Use a Vercel Cron Job to trigger the non-mutating connector validator every five minutes.

Cron route:

```text
/api/cron/connector-router-validator
```

Cron schedule:

```text
*/5 * * * *
```

`vercel.json` target shape:

```json
{
  "crons": [
    {
      "path": "/api/cron/connector-router-validator",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Cron route requirements:

- Verify `Authorization: Bearer ${CRON_SECRET}`.
- Do not mutate external systems.
- Call the connector status and dry-run logic in `names_only` mode.
- Emit a receipt.
- Return next action.
- If connector routes are missing, return `hard_gate_missing_connector_router`.

Expected cron response:

```json
{
  "ok": true,
  "job": "connector-router-validator",
  "schedule": "*/5 * * * *",
  "mutation": false,
  "protectedActionsExecuted": false,
  "secretsExposed": false,
  "summary": {
    "connectorsChecked": 6,
    "passed": 0,
    "missingEnv": 0,
    "hardGates": 0
  },
  "nextAction": "run connector dry-runs or resolve missing env"
}
```

## 10. Validation Plan

Run these checks in preview before any production widening:

1. `GET /api/bridge/connectors/status`
2. `POST /api/bridge/connectors/dry-run` with `{ "connector": "all", "mode": "names_only" }`
3. `POST /api/bridge/connectors/execute-approved` without approval proof and confirm blocked.
4. `GET /api/bridge/unblock/scan`
5. `GET /api/cron/connector-router-validator` with cron auth.
6. Browser screenshot of connector status route or frontend panel if available.
7. Git status receipt.
8. Artifact receipt upload.

Acceptance evidence:

- HTTP 200 for status and dry-run routes.
- HTTP 403/423 for unapproved execute route.
- No secret values in response.
- No external mutation.
- No outbound message.
- No social publish.
- No paid render.
- No payment/commerce action.
- Receipt artifact saved.

## 11. Required Docs And Playbooks

Add/update:

- `docs/auto-builder-os/connectors/CONNECTOR_ROUTER_IMPLEMENTATION_RECEIPT.md`
- `docs/auto-builder-os/connectors/CONNECTOR_DRY_RUN_RECEIPT_YYYY-MM-DD.md`
- `docs/auto-builder-os/SYSTEM_STATUS_MATRIX.md`
- `docs/auto-builder-os/vercel/CONNECTOR_ROUTER_VERCEL_WORKFLOW_RECEIPT.md`

## 12. Blockers Or Missing Pieces

Current blockers:

- Connector-specific routes missing.
- Production telemetry migration still gated.
- Live connector dry-runs cannot run until routes exist.
- Live connector mutation cannot run until explicit approval and connector-specific proof exist.

## 13. Next Best Prompt

Submit this packet to Vercel Workflow and implement only the connector dry-run router, 5-minute non-mutating validator, receipts, and status matrix updates. Preserve all protected gates. Do not execute production DB migration, send messages, publish social posts, run paid media renders, or perform credentialed browser actions without explicit approval.

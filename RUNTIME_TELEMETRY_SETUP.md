# AUTO BUILDER Runtime Telemetry Setup

## Required Environment Variables

Configure these in the protected Vercel preview environment:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
RUNTIME_INGEST_TOKEN=
PLAYWRIGHT_WORKER_URL=
PLAYWRIGHT_HEARTBEAT_URL=
MODEL_TELEMETRY_ENABLED=true
```

## Runtime Ingestion Endpoints

### Health

```text
GET /api/runtime/health
```

### Telemetry Snapshot

```text
GET /api/runtime/telemetry
```

### Agent Heartbeats

```text
POST /api/runtime/heartbeat
Authorization: Bearer <RUNTIME_INGEST_TOKEN>
```

Payload:

```json
{
  "agent": "playwright-runtime-worker",
  "surface": "browser-session",
  "currentTask": "shopify-validation",
  "latencyMs": 210,
  "runtimeStatus": "online"
}
```

### Queue Metrics

```text
POST /api/runtime/queue-metric
Authorization: Bearer <RUNTIME_INGEST_TOKEN>
```

### Playwright Sessions

```text
POST /api/runtime/playwright-session
Authorization: Bearer <RUNTIME_INGEST_TOKEN>
```

## Validation Flow

1. Deploy branch preview to Vercel.
2. Configure protected preview environment variables.
3. Apply SQL from `/api/runtime/telemetry` into Supabase.
4. Send heartbeat test payload.
5. Send queue metric payload.
6. Send Playwright session payload.
7. Validate rows in Supabase.
8. Validate dashboard status transitions.
9. Verify runtime health endpoint.

## Governance Rules

- Never fabricate runtime evidence.
- All dashboard states must derive from persisted telemetry.
- Production merge requires:
  - verified heartbeat rows
  - queue evidence
  - rollback validation
  - authenticated ingestion
  - preview environment verification

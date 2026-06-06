# Eden Universal Runtime Bridge

## Purpose

`/api/bridge/eden/runtime` is the governed bridge for Eden Skye GPT runtimes to read, queue, write, and execute across GitHub, Vercel, Supabase, Google Drive, Shopify, and HeyGen from Auto Builder cloud.

It does not create an unrestricted super-admin path. External writes and executions require:

1. `Authorization: Bearer <EDEN_RUNTIME_BRIDGE_TOKEN>`
2. `approvedExternalWrite: true`
3. the correct approval phrase

## Route

```http
GET /api/bridge/eden/runtime
POST /api/bridge/eden/runtime
```

## Required Environment

Core bridge auth:

```env
EDEN_RUNTIME_BRIDGE_TOKEN=strong-shared-secret-for-eden-gpt-runtimes
```

GitHub:

```env
GITHUB_WORKFLOW_TOKEN=github-token-with-actions-read-write-and-contents-read
```

Vercel:

```env
VERCEL_TOKEN=vercel-token
AUTO_BUILDER_VERCEL_PROJECT_ID=auto-builder-project-id
EDEN_SKYE_VERCEL_PROJECT_ID=prj_mtmJQYYqRodNnH2UrDqwaK2MHgoA
VERCEL_TEAM_ID=optional-team-id
```

Supabase:

```env
SUPABASE_URL=project-url
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

Google Drive runtime adapter readiness:

```env
GOOGLE_CLIENT_EMAIL=service-account-email
GOOGLE_PRIVATE_KEY=service-account-private-key
```

Shopify runtime adapter readiness:

```env
SHOPIFY_ADMIN_TOKEN=shopify-admin-token
SHOPIFY_SHOP=eden-skye-studios.myshopify.com
```

HeyGen runtime adapter readiness:

```env
HEYGEN_API_KEY=heygen-api-key
```

## Approval Phrases

Write requests:

```text
APPROVE EDEN RUNTIME WRITE
```

Execute requests:

```text
APPROVE EDEN RUNTIME EXECUTE
```

Production deploys, Shopify mutations, public publishing, payment/discount changes, Supabase schema mutations, and destructive GitHub actions remain separately approval-gated.

## Provider Status

- GitHub: executable through the GitHub workflow bridge when token is configured.
- Vercel: executable through the governed redeploy bridge when token/project IDs are configured.
- Supabase: executable for REST reads and safe bridge-table inserts only. Schema changes remain blocked.
- Drive: queue-first until a server-side Drive adapter is installed.
- Shopify: queue-first until a server-side Shopify adapter is installed and mutation approval is present.
- HeyGen: queue-first until a server-side HeyGen adapter is installed and media-production approval is present.

## Readiness

```http
GET /api/bridge/eden/runtime
```

## GitHub Workflow Dispatch Example

```json
{
  "provider": "github",
  "intent": "execute",
  "action": "dispatch_workflow",
  "approvedExternalWrite": true,
  "approvalPhrase": "APPROVE EDEN RUNTIME EXECUTE",
  "payload": {
    "operation": "dispatch",
    "targetSystem": "auto_builder",
    "workflowId": "vercel-redeploy.yml",
    "ref": "main",
    "inputs": {
      "target_system": "eden_skye_studios",
      "mode": "preview",
      "ref": "main"
    },
    "requestedBy": "Eden Skye Runtime"
  }
}
```

## Vercel Preview Redeploy Example

```json
{
  "provider": "vercel",
  "intent": "execute",
  "action": "preview_redeploy",
  "approvedExternalWrite": true,
  "approvalPhrase": "APPROVE EDEN RUNTIME EXECUTE",
  "payload": {
    "targetSystem": "eden_skye_studios",
    "mode": "preview",
    "ref": "main",
    "requestedBy": "Eden Skye Runtime"
  }
}
```

## Supabase Read Example

```json
{
  "provider": "supabase",
  "intent": "read",
  "action": "select",
  "payload": {
    "table": "bridge_evidence",
    "method": "GET",
    "select": "*",
    "limit": 10
  }
}
```

## Drive / Shopify / HeyGen Queue Example

```json
{
  "provider": "heygen",
  "intent": "queue",
  "action": "create_avatar_video_packet",
  "payload": {
    "brief": "Create a platform-safe Eden Skye intro clip for preview approval."
  }
}
```

## Governance

This bridge is designed for maximum controlled autonomy:

- reads are open where provider credentials exist
- writes/execution require bearer auth and approval phrase
- high-risk business actions remain separately locked
- every operation logs evidence or blockers through the telemetry store when configured

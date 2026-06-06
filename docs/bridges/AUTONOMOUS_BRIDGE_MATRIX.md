# AUTO_BUILDER Autonomous Bridge Matrix

## Purpose

This document defines the autonomous bridge layer for connected applications. It separates apps that are executable in the current ChatGPT tool surface from apps that require AUTO_BUILDER runtime adapters, Vercel environment variables, OAuth/API credentials, or provider-specific deployment wiring.

## Bridge Principle

AUTO_BUILDER should use read/write autonomy for reversible and operational tasks, while routing public publishing, financial actions, destructive actions, and authority mutations through explicit approval gates unless a governed policy is installed.

## Active Runtime Bridge Foundation

The following bridge files exist or are expected in the runtime system:

- `src/lib/social/socialBridgeTypes.ts`
- `src/lib/social/metricoolClient.ts`
- `src/lib/social/socialBridgeQueue.ts`
- `src/lib/providers/providerTypes.ts`
- `src/lib/providers/providerCatalog.ts`
- `src/lib/providers/providerSafety.ts`
- `src/lib/providers/runtimeProviderStatus.ts`
- `src/lib/bridges/edenUniversalRuntimeBridge.ts`
- `src/lib/bridges/githubWorkflowBridge.ts`
- `src/lib/bridges/edenVercelPreviewBridge.ts`
- `src/lib/bridges/vercelRedeployBridge.ts`
- `src/app/api/bridge/providers/runtime-status/route.ts`
- `src/app/api/bridge/eden/runtime/route.ts`
- `src/app/api/bridge/github/workflows/route.ts`
- `src/app/api/bridge/social-media/draft/route.ts`
- `src/app/api/bridge/vercel/eden-preview/route.ts`
- `src/app/api/bridge/vercel/redeploy/route.ts`
- `src/app/api/cron/social-bridge/route.ts`

## Provider Matrix

| Provider | Bridge Status | Write Path | Notes |
|---|---|---|---|
| Eden Universal Runtime | Runtime bridge scaffolded | Central governed read/write/execute router for GitHub, Vercel, Supabase, Drive, Shopify, HeyGen | Uses `EDEN_RUNTIME_BRIDGE_TOKEN`; writes and executions require approval phrase; Drive/Shopify/HeyGen remain queue-first until adapters are installed. |
| GitHub | Active in ChatGPT and runtime-capable | Repo files, issues, PRs | Used for AUTO_BUILDER source mutation. |
| GitHub Workflows | Runtime bridge scaffolded | List workflows, runs, jobs, logs; dispatch workflow_dispatch | Uses `GITHUB_WORKFLOW_TOKEN` or `GITHUB_TOKEN`; risky dispatches require approval phrase. |
| Vercel Eden Preview | Runtime bridge scaffolded | Preview deployment only | Uses `VERCEL_TOKEN` plus `EDEN_SKYE_VERCEL_PROJECT_ID` or `TARGET_VERCEL_PROJECT_ID`; production is hard-blocked. |
| Vercel Redeploy | Runtime bridge scaffolded | Auto Builder or Eden preview redeploy | Uses `VERCEL_TOKEN`; Auto Builder targets `AUTO_BUILDER_VERCEL_PROJECT_ID` or `VERCEL_PROJECT_ID`; production requires explicit approval phrase. |
| Google Drive | Active in ChatGPT; runtime adapter needed for Vercel | Docs, Sheets, Slides | Use for evidence docs, operating packets, validation logs. |
| Google Calendar | Active in ChatGPT; runtime adapter needed for Vercel | Events, review checkpoints | Use for validation checkpoints and approval windows. |
| Gmail | Active in ChatGPT; runtime adapter needed for Vercel | Drafts and labels | Use drafts for operational handoff; no send without explicit approval. |
| Supabase | Runtime-backed through telemetry-store | Telemetry tables and safe REST bridge operations | Schema changes and arbitrary table writes remain blocked. |
| Shopify | ChatGPT connector active; runtime adapter env checked | Queue-first store action packets | Product, price, discount, inventory, media, and theme writes remain approval-gated. |
| HeyGen | ChatGPT connector active; runtime adapter env checked | Queue-first avatar/video/speech packets | Live avatar sessions and media production actions remain approval-gated. |
| Metricool | Runtime bridge scaffolded | Facebook/Instagram draft flow | Requires Metricool runtime env and API confirmation. |
| Facebook | Via Metricool or Meta provider | Draft or publish depending policy | Live post requires provider readiness and approval policy. |
| Instagram | Via Metricool or Meta provider | Draft or publish depending policy | Connected-to-Facebook target label exists; live account ID must be verified. |
| Notion | Placeholder until connector/runtime API is available | Tasks/docs/databases | No live Notion write adapter verified in current surface. |
| Klaviyo | Placeholder until connector/runtime API is available | Draft campaigns/flows | No live campaign send without explicit approval. |
| Xyla | Placeholder/runtime env checked | Creative generation/scheduling | Requires runtime provider adapter. |
| Opus | Placeholder/runtime env checked | Clip jobs/captions | Requires runtime provider adapter. |

## Default Autonomy Policy

Allowed autonomously:

- Safe reads
- Draft creation
- Internal queueing
- Internal logs
- Evidence records
- Non-public document creation
- Calendar checkpoints
- Gmail drafts
- GitHub workflow, run, job, and log reads
- Safe workflow dispatches that do not trigger risk words
- Preview deploys when the bridge is configured and the target is not production

Approval-gated:

- Public publishing
- Sending email/SMS
- Live social engagement
- Financial actions
- Destructive changes
- Authority/source-truth mutation
- Production deployment
- Database schema mutation
- Risky GitHub workflow dispatches involving production, deploy, publish, store/payment, migration, delete, or release intent

## Eden Universal Runtime Payloads

Readiness:

```http
GET /api/bridge/eden/runtime
```

GitHub workflow execution through the universal route:

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

Supabase read through the universal route:

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

Drive, Shopify, and HeyGen queue-first packets:

```json
{
  "provider": "shopify",
  "intent": "queue",
  "action": "prepare_product_update",
  "payload": {
    "title": "Eden Skye Black Card",
    "approvalRequired": true
  }
}
```

## GitHub Workflow Bridge Payloads

Readiness and workflow list:

```http
GET /api/bridge/github/workflows
GET /api/bridge/github/workflows?operation=list_workflows&targetSystem=auto_builder
```

Read recent workflow runs:

```http
GET /api/bridge/github/workflows?operation=list_runs&targetSystem=auto_builder&perPage=10
```

Read jobs for a run:

```http
GET /api/bridge/github/workflows?operation=list_jobs&targetSystem=auto_builder&runId=123456789
```

Dispatch a safe workflow:

```json
{
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
```

Risky workflow dispatch requires:

```json
{
  "approvedWorkflowRun": true,
  "approvalPhrase": "APPROVE GITHUB WORKFLOW RUN"
}
```

## Eden Vercel Preview Payload

```json
{
  "ref": "main",
  "target": "preview",
  "requestedBy": "Eden Skye Runtime",
  "routesToCheck": ["/", "/login", "/payment", "/closet", "/api/readiness", "/api/bridge/stack-readiness"]
}
```

Validation route:

1. `GET /api/bridge/providers/runtime-status`
2. `GET /api/bridge/vercel/eden-preview`
3. `POST /api/bridge/vercel/eden-preview`
4. Check returned `deploymentUrl` and bridge evidence.

## Governed Redeploy Payload

Preview redeploy of Auto Builder:

```json
{
  "targetSystem": "auto_builder",
  "mode": "preview",
  "ref": "main",
  "requestedBy": "Eden Skye Runtime"
}
```

Preview redeploy of Eden Skye Studios:

```json
{
  "targetSystem": "eden_skye_studios",
  "mode": "preview",
  "ref": "main",
  "requestedBy": "Eden Skye Runtime"
}
```

Production deploy requires:

```json
{
  "mode": "production",
  "approvedProductionDeploy": true,
  "approvalPhrase": "APPROVE PRODUCTION DEPLOY"
}
```

## Social Bridge Test Payload

```json
{
  "brand_id": "6316987",
  "network": "facebook",
  "content_type": "POST",
  "target": "eden_skye_facebook",
  "approved": true,
  "caption": "Meet Eden Skye.\n\nBuilt to think clearly, move strategically, and help turn scattered ideas into systems that actually execute.\n\nThis is not just content.\nThis is the beginning of an AI-powered brand engine.\n\nWhat should Eden build first?",
  "first_comment": "Comment \"EDEN\" if you want to watch this system come alive.",
  "media_source": "text_only_validation_test"
}
```

## Validation Order

1. `GET /api/bridge/providers/runtime-status`
2. `GET /api/bridge/eden/runtime`
3. `GET /api/bridge/github/workflows`
4. `GET /api/bridge/vercel/redeploy`
5. `POST /api/bridge/github/workflows` to dispatch a preview workflow when configured
6. `POST /api/bridge/vercel/redeploy` in preview mode
7. `POST /api/bridge/social-media/draft`
8. `GET /api/cron/social-bridge`
9. Check bridge evidence and blockers.

## Next Required Runtime Step

Deploy the latest AUTO_BUILDER repo state, set `EDEN_RUNTIME_BRIDGE_TOKEN`, verify runtime provider readiness, then run a single universal runtime bridge readiness check, GitHub workflow bridge read cycle, governed redeploy bridge cycle, Eden Vercel preview bridge cycle, and draft-only social bridge cycle before enabling recurring automation.

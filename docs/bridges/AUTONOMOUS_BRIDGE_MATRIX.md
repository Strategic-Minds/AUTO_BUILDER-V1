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
- `src/lib/bridges/edenVercelPreviewBridge.ts`
- `src/app/api/bridge/providers/runtime-status/route.ts`
- `src/app/api/bridge/social-media/draft/route.ts`
- `src/app/api/bridge/vercel/eden-preview/route.ts`
- `src/app/api/cron/social-bridge/route.ts`

## Provider Matrix

| Provider | Bridge Status | Write Path | Notes |
|---|---|---|---|
| GitHub | Active in ChatGPT and runtime-capable | Repo files, issues, PRs | Used for AUTO_BUILDER source mutation. |
| Vercel Eden Preview | Runtime bridge scaffolded | Preview deployment only | Uses `VERCEL_TOKEN` plus `EDEN_SKYE_VERCEL_PROJECT_ID` or `TARGET_VERCEL_PROJECT_ID`; production is hard-blocked. |
| Google Drive | Active in ChatGPT; runtime adapter needed for Vercel | Docs, Sheets, Slides | Use for evidence docs, operating packets, validation logs. |
| Google Calendar | Active in ChatGPT; runtime adapter needed for Vercel | Events, review checkpoints | Use for validation checkpoints and approval windows. |
| Gmail | Active in ChatGPT; runtime adapter needed for Vercel | Drafts and labels | Use drafts for operational handoff; no send without explicit approval. |
| Supabase | Runtime-backed through telemetry-store | Telemetry tables | Existing REST write path when env is configured. |
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
2. `POST /api/bridge/social-media/draft`
3. `GET /api/cron/social-bridge`
4. Check bridge evidence and blockers.

## Next Required Runtime Step

Deploy the latest AUTO_BUILDER repo state, verify runtime provider readiness, then run a single Eden Vercel preview bridge cycle and a single draft-only social bridge cycle before enabling recurring automation.

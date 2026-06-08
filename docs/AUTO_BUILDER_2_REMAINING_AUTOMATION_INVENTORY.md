# AUTO BUILDER 2 Remaining Automation Inventory

This file is the repo-level source of truth for everything still required after the universal capability bus scaffold.

## Remaining Core Files

- src/lib/autobuilder-v2/task-executor.ts
- src/lib/autobuilder-v2/persistent-queue.ts
- src/lib/autobuilder-v2/persistent-receipts.ts
- src/lib/autobuilder-v2/provider-adapter-factory.ts
- src/lib/autobuilder-v2/provider-adapter-contract.ts
- src/lib/autobuilder-v2/operator-policy.ts
- src/lib/autobuilder-v2/project-records.ts
- src/lib/autobuilder-v2/pipeline-state.ts
- src/lib/autobuilder-v2/env-bindings.ts
- src/lib/autobuilder-v2/auth-bindings.ts
- src/lib/autobuilder-v2/result-normalizer.ts
- src/lib/autobuilder-v2/errors.ts
- src/lib/autobuilder-v2/fallbacks.ts

## Remaining API Routes

- src/app/api/autobuilder-v2/health/route.ts
- src/app/api/autobuilder-v2/capabilities/route.ts
- src/app/api/autobuilder-v2/connectors/route.ts
- src/app/api/autobuilder-v2/actions/route.ts
- src/app/api/autobuilder-v2/execute/route.ts
- src/app/api/autobuilder-v2/pipeline/route.ts
- src/app/api/autobuilder-v2/receipts/route.ts
- src/app/api/autobuilder-v2/auth-check/route.ts
- src/app/api/autobuilder-v2/operator-policy/route.ts

## Remaining Cron Wiring

- Update src/app/api/cron/autobuilder-v2-five-minute/route.ts so it calls runAutoBuilderV2Workflow().
- Ensure vercel.json includes /api/cron/autobuilder-v2-five-minute on */5 * * * *.
- Ensure workflow output includes validation result, repair queue, receipt, and next repair actions.

## Remaining Provider Adapter Files

- src/lib/autobuilder-v2/providers/github.ts
- src/lib/autobuilder-v2/providers/vercel.ts
- src/lib/autobuilder-v2/providers/shopify.ts
- src/lib/autobuilder-v2/providers/google-workspace.ts
- src/lib/autobuilder-v2/providers/google-cloud.ts
- src/lib/autobuilder-v2/providers/n8n.ts
- src/lib/autobuilder-v2/providers/supabase.ts
- src/lib/autobuilder-v2/providers/openai-platform.ts
- src/lib/autobuilder-v2/providers/stripe.ts
- src/lib/autobuilder-v2/providers/hubspot.ts
- src/lib/autobuilder-v2/providers/heygen.ts
- src/lib/autobuilder-v2/providers/higgsfield.ts
- src/lib/autobuilder-v2/providers/runway.ts
- src/lib/autobuilder-v2/providers/canva.ts
- src/lib/autobuilder-v2/providers/adobe-express.ts
- src/lib/autobuilder-v2/providers/metricool.ts
- src/lib/autobuilder-v2/providers/xyla.ts
- src/lib/autobuilder-v2/providers/whatsapp.ts
- src/lib/autobuilder-v2/providers/facebook.ts
- src/lib/autobuilder-v2/providers/instagram.ts
- src/lib/autobuilder-v2/providers/snapchat.ts
- src/lib/autobuilder-v2/providers/x.ts
- src/lib/autobuilder-v2/providers/linkedin.ts
- src/lib/autobuilder-v2/providers/tiktok.ts
- src/lib/autobuilder-v2/providers/youtube.ts
- src/lib/autobuilder-v2/providers/pinterest.ts
- src/lib/autobuilder-v2/providers/threads.ts
- src/lib/autobuilder-v2/providers/reddit.ts
- src/lib/autobuilder-v2/providers/browser.ts
- src/lib/autobuilder-v2/providers/playwright.ts
- src/lib/autobuilder-v2/providers/edenskyestudios.ts
- src/lib/autobuilder-v2/providers/autobuilderos.ts
- src/lib/autobuilder-v2/providers/universal-app.ts

## Remaining OpenAPI / GPT Action Files

- docs/openapi/autobuilder-v2-actions.openapi.yaml
- public/openapi/autobuilder-v2-actions.openapi.yaml if public exists.

## Remaining Validation Scripts

- scripts/validate-autobuilder-v2.mjs
- scripts/smoke-autobuilder-v2-actions.mjs
- scripts/scan-autobuilder-v2-connectors.mjs

## Remaining Package Scripts

- validate:autobuilder-v2
- smoke:autobuilder-v2
- scan:autobuilder-v2

## Remaining Runtime Behavior

- Workflow must read this inventory.
- Workflow must turn each missing file into a repair task.
- Workflow must turn each missing route into a repair task.
- Workflow must turn each missing adapter into a repair task.
- Workflow must return receipts every 5 minutes.
- Workflow must keep running until every item is done or classified.

## n8n Required Runtime Bindings

- N8N_MCP_SERVER_URL
- N8N_MCP_ACCESS_TOKEN
- N8N_WEBHOOK_URL optional
- N8N_BASE_URL optional

Do not store access token values in GitHub.

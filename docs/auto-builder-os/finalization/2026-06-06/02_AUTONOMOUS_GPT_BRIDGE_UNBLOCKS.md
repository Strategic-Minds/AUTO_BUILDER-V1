# Autonomous GPT Bridge Unblock Plan

## Objective

Enable GPT and AUTO BUILDER OS to operate the stack with maximum safe autonomy: read broadly, write in branches/sandboxes, execute harmless commands and workflow dry runs, administer sandbox resources, and stop at protected production gates.

## Required Bridge Classes

1. Read Bridge
   - Repos, docs, Drive files, Supabase metadata, Vercel deployments, Shopify products/orders read-only, social analytics, n8n workflow status.

2. Write-Branch Bridge
   - GitHub branch file writes, draft PRs, generated docs, build packets, code patches.

3. Sandbox Execute Bridge
   - Playwright screenshot jobs, local/browser workers, Vercel Sandbox jobs, harmless commands, test runners, smoke workflows.

4. Sandbox Admin Bridge
   - Supabase development branch migrations, sandbox env checks, queue table writes, branch-only receipts.

5. Production-Gated Bridge
   - Production deploys, production Supabase migrations, secret changes, live Shopify writes, Stripe/payments, public social publishing, customer messaging, destructive actions.

## Connector Matrix

| Connector | Read | Write | Execute | Admin | Gate |
| --- | --- | --- | --- | --- | --- |
| GitHub | repo/files/PRs | branches/draft PRs | Actions safe dispatch | branch settings when approved | merge/protected branch |
| Vercel | projects/deployments/logs | preview deploy | workflow/sandbox/cron | env/project settings gated | production deploy/env |
| Supabase | metadata/advisors/logs | dev branch tables | SQL dry run/branch migration | dev branch admin | production migration/service role |
| Google Drive | docs/sheets/slides | docs/build packs | export/import | folder governance | external sharing |
| Google Chat | channel/space status | approval messages | webhook notifications | bot config gated | external/customer messages |
| Shopify | shop/products/orders read | draft products/metafields gated | webhook replay | live store gated | live store/payment mutation |
| HeyGen | avatars/voices/status | drafts gated | video draft job | paid generation gated | public video delivery |
| Xyla | asset/status | draft assets | sandbox generation | publishing gated | auto-publish |
| Metricool | analytics/status | draft posts | schedule draft gated | publish gated | live publish |
| n8n | workflows/executions | draft workflow | webhook replay | active workflow gated | live external actions |
| AI Gateway | model/status/cost | run receipts | model calls | budget config gated | budget/provider widening |
| Codex | inspect repos | branch patches | tests | PR automation gated | merge/deploy |
| Playwright | screenshots | evidence files | browser tests | local worker gated | form submission/purchase |

## Required Backend Routes

- `/api/bridge/registry`
- `/api/bridge/env-names`
- `/api/bridge/policy-check`
- `/api/bridge/inbound`
- `/api/bridge/dispatch`
- `/api/bridge/events`
- `/api/bridge/connections`
- `/api/bridge/retry`
- `/api/bridge/google-chat/*`
- `/api/bridge/n8n/*`
- `/api/bridge/github/workflows`
- `/api/bridge/vercel/*`
- `/api/bridge/supabase-admin`
- `/api/browser/*`
- `/api/codex/*`

## Required Env Names

Expose presence only, never values:

- `AUTO_BUILDER_BRIDGE_TOKEN`
- `AUTO_BUILDER_ADMIN_WRITE_ENABLED`
- `BRIDGE_SECRET`
- `BRIDGE_OUTBOUND_DISPATCH_ENABLED`
- `CRON_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BRIDGE_TABLE_ALLOWLIST`
- `SUPABASE_BRIDGE_RPC_ALLOWLIST`
- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`
- `AUTO_BUILDER_VERCEL_PROJECT_ID`
- `V0_AUTO_BUILDER_VERCEL_PROJECT_ID`
- `AI_GATEWAY_API_KEY`
- `AI_GATEWAY_BASE_URL`
- `OPENAI_API_KEY`
- `GITHUB_TOKEN`
- `GOOGLE_CHAT_WEBHOOK_URL`
- `GOOGLE_CHAT_SPACE_ID`
- `GOOGLE_CHAT_BOT_TOKEN`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `N8N_WEBHOOK_URL`
- `N8N_API_KEY`
- `SHOPIFY_ADMIN_TOKEN`
- `SHOPIFY_SHOP`
- `HEYGEN_API_KEY`
- `XYLA_API_KEY`
- `METRICOOL_API_TOKEN`
- `METRICOOL_API_URL`
- `BROWSER_WORKER_TOKEN`

## Smoke Order

1. Heartbeat.
2. Secret names only.
3. Harmless read.
4. Harmless branch write.
5. Harmless command/test.
6. Browser screenshot.
7. Git status.
8. Supabase dev branch write.
9. Google Chat sandbox notification.
10. n8n webhook replay.
11. AI Gateway model route dry run.
12. Social draft-only run.
13. Store read-only readiness.
14. Connector-by-connector widening.

## Unblock Order

1. Replace Slack with Google Chat.
2. Apply bridge event bus in sandbox branch.
3. Fix Supabase policy warnings for bridge-critical tables.
4. Add Vercel Workflow and Sandbox receipts.
5. Add AI Gateway route and cost ledger.
6. Add Codex job queue.
7. Add n8n inbound/outbound bridge.
8. Add social draft pipeline.
9. Add frontend connector panels.
10. Run full smoke and lock release gate until clean.

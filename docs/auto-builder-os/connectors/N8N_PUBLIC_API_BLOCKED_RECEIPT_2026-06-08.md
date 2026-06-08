# n8n Public API Blocked Receipt - 2026-06-08

## Status

The n8n host is reachable, but authenticated public API access is not ready.

This receipt is read-only. It does not create workflows, activate workflows, trigger workflows, expose secrets, or mutate n8n.

## Verified Runtime Result

Preview route:

`GET /api/cron/n8n-readiness-dry-run`

Result after the multi-probe hardening patch:

- `status`: `host_reachable_api_blocked`
- `mutation_performed`: `false`
- `secrets_returned`: `false`
- env checks:
  - server URL present: true
  - API key present: true
- normalized API root path: `/api/v1`

Probe results:

| Probe | Result |
|---|---|
| `/healthz` | 200 OK |
| `/healthz/readiness` | 200 OK |
| `/api/v1/workflows?limit=1` | 404 Not Found / Cannot GET |
| `/api/v1/tags?limit=1` | 404 Not Found / Cannot GET |
| `/rest/workflows?limit=1` | 401 Unauthorized |

## Official n8n API Contract

n8n's public REST API expects:

- Cloud API root: `https://<name>.app.n8n.cloud/api/v1`
- Header: `X-N8N-API-KEY: <api key>`
- Workflow-list endpoint: `GET /api/v1/workflows`

n8n also documents that the API is not available during free trial. If the instance is on a plan or state where the API is unavailable, `/api/v1` can fail even while the host health endpoints are live.

For enterprise scoped keys, read-only validation requires at least one safe read scope such as:

- `workflow:list` for `GET /api/v1/workflows`
- `tag:list` for `GET /api/v1/tags`

The internal `/rest/*` routes are not the public API and should not be treated as the approved automation surface.

## Most Likely Causes

1. The stored API key is not a public n8n API key from Settings > n8n API.
2. The API key is expired, malformed, or not actually present in the expected Vercel preview env.
3. The key is enterprise-scoped but lacks `workflow:list` or `tag:list`.
4. The n8n Cloud account/instance does not currently have public API access enabled or available.
5. The env root points to an MCP/webhook/editor surface that is reachable, but not the public API surface.

## Required Fix Check

In n8n:

1. Go to Settings > n8n API.
2. Confirm public API access is available for the account/instance.
3. Create or rotate a key specifically for AUTO BUILDER preview validation.
4. If scopes are shown, grant minimum read-only scopes first:
   - `workflow:list`
   - `workflow:read` if later needed for exact workflow receipt reads
   - `tag:list` for non-workflow read probe fallback
5. Store the key in Vercel Preview env as the expected n8n API key env value.
6. Store the API root as `https://epoxylife.app.n8n.cloud/api/v1` or the exact n8n Cloud API root shown by n8n.
7. Redeploy the PR #21 preview.
8. Rerun `GET /api/cron/n8n-readiness-dry-run`.

## Gate

Do not create, activate, or trigger n8n workflows until the read-only route returns `status=ready`.

# n8n API Base URL Set - 2026-06-08

## Operator Update

The operator reported that `N8N_API_BASE_URL` has been set after identifying the n8n host:

- MCP endpoint observed: `https://epoxylife.app.n8n.cloud/mcp-server/http`
- Expected public API root: `https://epoxylife.app.n8n.cloud/api/v1`

## Safe Recheck

After this commit deploys, rerun:

`GET /api/cron/n8n-readiness-dry-run`

The route must remain read-only and must not create, activate, or trigger workflows.

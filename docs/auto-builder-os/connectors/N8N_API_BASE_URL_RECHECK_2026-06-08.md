# n8n API Base URL Recheck - 2026-06-08

## Operator Update

The operator reported that MCP access has been enabled to Eden Trend Discovery, which is their n8n surface, and that the API base URL has been entered exactly as provided.

## Current Interpretation

The prior dry-run verified that n8n-related env values are visible in the Vercel preview, but the configured server responded `Cannot GET /api/v1/workflows`. This suggests either:

- the previous deployment had stale env values,
- the configured URL points to an MCP/webhook endpoint rather than the n8n public REST API root,
- or the Eden Trend Discovery MCP surface is not the same endpoint as n8n's public API.

## Safe Recheck Plan

After this commit deploys, rerun the preview-only read-only route:

`GET /api/cron/n8n-readiness-dry-run`

This route must not create, activate, or trigger workflows. It should only attempt a read-only public API call and return a sanitized receipt.

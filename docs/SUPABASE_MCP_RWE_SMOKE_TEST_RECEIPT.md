# Smoke Test Receipt — AUTO_BUILDER Supabase MCP RWE

**Branch:** auto-builder-2/supabase-mcp-rwe-20260703
**PR:** #71
**Validated by:** Base44 Superagent
**Date:** 2026-07-03T07:56:00Z

## Commits validated/added
- 88bf3a0 Document Supabase MCP read write execute surface
- a9c821c Expose governed Supabase MCP route
- b088aa2 Add governed Supabase MCP runner
- (this receipt) fix: correct mcp-handler endpoint config so /api/mcp-supabase actually listens on /api/mcp-supabase

## Commands run
- `npm install` — 175 packages, clean
- `npm run build` — PASS, `/api/mcp-supabase` present in route manifest
- `npm run validate:mcp-tools` — pre-existing warning on unrelated `/api/mcp` route (21 vs 20 tools expected); confirmed present on `main` too, not introduced by this PR, non-blocking
- `npm run dev -p 3050` — manual live route testing

## Real defect found and fixed
`route.ts` configured `createMcpHandler(..., { basePath: "/api/mcp-supabase" })`. The `mcp-handler` library derives the actual listening path as `${basePath}/mcp`, so the real endpoint was `/api/mcp-supabase/mcp`, not `/api/mcp-supabase` as documented and required by acceptance criteria. Confirmed via library source (`node_modules/mcp-handler/dist/index.js`, `deriveEndpointsFromBasePath`) and live requests (404 on both GET and POST to `/api/mcp-supabase` before the fix).

**Fix applied:** replaced `basePath` with explicit `streamableHttpEndpoint: "/api/mcp-supabase"`, `sseEndpoint: "/api/mcp-supabase/sse"`, `sseMessageEndpoint: "/api/mcp-supabase/message"`. Rebuilt and reverified live — now returns correct 405/200 responses matching the working `/api/mcp` route's behavior pattern.

## Validation results

| Check | Expected | Result |
|---|---|---|
| `/api/mcp-supabase` GET | 405 JSON-RPC (not 404) | PASS |
| `/api/mcp-supabase` POST initialize | 200, valid MCP handshake | PASS |
| Existing `/api/mcp` still works | 200/405 unaffected | PASS |
| `supabase_status` | booleans only, no secret values | PASS (2 boolean fields over-redacted by key-name pattern match — see minor defect below, not a leak) |
| `supabase_read` unknown table | blocked by allowlist | PASS |
| `supabase_read` known table | live read, real rows, no secrets | PASS |
| `supabase_write` no execute mode | `dry_run_complete` | PASS |
| `supabase_write` execute, not approved | `blocked` | PASS |
| `supabase_execute` execute, not approved | `blocked` | PASS |
| `supabase_execute` execute_sql, no executor fn | `blocked`, adapter_required | PASS |
| No secrets in any response | true | PASS (redaction fail-safe, never fail-open) |

## Minor non-blocking defect noted
`sanitize()` in `supabase-job-runner.ts` redacts by regex match on **key name**, not value type. Fields like `service_role_configured` and `secrets_returned` contain substrings (`service_role`, `secret`) that trip the redaction pattern even though their values are plain booleans, not secrets. Result: `supabase_status` shows `"[redacted]"` instead of `true`/`false` for those two fields. Safe direction (over-redacts, never leaks) but reduces status-tool usefulness. Recommend excluding known-safe boolean status keys from the key-pattern check in a follow-up, not blocking this PR.

## Explicit statement
**No live Supabase mutation was performed during this validation.** Only `supabase_status` (no I/O) and `supabase_read` (read-only, real data returned) were exercised against the live database. All write/execute paths were exercised in dry-run or pre-approval-blocked states only.

## Recommendation
Ready to merge pending Jeremy's explicit merge approval. Follow-up ticket recommended for the sanitize() over-redaction issue.

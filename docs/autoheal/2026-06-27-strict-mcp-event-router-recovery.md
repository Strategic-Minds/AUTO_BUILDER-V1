# Strict MCP And Event Router Recovery Handoff

Date: 2026-06-27
Branch: `autoheal/event-router-mcp-recovery-20260627`

## Objective

Recover the strict AUTO BUILDER MCP route and harden the AWOS Agent Event Router migration before any staging-only live lane approval.

## Verified By ChatGPT Side

- The canonical strict MCP connector probe returned a Vercel 404 for `https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp`.
- Source code for `src/app/api/mcp/route.ts` exists in the repo.
- An alternate Auto Builder summary surface still returns the operating map, so the broader bridge context is not fully unavailable.
- The event-router migration exists at `swarm-os/event-router/migrations/001_event_bus_tables.sql`.

## Fixes In This Branch

- Removed permissive `rag_embeddings_open` RLS policy.
- Added service-role-only RLS policy for `rag_embeddings`.
- Reconciled event bus verification names to canonical `approval_gate` and `agent_heartbeats`.
- Updated `match_documents` to query `rag_embeddings.embedding` and join chunks/documents for text and source references.
- Added function execute restrictions for `match_documents`.

## Remaining Blockers

- Live strict MCP route still needs redeploy or connector refresh verification.
- Container-side local clone was blocked by network policy, so full `npm run validate:factory` could not be run from ChatGPT workspace.
- Supabase staging advisors must be rerun after applying the migration to a branch/staging database.
- Production remains blocked.

## Required Validation Before Staging Approval

1. Run repo validation on this branch:
   - `npm run validate:factory`
   - `npm run validate:mcp-tools`
2. Apply the migration to Supabase branch/staging only.
3. Verify these tables exist:
   - `agent_inbox`
   - `agent_outbox`
   - `event_schema_registry`
   - `agent_messages`
   - `bridge_tasks`
   - `bridge_receipts`
   - `approval_gate`
   - `agent_memory`
   - `agent_heartbeats`
   - `rag_documents`
   - `rag_chunks`
   - `rag_embeddings`
4. Verify RLS policies are not permissive for anon/authenticated users.
5. Verify `match_documents` works through service-role-only access.
6. Deploy preview for AUTO BUILDER and verify:
   - `/api/mcp`
   - `/api/mcp/manifest`
   - `/api/mcp/tools`
7. Refresh or re-register the ChatGPT connector only after the preview/production route is known healthy.

## Protected Actions Still Requiring Approval

- Supabase migration or RLS changes against production.
- Cloud Run deployment.
- Pub/Sub topic/subscription creation.
- Service-role secret configuration.
- Production deploy.
- Production connector registration changes.

## Recommended Next Gate

Approve only a staging validation lane after repo validation passes. Do not approve production until strict MCP health, event-router staging migration, RLS advisors, idempotency, dead-letter handling, and receipt writes are all verified.

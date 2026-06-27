# EPOXY DISCOVER ENGINE — IMPLEMENTATION RECEIPT
## Status: BRANCH READY — AWAITING MERGE APPROVAL

**Date:** 2026-06-27
**Branch:** feature/epoxy-competitor-queue-current-main
**Authority:** Jeremy Bensen (final approval for merge + migration)
**productionMutated:** false (branch-only until merge approved)

---

## Launch-Blocking Patches Applied ✅

### 1. worker.ts — Claimed Job Key Preservation
- `resolveQueueJob()` function added
- When live queue row claimed: uses `claimedJob.jobKey` verbatim (no new key generated)
- Success path: calls `completeEpoxyQueueJob()` → sets status=COMPLETE
- Error path: calls `failEpoxyQueueJob()` → RETRY (attempts<3) or FAILED
- Dry-run path: unchanged, uses `buildStateQueueJob()` for synthetic key

### 2. supabase-adapter.ts — New Queue Transition Functions
- `completeEpoxyQueueJob()` — sets status=COMPLETE, clears lock, scoped to locked_by=workerId
- `failEpoxyQueueJob()` — sets status=RETRY or FAILED, writes last_error (capped 1000 chars)

### 3. types.ts — Type Completeness
- Added `attempts?: number` to `EpoxyQueueJob`
- Added `EpoxyClaimedJob` and `EpoxyQueueClaimResult` types

### 4. validate-epoxy-discover-engine.mjs — 10 New Assertions
All claimed-job-key preservation logic tested:
- worker imports completeEpoxyQueueJob + failEpoxyQueueJob ✅
- resolveQueueJob present ✅
- !dryRun gate on key preservation ✅
- adapter exports both functions ✅
- COMPLETE status in completeEpoxyQueueJob ✅
- RETRY + FAILED in failEpoxyQueueJob ✅
- error path calls failEpoxyQueueJob ✅
- claimed.jobKey preserved verbatim ✅
- dry-run still uses buildStateQueueJob ✅
- locked_by=workerId safety guard ✅

### 5. /api/epoxy/sheet-sync — New Endpoint
- POST `{ receiptId, workbook, rows[] }`
- Requires `x-epoxy-sheet-secret` header
- Upserts by `row.key` into tab: Queue, State Master, Competitor Master, Failed Jobs, Receipts
- Returns `{ ok, receiptId, rowCount, tabs, message }`
- Rate limited at 100ms/row (10 req/s Sheets API)

### 6. sheet-sync-adapter.ts — Updated
- Live path calls `/api/epoxy/sheet-sync` with `x-epoxy-sheet-secret`
- Dry-run/disabled path returns mock result (unchanged)
- 15s timeout on sheet sync requests

---

## Vercel Env Vars Set (12/12) ✅
| Var | Status |
|-----|--------|
| CRON_SECRET | ✅ production + preview |
| EPOXY_SHEET_SYNC_SECRET | ✅ production + preview |
| EPOXY_SHEET_SYNC_WEBHOOK_URL | ✅ production + preview |
| SUPABASE_URL | ✅ updated |
| NEXT_PUBLIC_SUPABASE_URL | ✅ updated |
| SUPABASE_SERVICE_ROLE_KEY | ✅ already set (sensitive var) |
| EPOXY_DISCOVER_RELEASE_APPROVED | ✅ = 1 |
| EPOXY_DISCOVER_PERSISTENCE_ENABLED | ✅ = 1 |
| EPOXY_DISCOVER_DRY_RUN_DEFAULT | ✅ = 0 |
| EPOXY_DISCOVER_LIVE_DISCOVERY_ENABLED | ✅ = 0 (Phase 1) |
| EPOXY_SHEET_SYNC_ENABLED | ✅ = 0 (until endpoint validated) |
| SENTINEL_APPROVAL_TOKEN | ✅ set |

---

## Supabase Migration — AWAITING L4 APPROVAL

File: `supabase/migrations/0004_epoxy_discover_engine_draft.sql`

Pre-migration checklist (confirm before applying):
- [ ] No existing epoxy_* tables conflict (run: `SELECT tablename FROM pg_tables WHERE tablename LIKE 'epoxy%'`)
- [ ] RLS confirmed on all 4 tables: epoxy_states, epoxy_queue, epoxy_competitors, epoxy_receipts
- [ ] anon has NO write access (INSERT/UPDATE/DELETE)
- [ ] service_role is the ONLY write path
- [ ] claim_epoxy_queue_job: EXECUTE not granted to anon or authenticated
- [ ] SECURITY DEFINER on claim function confirmed

**This is L4 — production DB mutation. Jeremy must explicitly approve.**
Command after approval: `npx supabase db push --project-ref prhppuuwcnmfdhwsagug`

---

## Deploy Order Remaining

1. ✅ Patch claimed-job completion bug
2. ✅ Vercel env vars set
3. 🔒 Apply Supabase migration (L4 — awaiting Jeremy approval)
4. 🔒 Merge branch to main (awaiting Jeremy approval)
5. ⏳ Wait for Vercel production READY
6. ⏳ Run tokened production dry-run
7. ⏳ Run one live gated TX test
8. ⏳ Enable EPOXY_SHEET_SYNC_ENABLED=1 after sheet sync validated
9. ⏳ Enable EPOXY_DISCOVER_LIVE_DISCOVERY_ENABLED=1 after adapters built

---

## Rollback Plan

If production fails after merge:
1. Set `EPOXY_DISCOVER_PERSISTENCE_ENABLED=0` in Vercel → immediate kill switch
2. Set `EPOXY_SHEET_SYNC_ENABLED=0`
3. Roll back Vercel to last known good deployment (not the merge commit)
4. Do NOT drop Supabase tables — preserve all receipts/evidence
5. File incident in bridge_receipts table

---

**Signed:** APEX Orchestrator | 2026-06-27
**Jeremy approval required for:** Supabase migration (L4) + merge to main (L4)

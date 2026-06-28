# EPOXY DISCOVER ENGINE — IMPLEMENTATION RECEIPT
## Status: PHASE 1 RELEASE CANDIDATE — SUPABASE PERSISTENCE FIRST

**Date:** 2026-06-27
**Branch:** feature/epoxy-competitor-queue-current-main
**Authority:** Jeremy Bensen (conditional release approval: real if ready)
**productionMutated:** false until Supabase migration is applied

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
- Removed duplicate `EpoxySheetSyncResult` ownership from `types.ts`; sheet sync adapter owns the result type

### 4. validate-epoxy-discover-engine.mjs — Assertions
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

The validator now targets the timestamped release-safe migration file and checks the `security invoker` queue-claim function marker.

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

### 7. Supabase Migration — Release-Safe Rename + Hardening
- Unsafe duplicate version file removed: `supabase/migrations/0004_epoxy_discover_engine_draft.sql`
- Release-safe migration added: `supabase/migrations/20260628003500_epoxy_discover_engine_phase1.sql`
- Receipt hardening now targets `public.epoxy_run_receipts`, matching the worker
- Queue claim function uses `security invoker`; Vercel calls it with service-role credentials

---

## Vercel Env Vars Reported Set (12/12)
| Var | Status |
|-----|--------|
| CRON_SECRET | production + preview |
| EPOXY_SHEET_SYNC_SECRET | production + preview |
| EPOXY_SHEET_SYNC_WEBHOOK_URL | production + preview |
| SUPABASE_URL | updated |
| NEXT_PUBLIC_SUPABASE_URL | updated |
| SUPABASE_SERVICE_ROLE_KEY | already set as Sensitive var |
| EPOXY_DISCOVER_RELEASE_APPROVED | = 1 |
| EPOXY_DISCOVER_PERSISTENCE_ENABLED | = 1 |
| EPOXY_DISCOVER_DRY_RUN_DEFAULT | = 0 |
| EPOXY_DISCOVER_LIVE_DISCOVERY_ENABLED | = 0 (Phase 1) |
| EPOXY_SHEET_SYNC_ENABLED | = 0 until endpoint validated |
| SENTINEL_APPROVAL_TOKEN | set |

---

## Supabase Migration — PHASE 1 READY AFTER FINAL BUILD

File: `supabase/migrations/20260628003500_epoxy_discover_engine_phase1.sql`

Pre-migration checklist:
- [x] No existing epoxy_* tables found in production before migration
- [x] Existing production migration history already has `0004`, so the Epoxy migration was renamed to timestamped version
- [x] RLS enabled in migration for all Epoxy tables
- [x] anon/authenticated write access withheld
- [x] service_role is the only write path
- [x] claim_epoxy_queue_job: EXECUTE not granted to anon or authenticated
- [x] claim_epoxy_queue_job uses `security invoker`, not `security definer`

---

## Deploy Order Remaining

1. ✅ Patch claimed-job completion bug
2. ✅ Patch final TypeScript sheet-sync type issue
3. ✅ Rename/harden migration for production history safety
4. ⏳ Wait for final preview build after migration rename/docs updates
5. ⏳ Run TX preview dry-run again
6. 🔒 Apply Supabase migration after final build passes
7. 🔒 Merge branch to main
8. ⏳ Wait for Vercel production READY
9. ⏳ Run tokened production dry-run
10. ⏳ Run one live gated TX persistence test if env gates are active
11. ⏳ Enable `EPOXY_SHEET_SYNC_ENABLED=1` only after sheet sync endpoint is validated
12. ⏳ Enable `EPOXY_DISCOVER_LIVE_DISCOVERY_ENABLED=1` only after live discovery adapters are built and approved

---

## Rollback Plan

If production fails after merge:
1. Set `EPOXY_DISCOVER_PERSISTENCE_ENABLED=0` in Vercel → immediate kill switch
2. Set `EPOXY_SHEET_SYNC_ENABLED=0`
3. Roll back Vercel to last known good deployment
4. Do NOT drop Supabase tables — preserve all receipts/evidence
5. File incident in bridge_receipts table

---

**Signed:** APEX Orchestrator | 2026-06-27
**Jeremy approval applied as:** conditional real launch if final readiness passes

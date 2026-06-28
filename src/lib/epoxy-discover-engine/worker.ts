import { claimNextEpoxyQueueJob, completeEpoxyQueueJob, failEpoxyQueueJob, getEpoxySupabaseConfig, liveWritesAllowed, persistEpoxySnapshot } from "./supabase-adapter";
import { buildDryRunCandidates, buildSheetRows, buildStateQueueJob } from "./state-queue";
import { syncEpoxySheetRows } from "./sheet-sync-adapter";
import { writeEpoxyReceipt } from "./receipt-writer";
import type { EpoxyGateStatus, EpoxyQueueJob, EpoxyReceipt, EpoxyRunMode, EpoxyWorkerInput, EpoxyWorkerResult, EpoxyWriteResult } from "./types";

const ROUTE = "/api/cron/epoxy-competitor-queue" as const;

function buildReceiptId(timestamp: string, stateCode: string, requestId?: string) {
  const compact = timestamp.replace(/[-:.TZ]/g, "").slice(0, 14);
  const suffix = requestId ? requestId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 24) : "cron";
  return `receipt-${compact}-epoxy-${stateCode.toLowerCase()}-${suffix}`;
}

function determineMode(dryRun: boolean, allowLiveWrites: boolean): EpoxyRunMode {
  if (dryRun) return "dry_run";
  return allowLiveWrites ? "live_gated" : "observe_only";
}

function buildGateStatus(allowLiveWrites: boolean): EpoxyGateStatus {
  const config = getEpoxySupabaseConfig();
  return {
    productionActionAllowed: allowLiveWrites,
    releaseApprovalRequired: !config.releaseApproved,
    supabasePersistenceEnabled: config.persistenceEnabled,
    sheetSyncEnabled: process.env.EPOXY_SHEET_SYNC_ENABLED === "1",
    liveDiscoveryEnabled: config.liveDiscoveryEnabled
  };
}

function buildFailedWriteResult(reason: string, tables?: string[]): EpoxyWriteResult {
  return {
    attempted: true,
    ok: false,
    status: "failed",
    reason,
    tables,
    errors: [reason]
  };
}

/**
 * Resolve the queue job to execute.
 *
 * When a live Supabase queue row is claimed, preserve its jobKey exactly.
 * Do not generate a new key. This ensures the claimed epoxy_queue row can
 * be transitioned to COMPLETE/FAILED/RETRY on the same primary key.
 *
 * Dry-run or unclaimed paths continue to generate a synthetic key via
 * buildStateQueueJob for local receipt and sheet-sync purposes only.
 */
function resolveQueueJob(
  queueClaim: Awaited<ReturnType<typeof claimNextEpoxyQueueJob>>,
  input: EpoxyWorkerInput,
  timestamp: string
): { queueJob: EpoxyQueueJob; isLiveClaimedRow: boolean } {
  const claimed = queueClaim.claimedJob;

  if (claimed && queueClaim.ok && !input.dryRun) {
    return {
      queueJob: {
        jobKey: claimed.jobKey,
        jobType: claimed.jobType ?? "discover_state_competitors",
        stateCode: claimed.stateCode,
        status: "RUNNING",
        priority: claimed.priority ?? 100,
        targetCompetitorCount: 50,
        createdAt: claimed.createdAt ?? timestamp,
        source: input.source,
        attempts: claimed.attempts
      },
      isLiveClaimedRow: true
    };
  }

  const requestedState = claimed?.stateCode ?? input.state;
  return {
    queueJob: buildStateQueueJob({
      state: requestedState,
      source: input.source,
      timestamp,
      status: input.dryRun ? "DRY_RUN" : "NEW"
    }),
    isLiveClaimedRow: false
  };
}

export async function runEpoxyCompetitorQueue(input: EpoxyWorkerInput): Promise<EpoxyWorkerResult> {
  const timestamp = input.requestedAt ?? new Date().toISOString();
  const config = getEpoxySupabaseConfig();
  const allowLiveWrites = !input.dryRun && liveWritesAllowed(config);

  const queueClaim = await claimNextEpoxyQueueJob({
    workerId: input.requestId ?? `epoxy-worker-${timestamp}`,
    dryRun: input.dryRun,
    allowLiveWrites
  });

  const { queueJob, isLiveClaimedRow } = resolveQueueJob(queueClaim, input, timestamp);

  const receiptId = buildReceiptId(timestamp, queueJob.stateCode, input.requestId);

  let persistence: Awaited<ReturnType<typeof persistEpoxySnapshot>>;
  let sheetSync: Awaited<ReturnType<typeof syncEpoxySheetRows>>;

  try {
    const candidates = buildDryRunCandidates(queueJob.stateCode, input.maxCandidates ?? 10);
    const sheetRows = buildSheetRows({ queueJob, candidates, timestamp });

    persistence = await persistEpoxySnapshot({
      dryRun: input.dryRun,
      allowLiveWrites,
      queueJob,
      candidates,
      timestamp
    });

    sheetSync = await syncEpoxySheetRows({
      dryRun: input.dryRun,
      allowLiveWrites,
      receiptId,
      rows: sheetRows
    });

    if (isLiveClaimedRow && allowLiveWrites) {
      await completeEpoxyQueueJob({
        jobKey: queueJob.jobKey,
        workerId: input.requestId ?? `epoxy-worker-${timestamp}`
      });
    }

    const gates = buildGateStatus(allowLiveWrites);
    const mode = determineMode(input.dryRun, allowLiveWrites);
    const receipt: EpoxyReceipt = {
      receiptId,
      generatedAt: timestamp,
      route: ROUTE,
      mode,
      stateCode: queueJob.stateCode,
      productionActionAllowed: allowLiveWrites,
      queueJob,
      candidateCount: candidates.length,
      candidates,
      gates,
      queueClaim,
      persistence,
      sheetSync
    };

    const receiptWrite = await writeEpoxyReceipt({
      receipt,
      dryRun: input.dryRun,
      allowLiveWrites
    });

    const ok = queueClaim.ok && persistence.ok && sheetSync.ok && receiptWrite.ok;

    return {
      ok,
      mode,
      route: ROUTE,
      stateCode: queueJob.stateCode,
      timestamp,
      productionActionAllowed: allowLiveWrites,
      queueJob,
      candidates,
      gates,
      queueClaim,
      persistence,
      sheetSync,
      receiptWrite,
      receipt,
      nextInstruction: allowLiveWrites
        ? "Live gated lane is enabled. Continue processing the claimed state queue with external discovery adapters."
        : "Release gate is closed. Review dry-run evidence, migration draft, and validation before enabling production persistence."
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const attempts = queueClaim.claimedJob?.attempts ?? 0;

    if (isLiveClaimedRow && allowLiveWrites) {
      await failEpoxyQueueJob({
        jobKey: queueJob.jobKey,
        lastError: errMsg,
        retry: attempts < 3
      });
    }

    const gates = buildGateStatus(allowLiveWrites);
    const mode = determineMode(input.dryRun, allowLiveWrites);
    const failedPersistence = buildFailedWriteResult(errMsg, ["epoxy_states", "epoxy_queue", "epoxy_competitors"]);
    const failedSheetSync: EpoxyReceipt["sheetSync"] = {
      ok: false,
      mode,
      synced: false,
      error: errMsg
    };

    const errorReceipt: EpoxyReceipt = {
      receiptId,
      generatedAt: timestamp,
      route: ROUTE,
      mode,
      stateCode: queueJob.stateCode,
      productionActionAllowed: allowLiveWrites,
      queueJob: { ...queueJob, status: attempts < 3 ? "RETRY" : "FAILED" },
      candidateCount: 0,
      candidates: [],
      gates,
      queueClaim,
      persistence: failedPersistence,
      sheetSync: failedSheetSync
    };

    const receiptWrite = await writeEpoxyReceipt({
      receipt: errorReceipt,
      dryRun: input.dryRun,
      allowLiveWrites
    }).catch(() => buildFailedWriteResult("Failed to write epoxy error receipt.", ["epoxy_run_receipts"]));

    return {
      ok: false,
      mode,
      route: ROUTE,
      stateCode: queueJob.stateCode,
      timestamp,
      productionActionAllowed: allowLiveWrites,
      queueJob: errorReceipt.queueJob,
      candidates: [],
      gates,
      queueClaim,
      persistence: errorReceipt.persistence,
      sheetSync: errorReceipt.sheetSync,
      receiptWrite,
      receipt: errorReceipt,
      nextInstruction: `Worker error: ${errMsg}. Job transitioned to ${attempts < 3 ? "RETRY" : "FAILED"}.`
    };
  }
}

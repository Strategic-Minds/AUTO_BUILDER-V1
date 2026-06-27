import { claimNextEpoxyQueueJob, getEpoxySupabaseConfig, liveWritesAllowed, persistEpoxySnapshot } from "./supabase-adapter";
import { buildDryRunCandidates, buildSheetRows, buildStateQueueJob } from "./state-queue";
import { syncEpoxySheetRows } from "./sheet-sync-adapter";
import { writeEpoxyReceipt } from "./receipt-writer";
import type { EpoxyGateStatus, EpoxyReceipt, EpoxyRunMode, EpoxyWorkerInput, EpoxyWorkerResult } from "./types";

const ROUTE = "/api/cron/epoxy-competitor-queue" as const;

function buildReceiptId(timestamp: string, stateCode: string, requestId?: string) {
  const compact = timestamp.replace(/[-:.TZ]/g, "").slice(0, 14);
  const suffix = requestId ? requestId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 24) : "cron";
  return `receipt-${compact}-epoxy-${stateCode.toLowerCase()}-${suffix}`;
}

function determineMode(dryRun: boolean, allowLiveWrites: boolean): EpoxyRunMode {
  if (dryRun) {
    return "dry_run";
  }

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

export async function runEpoxyCompetitorQueue(input: EpoxyWorkerInput): Promise<EpoxyWorkerResult> {
  const timestamp = input.requestedAt ?? new Date().toISOString();
  const config = getEpoxySupabaseConfig();
  const allowLiveWrites = !input.dryRun && liveWritesAllowed(config);
  const queueClaim = await claimNextEpoxyQueueJob({
    workerId: input.requestId ?? `epoxy-worker-${timestamp}`,
    dryRun: input.dryRun,
    allowLiveWrites
  });

  const requestedState = queueClaim.claimedJob?.stateCode ?? input.state;
  const queueJob = buildStateQueueJob({
    state: requestedState,
    source: input.source,
    timestamp,
    status: input.dryRun ? "DRY_RUN" : allowLiveWrites ? "RUNNING" : "NEW"
  });
  const candidates = buildDryRunCandidates(queueJob.stateCode, input.maxCandidates ?? 10);
  const receiptId = buildReceiptId(timestamp, queueJob.stateCode, input.requestId);
  const sheetRows = buildSheetRows({ queueJob, candidates, timestamp });
  const persistence = await persistEpoxySnapshot({
    dryRun: input.dryRun,
    allowLiveWrites,
    queueJob,
    candidates,
    timestamp
  });
  const sheetSync = await syncEpoxySheetRows({
    dryRun: input.dryRun,
    allowLiveWrites,
    receiptId,
    rows: sheetRows
  });
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
}

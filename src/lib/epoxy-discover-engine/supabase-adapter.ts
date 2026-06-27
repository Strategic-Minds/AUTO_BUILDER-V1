import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { STATE_NAMES } from "./states";
import type { EpoxyCompetitorCandidate, EpoxyQueueJob, EpoxyWriteResult } from "./types";

export type EpoxySupabaseConfig = {
  persistenceEnabled: boolean;
  releaseApproved: boolean;
  liveDiscoveryEnabled: boolean;
  url?: string;
  serviceRoleKey?: string;
};

type ClaimRow = {
  job_key: string;
  job_type: string;
  state_code: string;
  status: string;
  priority: number;
  payload_json: Record<string, unknown> | null;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return typeof error === "string" ? error : "Unknown Supabase error.";
}

function isClaimRow(value: unknown): value is ClaimRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ClaimRow>;
  return typeof row.job_key === "string" && typeof row.state_code === "string";
}

export function getEpoxySupabaseConfig(): EpoxySupabaseConfig {
  return {
    persistenceEnabled: process.env.EPOXY_DISCOVER_PERSISTENCE_ENABLED === "1",
    releaseApproved: process.env.EPOXY_DISCOVER_RELEASE_APPROVED === "1",
    liveDiscoveryEnabled: process.env.EPOXY_DISCOVER_LIVE_DISCOVERY_ENABLED === "1",
    url: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_SERVICE_KEY ??
      process.env.SUPABASE_SECRET_KEY
  };
}

export function liveWritesAllowed(config = getEpoxySupabaseConfig()) {
  return config.persistenceEnabled && config.releaseApproved;
}

export function createEpoxySupabaseClient(config = getEpoxySupabaseConfig()): SupabaseClient | null {
  if (!config.url || !config.serviceRoleKey) {
    return null;
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function claimNextEpoxyQueueJob(input: {
  workerId: string;
  dryRun: boolean;
  allowLiveWrites: boolean;
}): Promise<EpoxyWriteResult & { claimedJob?: Pick<EpoxyQueueJob, "jobKey" | "stateCode" | "priority"> }> {
  if (input.dryRun) {
    return {
      attempted: false,
      ok: true,
      status: "dry_run",
      reason: "Dry-run mode does not claim Supabase queue jobs."
    };
  }

  if (!input.allowLiveWrites) {
    return {
      attempted: false,
      ok: true,
      status: "disabled",
      reason: "Queue claiming is disabled until EPOXY_DISCOVER_RELEASE_APPROVED=1 and EPOXY_DISCOVER_PERSISTENCE_ENABLED=1."
    };
  }

  const client = createEpoxySupabaseClient();
  if (!client) {
    return {
      attempted: true,
      ok: false,
      status: "missing_env",
      reason: "Missing Supabase URL or service-role key for queue claiming."
    };
  }

  const { data, error } = await client.rpc("claim_epoxy_queue_job", { p_worker_id: input.workerId });
  if (error) {
    return {
      attempted: true,
      ok: false,
      status: "failed",
      reason: error.message,
      errors: [error.message]
    };
  }

  if (!isClaimRow(data)) {
    return {
      attempted: true,
      ok: true,
      status: "skipped",
      reason: "No runnable epoxy queue job was available."
    };
  }

  return {
    attempted: true,
    ok: true,
    status: "persisted",
    reason: "Claimed next epoxy queue job.",
    rowCount: 1,
    tables: ["epoxy_queue"],
    claimedJob: {
      jobKey: data.job_key,
      stateCode: data.state_code as EpoxyQueueJob["stateCode"],
      priority: data.priority
    }
  };
}

export async function persistEpoxySnapshot(input: {
  dryRun: boolean;
  allowLiveWrites: boolean;
  queueJob: EpoxyQueueJob;
  candidates: EpoxyCompetitorCandidate[];
  timestamp: string;
}): Promise<EpoxyWriteResult> {
  if (input.dryRun) {
    return {
      attempted: false,
      ok: true,
      status: "dry_run",
      reason: "Dry-run mode prepared Supabase rows without writing them."
    };
  }

  if (!input.allowLiveWrites) {
    return {
      attempted: false,
      ok: true,
      status: "disabled",
      reason: "Supabase writes are disabled until release approval and persistence enablement."
    };
  }

  const client = createEpoxySupabaseClient();
  if (!client) {
    return {
      attempted: true,
      ok: false,
      status: "missing_env",
      reason: "Missing Supabase URL or service-role key for epoxy snapshot persistence."
    };
  }

  try {
    const { error: stateError } = await client.from("epoxy_states").upsert(
      {
        state_code: input.queueJob.stateCode,
        state_name: STATE_NAMES[input.queueJob.stateCode],
        target_competitor_count: input.queueJob.targetCompetitorCount,
        discovered_count: input.candidates.length,
        status: input.candidates.length > 0 ? "SEEDED" : "NEEDS_DISCOVERY",
        last_run_at: input.timestamp,
        metadata_json: {
          source: input.queueJob.source,
          job_key: input.queueJob.jobKey
        }
      },
      { onConflict: "state_code" }
    );

    if (stateError) {
      throw stateError;
    }

    const { error: queueError } = await client.from("epoxy_queue").upsert(
      {
        job_key: input.queueJob.jobKey,
        job_type: input.queueJob.jobType,
        state_code: input.queueJob.stateCode,
        status: "COMPLETE",
        priority: input.queueJob.priority,
        payload_json: {
          source: input.queueJob.source,
          target_competitor_count: input.queueJob.targetCompetitorCount
        },
        updated_at: input.timestamp
      },
      { onConflict: "job_key" }
    );

    if (queueError) {
      throw queueError;
    }

    if (input.candidates.length > 0) {
      const { error: competitorError } = await client.from("epoxy_competitors").upsert(
        input.candidates.map((candidate) => ({
          state_code: candidate.stateCode,
          competitor_key: candidate.competitorKey,
          name: candidate.name,
          website: candidate.website,
          city: candidate.city,
          services: candidate.services,
          categories: candidate.categories,
          source: candidate.source,
          evidence_json: candidate.evidence,
          verification_status: candidate.verificationStatus,
          confidence_score: candidate.confidenceScore,
          last_seen_at: input.timestamp,
          notes: candidate.notes
        })),
        { onConflict: "state_code,competitor_key" }
      );

      if (competitorError) {
        throw competitorError;
      }
    }

    return {
      attempted: true,
      ok: true,
      status: "persisted",
      reason: "Epoxy state, queue, and competitor snapshot persisted.",
      tables: ["epoxy_states", "epoxy_queue", "epoxy_competitors"],
      rowCount: input.candidates.length + 2
    };
  } catch (error) {
    const message = errorMessage(error);
    return {
      attempted: true,
      ok: false,
      status: "failed",
      reason: message,
      errors: [message],
      tables: ["epoxy_states", "epoxy_queue", "epoxy_competitors"]
    };
  }
}

// ─── PATCH: Queue row completion functions ────────────────────────────────────
// Required by worker.ts to transition claimed rows to COMPLETE/FAILED/RETRY.
// These are L4 operations (live DB writes) — only called when allowLiveWrites=true.

export async function completeEpoxyQueueJob(input: {
  jobKey: string;
  workerId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const config = getEpoxySupabaseConfig();
  const client = createEpoxySupabaseClient(config);
  if (!client) return { ok: false, error: "No Supabase client — SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing" };

  const now = new Date().toISOString();
  const { error } = await client
    .from("epoxy_queue")
    .update({
      status: "COMPLETE",
      locked_at: null,
      locked_by: null,
      last_error: null,
      updated_at: now
    })
    .eq("job_key", input.jobKey)
    .eq("locked_by", input.workerId); // safety: only update the row WE claimed

  if (error) {
    console.error("[epoxy-supabase] completeEpoxyQueueJob error:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function failEpoxyQueueJob(input: {
  jobKey: string;
  lastError: string;
  retry: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const config = getEpoxySupabaseConfig();
  const client = createEpoxySupabaseClient(config);
  if (!client) return { ok: false, error: "No Supabase client" };

  const now = new Date().toISOString();
  const newStatus = input.retry ? "RETRY" : "FAILED";

  const { error } = await client
    .from("epoxy_queue")
    .update({
      status: newStatus,
      locked_at: null,
      locked_by: null,
      last_error: input.lastError.slice(0, 1000), // cap error length
      updated_at: now,
      attempts: client.rpc ? undefined : undefined // incremented by DB trigger if present
    })
    .eq("job_key", input.jobKey);

  if (error) {
    console.error("[epoxy-supabase] failEpoxyQueueJob error:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

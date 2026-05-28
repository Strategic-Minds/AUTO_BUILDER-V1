import { insertTelemetry, readTelemetryByQuery } from "@/lib/telemetry-store";

type ClaimRecursiveBucketInput = {
  bucketKey: string;
  route: string;
  source: string;
  claimedAt?: string;
};

export type ClaimRecursiveBucketResult = {
  claimed: boolean;
  mode: string;
  reason: string;
  bucketKey: string;
  route: string;
  claimedAt: string;
  existing?: unknown;
  write?: unknown;
};

export function getFiveMinuteBucketKey(input: string | Date = new Date()) {
  const date = typeof input === "string" ? new Date(input) : new Date(input);
  const bucket = new Date(date);
  bucket.setUTCSeconds(0, 0);
  bucket.setUTCMinutes(Math.floor(bucket.getUTCMinutes() / 5) * 5);
  return `${bucket.toISOString().slice(0, 16)}Z`;
}

export async function claimRecursiveBucket(input: ClaimRecursiveBucketInput): Promise<ClaimRecursiveBucketResult> {
  const claimedAt = input.claimedAt ?? new Date().toISOString();
  const existing = await readTelemetryByQuery("scheduler_verification", {
    select: "id,scheduler_name,route,status,proof,created_at",
    scheduler_name: "eq.awos_recursive_control",
    route: `eq.${input.route}`,
    proof: `eq.${input.bucketKey}`,
    limit: "1"
  });

  if (existing.ok && existing.rows.length > 0) {
    return {
      claimed: false,
      mode: existing.mode,
      reason: "duplicate_bucket",
      bucketKey: input.bucketKey,
      route: input.route,
      claimedAt,
      existing: existing.rows[0]
    };
  }

  const write = await insertTelemetry("scheduler_verification", {
    scheduler_name: "awos_recursive_control",
    route: input.route,
    status: "claimed",
    proof: input.bucketKey,
    created_at: claimedAt,
    source: input.source
  });

  return {
    claimed: write.ok || write.mode === "dry_run",
    mode: write.mode,
    reason: write.ok || write.mode === "dry_run" ? "claimed" : "claim_failed",
    bucketKey: input.bucketKey,
    route: input.route,
    claimedAt,
    write
  };
}

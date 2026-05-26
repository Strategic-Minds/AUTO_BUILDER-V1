import { NextRequest, NextResponse } from "next/server";
import { authorizeRuntimeIngest } from "@/lib/runtime-auth";
import { insertTelemetry } from "@/lib/telemetry-store";

export async function POST(request: NextRequest) {
  const auth = authorizeRuntimeIngest(request);

  if (!auth.ok) {
    return NextResponse.json({ status: "blocked", reason: auth.reason }, { status: auth.status });
  }

  const body = (await request.json().catch(() => ({}))) as {
    queue?: string;
    depth?: number;
    processing?: number;
    failed?: number;
    oldestJobAgeSeconds?: number;
    queueStatus?: string;
  };

  const result = await insertTelemetry("queue_metrics", {
    queue: body.queue ?? "unknown-queue",
    depth: body.depth ?? 0,
    processing: body.processing ?? 0,
    failed: body.failed ?? 0,
    oldest_job_age_seconds: body.oldestJobAgeSeconds ?? 0,
    status: body.queueStatus ?? "watch",
    observed_at: new Date().toISOString()
  });

  return NextResponse.json({
    status: result.ok ? "recorded" : "dry-run",
    result
  });
}

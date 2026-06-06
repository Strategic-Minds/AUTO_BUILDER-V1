import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized, dispatchToConnection, readRetryableBridgeEvents, updateBridgeEvent } from "@/lib/bridge-event-bus";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function cronAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") || "";
  return Boolean(cronSecret && header === `Bearer ${cronSecret}`) || bearerAuthorized(request);
}

async function runRetry() {
  const retryable = await readRetryableBridgeEvents(10);
  const rows = Array.isArray(retryable.data) ? retryable.data : [];
  const now = Date.now();
  const attempted = [];

  for (const event of rows) {
    const nextRetryAt = event.next_retry_at ? Date.parse(event.next_retry_at) : 0;
    if (Number.isFinite(nextRetryAt) && nextRetryAt > now) continue;
    if ((event.retry_count || 0) >= (event.max_retries || 5)) continue;

    const dispatch = await dispatchToConnection(event.target_system, {
      event_id: event.id,
      phase: event.phase,
      source_system: event.source_system,
      target_system: event.target_system,
      payload: event.payload || {},
      metadata: { ...(event.metadata || {}), retry: true, retry_count: (event.retry_count || 0) + 1 }
    });

    await updateBridgeEvent(event.id, dispatch.ok ? {
      status: "success",
      completed_at: new Date().toISOString(),
      dispatched_at: new Date().toISOString(),
      retry_count: (event.retry_count || 0) + 1,
      error_message: null
    } : {
      status: "retry",
      retry_count: (event.retry_count || 0) + 1,
      error_message: dispatch.reason || "retry_dispatch_failed",
      next_retry_at: new Date(Date.now() + Math.min(16, 2 ** (event.retry_count || 0)) * 1000).toISOString()
    });

    attempted.push({ event_id: event.id, target_system: event.target_system, dispatch });
  }

  return { sourceCount: rows.length, attempted };
}

export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ status: "blocked", mutation: false, reason: "cron_or_bridge_bearer_required" }, { status: 401 });
  }
  const result = await runRetry();
  return NextResponse.json({ status: "completed", mutation: result.attempted.length > 0, ...result }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: NextRequest) {
  return GET(request);
}

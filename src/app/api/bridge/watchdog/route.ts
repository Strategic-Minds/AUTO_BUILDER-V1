import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry, readRecentTelemetry } from "@/lib/telemetry-store";

const WORKERS = ["github_actions_playwright", "vps_playwright", "browserless", "xyla", "opus", "shopify", "supabase", "vercel"];

export async function GET() {
  const heartbeats = await readRecentTelemetry("worker_heartbeats", "last_seen_at", 200);
  const nowMs = Date.now();
  const workerMap = new Map<string, number>();
  for (const row of heartbeats.rows as Record<string, unknown>[]) {
    const name = String(row.worker_name ?? "");
    const ms = Date.parse(String(row.last_seen_at ?? ""));
    if (!Number.isNaN(ms) && (!workerMap.has(name) || ms > (workerMap.get(name) ?? 0))) workerMap.set(name, ms);
  }
  const stale = WORKERS.filter((name) => {
    const ms = workerMap.get(name);
    if (!ms) return true;
    return (nowMs - ms) / 1000 > 600;
  });
  for (const worker of stale) {
    await insertTelemetry("worker_registry_watchdog", {
      worker_name: worker,
      stale: true,
      last_heartbeat: new Date(workerMap.get(worker) ?? 0).toISOString(),
      workaround_task: `recover_${worker}`,
      created_at: new Date().toISOString()
    });
    await insertTelemetry("bridge_tasks", {
      task_type: "workaround",
      task_prompt: `Recover stale worker ${worker}`,
      target: "AUTO_BUILDER",
      priority: "high",
      state: "queued",
      approved: true,
      safe: true,
      created_at: new Date().toISOString()
    });
  }
  return NextResponse.json({ ok: true, staleWorkers: stale, heartbeats });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { workerName?: string; surface?: string; status?: string };
  const row = await insertTelemetry("worker_heartbeats", {
    worker_name: body.workerName ?? "unknown",
    surface: body.surface ?? "cloud",
    status: body.status ?? "online",
    last_seen_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  });
  return NextResponse.json({ ok: true, row });
}

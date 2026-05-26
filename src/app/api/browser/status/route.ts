import { NextResponse } from "next/server";
import { readRecentTelemetry } from "@/lib/telemetry-store";

export async function GET() {
  const [tasks, claims, evidence, blockers, screenshots, workers] = await Promise.all([
    readRecentTelemetry("browser_tasks", "created_at", 30),
    readRecentTelemetry("browser_claims", "claimed_at", 30),
    readRecentTelemetry("browser_evidence", "created_at", 30),
    readRecentTelemetry("browser_blockers", "created_at", 30),
    readRecentTelemetry("browser_screenshots", "created_at", 30),
    readRecentTelemetry("worker_registry_watchdog", "created_at", 30)
  ]);
  const staleWorkers = workers.ok ? workers.rows.filter((r: unknown) => (r as Record<string, unknown>).stale === true).length : 0;
  return NextResponse.json({
    ok: true,
    codexIsBrowserRuntime: false,
    tasks,
    claims,
    evidence,
    blockers,
    screenshots,
    staleWorkers
  });
}

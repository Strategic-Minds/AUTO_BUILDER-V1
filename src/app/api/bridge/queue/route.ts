import { NextResponse } from "next/server";
import { readRecentTelemetry } from "@/lib/telemetry-store";

export async function GET() {
  const tasks = await readRecentTelemetry("bridge_tasks", "created_at", 50);

  const queued = tasks.ok ? tasks.rows.filter((row: unknown) => (row as Record<string, unknown>).state === "queued") : [];
  const blocked = tasks.ok ? tasks.rows.filter((row: unknown) => (row as Record<string, unknown>).state === "blocked") : [];
  const claimed = tasks.ok ? tasks.rows.filter((row: unknown) => (row as Record<string, unknown>).state === "claimed") : [];

  return NextResponse.json({
    ok: true,
    summary: {
      queued: queued.length,
      blocked: blocked.length,
      claimed: claimed.length
    },
    tasks
  });
}

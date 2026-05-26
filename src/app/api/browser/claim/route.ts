import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry, readTelemetryByQuery, updateTelemetry } from "@/lib/telemetry-store";

export async function GET(request: NextRequest) {
  const worker = request.nextUrl.searchParams.get("worker") ?? "github_actions_playwright";
  const queued = await readTelemetryByQuery("browser_tasks", {
    select: "*",
    state: "eq.queued",
    order: "created_at.asc",
    limit: "10"
  });
  if (!queued.ok) {
    return NextResponse.json({ ok: false, reason: "Queue unavailable", queued }, { status: 503 });
  }
  const task = queued.rows[0] as Record<string, unknown> | undefined;
  if (!task) {
    return NextResponse.json({ ok: true, claim: null, reason: "No queued browser task." });
  }
  const claim = await insertTelemetry("browser_claims", {
    task_ref: typeof task.id === "string" ? task.id : null,
    worker,
    claimed_at: new Date().toISOString(),
    status: "claimed"
  });
  const update = await updateTelemetry("browser_tasks", {
    state: "claimed"
  }, { id: `eq.${String(task.id ?? "")}` });
  return NextResponse.json({ ok: true, claim, task, update });
}

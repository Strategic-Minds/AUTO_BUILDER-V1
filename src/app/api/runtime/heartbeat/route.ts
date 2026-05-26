import { NextRequest, NextResponse } from "next/server";
import { authorizeRuntimeIngest } from "@/lib/runtime-auth";
import { insertTelemetry } from "@/lib/telemetry-store";

export async function POST(request: NextRequest) {
  const auth = authorizeRuntimeIngest(request);

  if (!auth.ok) {
    return NextResponse.json({ status: "blocked", reason: auth.reason }, { status: auth.status });
  }

  const body = (await request.json().catch(() => ({}))) as {
    agent?: string;
    surface?: string;
    currentTask?: string;
    latencyMs?: number;
    runtimeStatus?: string;
  };

  const result = await insertTelemetry("agent_heartbeats", {
    agent: body.agent ?? "unknown-agent",
    surface: body.surface ?? "unknown-surface",
    current_task: body.currentTask ?? null,
    latency_ms: body.latencyMs ?? 0,
    status: body.runtimeStatus ?? "online",
    last_seen_at: new Date().toISOString()
  });

  return NextResponse.json({
    status: result.ok ? "recorded" : "dry-run",
    result
  });
}

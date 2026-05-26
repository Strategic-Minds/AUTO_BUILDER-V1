import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry } from "@/lib/telemetry-store";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { queueName?: string; action?: string; details?: Record<string, unknown> };
  const queueName = body.queueName ?? "bridge_tasks";
  const action = body.action ?? "pause";
  const row = await insertTelemetry("queue_control_events", {
    queue_name: queueName,
    action,
    actor: "dashboard",
    details: JSON.stringify(body.details ?? {}),
    created_at: new Date().toISOString()
  });
  return NextResponse.json({ ok: true, row });
}

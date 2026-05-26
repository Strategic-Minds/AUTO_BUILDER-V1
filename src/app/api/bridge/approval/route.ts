import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry, readRecentTelemetry, updateTelemetry } from "@/lib/telemetry-store";

export async function GET() {
  const [approval, escalation, rollback] = await Promise.all([
    readRecentTelemetry("approval_queue", "created_at", 50),
    readRecentTelemetry("escalation_events", "created_at", 50),
    readRecentTelemetry("rollback_requests", "created_at", 50)
  ]);
  return NextResponse.json({ ok: true, approval, escalation, rollback });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { id?: string; action?: "approve" | "reject" | "escalate" | "rollback-request"; reason?: string };
  const now = new Date().toISOString();
  if (!body.id || !body.action) return NextResponse.json({ error: "Missing id/action" }, { status: 400 });
  if (body.action === "approve" || body.action === "reject") {
    const status = body.action === "approve" ? "approved" : "rejected";
    const update = await updateTelemetry("approval_queue", { status }, { id: `eq.${body.id}` });
    return NextResponse.json({ ok: true, update });
  }
  if (body.action === "escalate") {
    const event = await insertTelemetry("escalation_events", { event: body.reason ?? "manual escalation", severity: "high", status: "open", created_at: now });
    return NextResponse.json({ ok: true, event });
  }
  const rollback = await insertTelemetry("rollback_requests", { target: body.id, reason: body.reason ?? "manual rollback request", status: "open", created_at: now });
  return NextResponse.json({ ok: true, rollback });
}

import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry } from "@/lib/telemetry-store";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { taskRef?: string; recipient?: string; channel?: string; approved?: boolean; message?: string };
  const safe = body.approved === true;
  const row = await insertTelemetry("notification_bridge", {
    task_ref: body.taskRef ?? null,
    channel: body.channel ?? "email",
    recipient: body.recipient ?? "strategicmindsadvisory@gmail.com",
    status: safe ? "queued" : "approval_required",
    safe,
    evidence: body.message ?? "notification prepared",
    created_at: new Date().toISOString()
  });
  if (!safe) {
    await insertTelemetry("approval_queue", {
      action_type: "notification_send",
      reason: "External message requires approval",
      risk_score: 85,
      status: "open",
      created_at: new Date().toISOString()
    });
  }
  return NextResponse.json({ ok: true, row, safe });
}

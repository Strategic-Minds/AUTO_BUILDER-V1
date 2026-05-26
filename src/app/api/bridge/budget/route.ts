import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry, readRecentTelemetry } from "@/lib/telemetry-store";

export async function GET() {
  const rows = await readRecentTelemetry("budget_governor", "created_at", 100);
  return NextResponse.json({ ok: true, rows });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { surface?: string; budgetLimit?: number; usageCount?: number };
  const surface = body.surface ?? "unknown";
  const limit = Number(body.budgetLimit ?? 100);
  const usage = Number(body.usageCount ?? 0);
  const blocked = usage > limit;
  const row = await insertTelemetry("budget_governor", {
    surface,
    budget_limit: limit,
    usage_count: usage,
    blocked,
    created_at: new Date().toISOString()
  });
  if (blocked) {
    await insertTelemetry("escalation_events", {
      event: `${surface} budget exceeded`,
      severity: "high",
      status: "open",
      created_at: new Date().toISOString()
    });
  }
  return NextResponse.json({ ok: true, row, blocked });
}

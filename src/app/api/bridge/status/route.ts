import { NextResponse } from "next/server";
import { readRecentTelemetry, telemetryStoreStatus } from "@/lib/telemetry-store";

export async function GET() {
  const [tasks, claims, evidence, blockers, nextPrompts] = await Promise.all([
    readRecentTelemetry("bridge_tasks", "created_at", 50),
    readRecentTelemetry("bridge_claims", "claimed_at", 50),
    readRecentTelemetry("bridge_evidence", "created_at", 50),
    readRecentTelemetry("bridge_blockers", "created_at", 50),
    readRecentTelemetry("bridge_next_prompts", "created_at", 20)
  ]);

  const store = telemetryStoreStatus();
  const openBlockers = blockers.ok
    ? blockers.rows.filter((row: unknown) => (row as Record<string, unknown>).state === "open").length
    : 0;

  return NextResponse.json({
    ok: true,
    architecture: {
      brain: "gpt",
      executor: "codex",
      queueAndEvidence: "supabase",
      controlSurface: "vercel",
      validator: "playwright"
    },
    store,
    openBlockers,
    lastNextBestPrompt: nextPrompts.ok ? nextPrompts.rows[0] ?? null : null,
    tasks,
    claims,
    evidence,
    blockers,
    nextPrompts
  });
}

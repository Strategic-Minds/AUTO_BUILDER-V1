import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry, readTelemetryByQuery, updateTelemetry } from "@/lib/telemetry-store";

const BRIDGE_MAP: Record<string, string> = {
  "web-research": "web_research_bridge",
  "social-media": "social_media_bridge",
  "lead-generation": "lead_generation_bridge",
  "financial-simulation": "financial_simulation_bridge",
  "shopify-commerce": "shopify_commerce_bridge"
};

function tableFor(bridge: string) {
  return BRIDGE_MAP[bridge] as keyof typeof BRIDGE_MAP | undefined;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ bridge: string; action: string }> }) {
  const { bridge, action } = await params;
  const table = tableFor(bridge);
  if (!table) return NextResponse.json({ error: "Unsupported bridge" }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const now = new Date().toISOString();

  if (action === "task") {
    const risk = Number(body.riskScore ?? 35);
    const unsafe = risk >= 70 || body.mutationRequested === true || body.externalSend === true;
    const record = await insertTelemetry(table as never, {
      task_prompt: String(body.taskPrompt ?? "No prompt provided"),
      status: unsafe ? "approval_required" : "queued",
      evidence: null,
      source_url: String(body.sourceUrl ?? ""),
      approved: unsafe ? false : true,
      created_at: now
    });
    if (unsafe) {
      await insertTelemetry("approval_queue", {
        action_type: `${bridge}_task`,
        reason: "Unsafe action requires approval",
        risk_score: risk,
        status: "open",
        created_at: now
      });
    }
    return NextResponse.json({ ok: true, record, unsafe });
  }

  if (action === "claim") {
    const queued = await readTelemetryByQuery(table as never, { select: "*", status: "eq.queued", order: "created_at.asc", limit: "1" });
    const row = queued.rows[0] as Record<string, unknown> | undefined;
    if (!row) return NextResponse.json({ ok: true, claim: null, reason: "No queued task." });
    const claim = await insertTelemetry("bridge_claims", { task_ref: typeof row.id === "string" ? row.id : null, worker: String(body.worker ?? "cloud-worker"), claimed_at: now, status: "claimed" });
    const update = await updateTelemetry(table as never, { status: "claimed" }, { id: `eq.${String(row.id ?? "")}` });
    return NextResponse.json({ ok: true, claim, update, task: row });
  }

  if (action === "evidence") {
    const status = String(body.status ?? "success");
    const evidence = await insertTelemetry("bridge_evidence", {
      task_ref: typeof body.taskId === "string" ? body.taskId : null,
      claim_ref: typeof body.claimId === "string" ? body.claimId : null,
      worker: String(body.worker ?? "cloud-worker"),
      status,
      evidence: String(body.evidence ?? ""),
      blocker: status === "success" ? null : String(body.blocker ?? "bridge failure"),
      created_at: now
    });
    if (status !== "success") {
      await insertTelemetry("bridge_blockers", { task_ref: typeof body.taskId === "string" ? body.taskId : null, blocker: String(body.blocker ?? "bridge failure"), state: "open", created_at: now });
      await insertTelemetry("bridge_tasks", { task_type: "workaround", task_prompt: `Workaround for ${bridge}: ${String(body.blocker ?? "bridge failure")}`, target: "AUTO_BUILDER", priority: "high", state: "queued", approved: true, safe: true, created_at: now });
    }
    return NextResponse.json({ ok: true, evidence });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 404 });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ bridge: string; action: string }> }) {
  const { bridge, action } = await params;
  const table = tableFor(bridge);
  if (!table || action !== "status") return NextResponse.json({ error: "Unsupported request" }, { status: 404 });
  const [rows, blockers] = await Promise.all([
    readTelemetryByQuery(table as never, { select: "*", order: "created_at.desc", limit: "20" }),
    readRecentTelemetry("bridge_blockers", "created_at", 20)
  ]);
  return NextResponse.json({ ok: true, bridge, rows, blockers });
}

import { readRecentTelemetry } from "@/lib/telemetry-store";

import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry } from "@/lib/telemetry-store";

function chooseBridge(taskType: string) {
  if (taskType.includes("browser") || taskType.includes("playwright") || taskType.includes("research")) return "PLAYWRIGHT_WORKER_BRIDGE";
  if (taskType.includes("social")) return "SOCIAL_MEDIA_BRIDGE";
  if (taskType.includes("lead")) return "LEAD_GENERATION_BRIDGE";
  if (taskType.includes("finance")) return "FINANCIAL_SIMULATION_BRIDGE";
  if (taskType.includes("shopify")) return "SHOPIFY_COMMERCE_BRIDGE";
  return "WEB_RESEARCH_BRIDGE";
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { taskType?: string; taskPrompt?: string; riskScore?: number; expectedProfitScore?: number };
  const taskType = body.taskType ?? "research";
  const bridge = chooseBridge(taskType);
  const riskScore = Number(body.riskScore ?? 35);
  const expectedProfitScore = Number(body.expectedProfitScore ?? 60);
  const authority = riskScore >= 70 ? "approval_required" : "safe";

  const routed = await insertTelemetry("capability_router_bridge", {
    task_type: taskType,
    bridge,
    authority_level: authority,
    risk_score: riskScore,
    expected_profit_score: expectedProfitScore,
    required_evidence: "supabase_row_and_source_url",
    created_at: new Date().toISOString()
  });

  if (authority === "approval_required") {
    await insertTelemetry("approval_queue", {
      action_type: taskType,
      reason: "Risk score over threshold",
      risk_score: riskScore,
      status: "open",
      created_at: new Date().toISOString()
    });
  }

  return NextResponse.json({ ok: true, gptBrain: true, codexExecutorOnly: true, routed });
}

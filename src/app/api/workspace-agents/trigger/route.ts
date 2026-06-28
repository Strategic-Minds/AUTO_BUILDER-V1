import { NextRequest, NextResponse } from "next/server";
import { triggerWorkspaceAgent, triggerBusinessBuilder, getAgentRegistry, WORKSPACE_AGENTS } from "@/lib/providers/workspace-agent-adapter";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    registry: getAgentRegistry(),
    token_configured: Boolean(process.env.OPENAI_WORKSPACE_AGENT_TOKEN),
    business_builder: {
      id:     WORKSPACE_AGENTS.BUSINESS_BUILDER.id,
      status: WORKSPACE_AGENTS.BUSINESS_BUILDER.status,
      url:    WORKSPACE_AGENTS.BUSINESS_BUILDER.url,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string,string> | null;
  if (!body?.input) {
    return NextResponse.json({ ok: false, error: "input is required" }, { status: 400 });
  }

  // agentKey defaults to BUSINESS_BUILDER if not specified
  const agentKey = (body.agentKey ?? "BUSINESS_BUILDER") as keyof typeof WORKSPACE_AGENTS;

  const result = await triggerWorkspaceAgent({
    agentKey,
    input:           body.input,
    conversationKey: body.conversationKey,
    idempotencyKey:  body.idempotencyKey,
  });

  // Write receipt to Supabase
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (SB_URL && SB_KEY) {
    try {
      await fetch(`${SB_URL}/rest/v1/factory_receipts`, {
        method: "POST",
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
                   "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          receipt_id:        `rcpt_wa_trigger_${Date.now()}`,
          action:            `workspace_agent_trigger.${agentKey}`,
          agent_id:          "APEX",
          status:            result.ok ? "ok" : "error",
          payload:           result,
          production_mutated: false,
        }),
      });
    } catch { /* non-fatal */ }
  }

  return NextResponse.json(
    { ok: result.ok, result },
    { status: result.ok ? 202 : (result.httpCode ?? 500) }
  );
}

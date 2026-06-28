/**
 * POST /api/workspace-agents/trigger
 * 
 * Trigger a published ChatGPT workspace agent via the Workspace Agents API.
 * Requires OPENAI_WORKSPACE_AGENT_TOKEN + the agent's agtch_XXX ID.
 * 
 * Body: { agentId: "agtch_XXX", input: "...", conversationKey?: "...", idempotencyKey?: "..." }
 * Returns: 202 Accepted (agent runs async) or error details
 */

import { NextRequest, NextResponse } from "next/server";
import { triggerWorkspaceAgent, checkWorkspaceAgentTokenReadiness } from "@/lib/providers/workspace-agent-adapter";

export const runtime = "nodejs";

export async function GET() {
  const readiness = await checkWorkspaceAgentTokenReadiness();
  return NextResponse.json({
    ok:             readiness.valid,
    productionReady: false,
    readiness,
    usage: {
      endpoint:     "POST /api/workspace-agents/trigger",
      body:         { agentId: "agtch_XXX", input: "string", conversationKey: "optional", idempotencyKey: "optional" },
      agentIdFormat: "agtch_XXX — from ChatGPT Admin > Agents > API channel settings",
      baseUrl:       "https://api.chatgpt.com",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.agentId || !body?.input) {
    return NextResponse.json(
      { ok: false, error: "agentId and input are required" },
      { status: 400 }
    );
  }

  const result = await triggerWorkspaceAgent({
    agentId:         body.agentId,
    input:           body.input,
    conversationKey: body.conversationKey,
    idempotencyKey:  body.idempotencyKey,
  });

  return NextResponse.json(
    { ok: result.ok, result, productionActionsAllowed: false },
    { status: result.ok ? 202 : (result.httpCode ?? 500) }
  );
}

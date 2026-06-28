/**
 * OpenAI ChatGPT Workspace Agent Adapter
 * Updated: 2026-06-28
 * 
 * LIVE CONFIRMED:
 *   Business Builder → agtch_6a3f77423aa0819182efa2e9552b8022
 *   202 ✅ confirmed working
 */

const BASE_URL = "https://api.chatgpt.com";

const TOKEN =
  process.env.OPENAI_WORKSPACE_AGENT_TOKEN ??
  process.env.CHATGPT_AGENT_ACCESS_TOKEN ?? "";

// ── AGENT REGISTRY ────────────────────────────────────────────
export const WORKSPACE_AGENTS = {
  BUSINESS_BUILDER: {
    id:          "agtch_6a3f77423aa0819182efa2e9552b8022",
    name:        "Business Builder",
    url:         "https://api.chatgpt.com/v1/workspace_agents/agtch_6a3f77423aa0819182efa2e9552b8022/trigger",
    description: "Autonomous business factory agent — builds sites, manages projects, coordinates factory pipeline",
    status:      "live",
    confirmed:   "2026-06-28T13:18:00Z",
  },
  // Add more agents here as Jeremy provisions their API channels
} as const;

export type AgentKey = keyof typeof WORKSPACE_AGENTS;

export type TriggerInput = {
  agentKey?:       AgentKey;        // use registry key
  agentId?:        string;          // OR pass raw agtch_XXX
  input:           string;
  conversationKey?: string;
  idempotencyKey?:  string;
};

export type TriggerResult = {
  ok:             boolean;
  agentId:        string;
  agentName?:     string;
  httpCode?:      number;
  status:         "accepted" | "error" | "invalid_token" | "not_found" | "not_runnable";
  message:        string;
  conversationUrl?: string;
};

export async function triggerWorkspaceAgent(input: TriggerInput): Promise<TriggerResult> {
  if (!TOKEN) {
    return { ok: false, agentId: "", httpCode: 0, status: "invalid_token",
             message: "OPENAI_WORKSPACE_AGENT_TOKEN not set" };
  }

  const agent = input.agentKey ? WORKSPACE_AGENTS[input.agentKey] : null;
  const agentId   = agent?.id ?? input.agentId ?? "";
  const agentName = agent?.name ?? agentId;

  if (!agentId) {
    return { ok: false, agentId: "", status: "error",
             message: "Provide agentKey or agentId" };
  }

  const headers: Record<string,string> = {
    "Authorization": `Bearer ${TOKEN}`,
    "Content-Type":  "application/json",
  };
  if (input.idempotencyKey) headers["Idempotency-Key"] = input.idempotencyKey;

  const body = JSON.stringify({
    input:            input.input,
    conversation_key: input.conversationKey,
  });

  try {
    const res = await fetch(
      `${BASE_URL}/v1/workspace_agents/${agentId}/trigger`,
      { method: "POST", headers, body }
    );

    if (res.status === 202) {
      const data = await res.json().catch(() => ({})) as { conversation_url?: string };
      return {
        ok: true, agentId, agentName, httpCode: 202,
        status: "accepted",
        message: `${agentName} triggered — running async`,
        conversationUrl: data.conversation_url,
      };
    }

    const err = await res.json().catch(() => ({})) as Record<string,unknown>;
    const msg = (err?.error as Record<string,string>)?.message ?? res.statusText;
    const statusMap: Record<number,TriggerResult["status"]> = {
      401: "invalid_token", 403: "invalid_token",
      404: "not_found",     409: "not_runnable",
    };
    return { ok: false, agentId, agentName, httpCode: res.status,
             status: statusMap[res.status] ?? "error", message: `HTTP ${res.status}: ${msg}` };
  } catch (err) {
    return { ok: false, agentId, status: "error",
             message: err instanceof Error ? err.message : String(err) };
  }
}

/** Convenience: trigger Business Builder directly */
export function triggerBusinessBuilder(input: string, conversationKey?: string) {
  return triggerWorkspaceAgent({
    agentKey: "BUSINESS_BUILDER",
    input,
    conversationKey,
    idempotencyKey: `bb_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
  });
}

export function getAgentRegistry() {
  return Object.entries(WORKSPACE_AGENTS).map(([key, a]) => ({
    key, ...a,
  }));
}

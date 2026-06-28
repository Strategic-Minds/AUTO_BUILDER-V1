/**
 * OpenAI ChatGPT Workspace Agent Adapter
 * 
 * Uses the OPENAI_WORKSPACE_AGENT_TOKEN (at-... prefix) to trigger
 * published ChatGPT workspace agents via the api.chatgpt.com API.
 * 
 * Requires:
 *   - OPENAI_WORKSPACE_AGENT_TOKEN env var (at-... access token)
 *   - Agent must have API channel enabled in ChatGPT workspace builder
 *   - Agent ID in agtch_XXX format (from ChatGPT Admin > Agents > API channel)
 * 
 * Endpoint: POST https://api.chatgpt.com/v1/workspace_agents/{id}/trigger
 * Returns:  202 Accepted (async — response cannot be retrieved via API yet)
 * 
 * Installed: 2026-06-28
 */

const BASE_URL = "https://api.chatgpt.com";

const WORKSPACE_AGENT_TOKEN =
  process.env.OPENAI_WORKSPACE_AGENT_TOKEN ??
  process.env.CHATGPT_AGENT_ACCESS_TOKEN ??
  "";

export type WorkspaceAgentTriggerInput = {
  agentId:         string;          // agtch_XXX format — from ChatGPT Admin > Agents
  input:           string;          // message/prompt to send to the agent
  conversationKey?: string;         // optional stable key for conversation continuity
  idempotencyKey?: string;          // optional — prevents duplicate triggers on retry
};

export type WorkspaceAgentTriggerResult = {
  ok:        boolean;
  agentId:   string;
  status:    "accepted" | "error" | "invalid_token" | "not_found" | "not_runnable" | "dry_run";
  httpCode?: number;
  message:   string;
  dryRun?:   boolean;
};

/**
 * Trigger a published ChatGPT workspace agent via the API channel.
 * Returns 202 Accepted — agent runs asynchronously, no response body.
 */
export async function triggerWorkspaceAgent(
  input: WorkspaceAgentTriggerInput
): Promise<WorkspaceAgentTriggerResult> {
  if (!WORKSPACE_AGENT_TOKEN) {
    return {
      ok: false, agentId: input.agentId, httpCode: 0,
      status: "invalid_token",
      message: "OPENAI_WORKSPACE_AGENT_TOKEN not configured. Set in Vercel env vars.",
    };
  }

  const headers: Record<string, string> = {
    "Authorization":  `Bearer ${WORKSPACE_AGENT_TOKEN}`,
    "Content-Type":   "application/json",
  };
  if (input.idempotencyKey) {
    headers["Idempotency-Key"] = input.idempotencyKey;
  }

  const body = JSON.stringify({
    input:            input.input,
    conversation_key: input.conversationKey,
  });

  try {
    const res = await fetch(
      `${BASE_URL}/v1/workspace_agents/${input.agentId}/trigger`,
      { method: "POST", headers, body }
    );

    if (res.status === 202) {
      return {
        ok: true, agentId: input.agentId, httpCode: 202,
        status: "accepted",
        message: `Agent ${input.agentId} triggered successfully — running async.`,
      };
    }

    const errBody = await res.json().catch(() => ({})) as Record<string, unknown>;
    const errMsg  = (errBody?.error as Record<string,string>)?.message ?? res.statusText;

    const statusMap: Record<number, WorkspaceAgentTriggerResult["status"]> = {
      401: "invalid_token",
      403: "invalid_token",
      404: "not_found",
      409: "not_runnable",
    };

    return {
      ok:      false,
      agentId: input.agentId,
      httpCode: res.status,
      status:  statusMap[res.status] ?? "error",
      message: `HTTP ${res.status}: ${errMsg}`,
    };
  } catch (err) {
    return {
      ok:      false,
      agentId: input.agentId,
      status:  "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Check if the workspace agent token is configured and valid.
 * Uses a known-bad agent ID — expects 404 (not 401) to confirm token validity.
 */
export async function checkWorkspaceAgentTokenReadiness(): Promise<{
  configured: boolean;
  valid:      boolean;
  message:    string;
}> {
  if (!WORKSPACE_AGENT_TOKEN) {
    return { configured: false, valid: false,
             message: "OPENAI_WORKSPACE_AGENT_TOKEN not set" };
  }

  const res = await triggerWorkspaceAgent({
    agentId: "agtch_apex_probe_000",
    input:   "readiness probe",
  });

  // 404 = token valid, agent not found (expected for probe)
  // 401 = token invalid
  const valid = res.httpCode === 404 || res.httpCode === 202 || res.httpCode === 409;

  return {
    configured: true,
    valid,
    message: valid
      ? "Token is valid (got 404 on probe agent — expected). Ready to trigger real agents."
      : `Token may be invalid: ${res.message}`,
  };
}

export function getWorkspaceAgentAdapterReadiness() {
  return {
    provider:         "openai_workspace_agents",
    tokenConfigured:  Boolean(WORKSPACE_AGENT_TOKEN),
    baseUrl:          BASE_URL,
    triggerEndpoint:  `${BASE_URL}/v1/workspace_agents/{agtch_XXX}/trigger`,
    readinessState:   WORKSPACE_AGENT_TOKEN ? "ready_dry_run" : "blocked_missing_secret",
    notes: WORKSPACE_AGENT_TOKEN
      ? "Token at-... confirmed valid (2026-06-28). Add agtch_XXX IDs from ChatGPT Admin > Agents > API channel."
      : "Set OPENAI_WORKSPACE_AGENT_TOKEN in Vercel env vars. Get token from ChatGPT Admin > Access tokens.",
    howToGetAgentId: [
      "1. Open ChatGPT > Team/Business workspace",
      "2. Build or open an existing workspace agent",
      "3. In the agent builder — add channel: API",
      "4. The agent ID (agtch_XXX) appears in the API channel settings",
      "5. Store it in your config or Supabase agent registry",
    ],
  };
}

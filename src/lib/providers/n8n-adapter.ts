/**
 * N8N MCP Adapter
 * Dispatches workflow executions to n8n via MCP SSE endpoint
 * Updated: 2026-06-28
 */

const N8N_BASE   = process.env.N8N_BASE_URL ?? process.env.N8N_WEBHOOK_URL ?? "https://xtremepolishingsystems.app.n8n.cloud";
const N8N_MCP    = process.env.N8N_MCP_URL  ?? `${N8N_BASE}/mcp-server/http`;
const N8N_TOKEN  = process.env.N8N_API_TOKEN ?? process.env.N8N_API_KEY ?? "";

export type N8NDispatchInput = {
  toolName:    string;
  parameters?: Record<string, unknown>;
  dryRun?:     boolean;
};

export type N8NDispatchResult = {
  ok:       boolean;
  provider: "n8n";
  toolName: string;
  status:   "dispatched" | "dry_run" | "error" | "no_token";
  result?:  unknown;
  error?:   string;
};

export async function dispatchToN8N(input: N8NDispatchInput): Promise<N8NDispatchResult> {
  if (input.dryRun) {
    return { ok: true, provider: "n8n", toolName: input.toolName, status: "dry_run" };
  }

  if (!N8N_TOKEN) {
    return { ok: false, provider: "n8n", toolName: input.toolName, status: "no_token",
             error: "N8N_API_TOKEN not configured" };
  }

  try {
    const res = await fetch(N8N_MCP, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${N8N_TOKEN}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id:      `n8n_${Date.now()}`,
        method:  "tools/call",
        params:  { name: input.toolName, arguments: input.parameters ?? {} },
      }),
    });

    const data = await res.json();
    return { ok: res.ok, provider: "n8n", toolName: input.toolName,
             status: "dispatched", result: data };
  } catch (err) {
    return { ok: false, provider: "n8n", toolName: input.toolName, status: "error",
             error: err instanceof Error ? err.message : String(err) };
  }
}

export function getN8NAdapterStatus() {
  return {
    provider:       "n8n",
    baseUrl:        N8N_BASE,
    mcpUrl:         N8N_MCP,
    tokenConfigured: Boolean(N8N_TOKEN),
    status:         N8N_TOKEN ? "ready" : "missing_token",
  };
}

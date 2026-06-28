/**
 * N8N MCP Adapter — src/providers/n8n-adapter.ts
 * Shape: { execute: (action: unknown) => Promise<unknown> }
 * Updated: 2026-06-28
 */

const N8N_BASE  = process.env.N8N_BASE_URL ?? process.env.N8N_WEBHOOK_URL ?? "https://xtremepolishingsystems.app.n8n.cloud";
const N8N_MCP   = process.env.N8N_MCP_URL  ?? `${N8N_BASE}/mcp-server/http`;
const N8N_TOKEN = process.env.N8N_API_TOKEN ?? process.env.N8N_API_KEY ?? "";

/** n8nAdapter — shape: { execute: (action: unknown) => Promise<unknown> } */
export const n8nAdapter: { execute: (action: unknown) => Promise<unknown> } = {
  async execute(action: unknown): Promise<unknown> {
    const a = (action ?? {}) as Record<string, unknown>;
    const toolName = String(a["toolName"] ?? a["workflow"] ?? "default");
    const isDry = a["dryRun"] === true || a["mode"] === "dry_run";

    if (isDry) {
      return { ok: true, provider: "n8n", status: "dry_run" };
    }

    if (!N8N_TOKEN) {
      return { ok: false, provider: "n8n", status: "no_token",
               error: "N8N_API_TOKEN not configured" };
    }

    try {
      const res = await fetch(N8N_MCP, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${N8N_TOKEN}` },
        body: JSON.stringify({
          jsonrpc: "2.0", id: `n8n_${Date.now()}`, method: "tools/call",
          params:  { name: toolName, arguments: (a["payload"] as Record<string,unknown>) ?? {} },
        }),
      });
      const data: unknown = await res.json();
      return { ok: res.ok, provider: "n8n", status: "dispatched", result: data };
    } catch (err) {
      return { ok: false, provider: "n8n", status: "error",
               error: err instanceof Error ? err.message : String(err) };
    }
  },
};

export function getN8nAdapterReadiness(): Record<string, unknown> {
  return {
    provider:        "n8n",
    baseUrl:         N8N_BASE,
    mcpUrl:          N8N_MCP,
    tokenConfigured: Boolean(N8N_TOKEN),
    status:          N8N_TOKEN ? "ready" : "missing_token",
  };
}

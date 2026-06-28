/**
 * N8N MCP Adapter — src/providers/n8n-adapter.ts
 * Resolved path: imported by src/runtime/orchestrator.ts as ../providers/n8n-adapter
 * Updated: 2026-06-28
 */

const N8N_BASE  = process.env.N8N_BASE_URL ?? process.env.N8N_WEBHOOK_URL ?? "https://xtremepolishingsystems.app.n8n.cloud";
const N8N_MCP   = process.env.N8N_MCP_URL  ?? `${N8N_BASE}/mcp-server/http`;
const N8N_TOKEN = process.env.N8N_API_TOKEN ?? process.env.N8N_API_KEY ?? "";

export type N8NResult = {
  ok: boolean; provider: "n8n"; toolName: string;
  status: "dispatched" | "dry_run" | "error" | "no_token";
  result?: unknown; error?: string;
};

export async function n8nAdapter(toolName: string, parameters?: Record<string, unknown>, dryRun = false): Promise<N8NResult> {
  if (dryRun) {
    return { ok: true, provider: "n8n", toolName, status: "dry_run" };
  }
  if (!N8N_TOKEN) {
    return { ok: false, provider: "n8n", toolName, status: "no_token",
             error: "N8N_API_TOKEN not configured" };
  }
  try {
    const res = await fetch(N8N_MCP, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${N8N_TOKEN}` },
      body: JSON.stringify({
        jsonrpc: "2.0", id: `n8n_${Date.now()}`, method: "tools/call",
        params:  { name: toolName, arguments: parameters ?? {} },
      }),
    });
    const data = await res.json();
    return { ok: res.ok, provider: "n8n", toolName, status: "dispatched", result: data };
  } catch (err) {
    return { ok: false, provider: "n8n", toolName, status: "error",
             error: err instanceof Error ? err.message : String(err) };
  }
}

export function getN8nAdapterReadiness() {
  return {
    provider: "n8n", baseUrl: N8N_BASE, mcpUrl: N8N_MCP,
    tokenConfigured: Boolean(N8N_TOKEN),
    status: N8N_TOKEN ? "ready" : "missing_token",
  };
}

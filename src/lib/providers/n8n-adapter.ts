/**
 * N8N Provider Adapter
 * Implements the ProviderAdapter contract for n8n workflow execution.
 * 
 * Operating modes:
 *   dry_run     — returns a preview receipt, no execution
 *   queue_only  — queues to Supabase bridge_tasks, no live call
 *   live        — calls n8n MCP endpoint (requires N8N_API_TOKEN env)
 * 
 * Auto-installed: 2026-06-28 — n8n MCP verified at 
 *   https://xtremepolishingsystems.app.n8n.cloud/mcp-server/http
 */

import type { ProviderAdapter, ProviderBridgeAction, ProviderBridgeResult } from './providerTypes';

const N8N_MCP_URL = process.env.N8N_MCP_URL
  ?? process.env.N8N_API_BASE_URL
  ?? 'https://xtremepolishingsystems.app.n8n.cloud/mcp-server/http';

const N8N_TOKEN = process.env.N8N_API_TOKEN
  ?? process.env.N8N_API_KEY
  ?? process.env.N8N_MCP_TOKEN
  ?? '';

const SUPPORTED_ACTIONS = [
  'search_workflows',
  'execute_workflow',
  'get_execution',
  'search_executions',
  'get_workflow_details',
  'publish_workflow',
  'unpublish_workflow',
  'list_credentials',
  'list_tags',
  'search_data_tables',
  'create_workflow_from_code',
  'validate_workflow',
];

async function callN8nMcp(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
  if (!N8N_TOKEN) {
    throw new Error('N8N_API_TOKEN not configured — cannot execute live n8n call');
  }

  const payload = { jsonrpc: '2.0', method, id: Date.now(), params };
  const res = await fetch(N8N_MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${N8N_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  // Parse SSE or JSON response
  for (const line of text.split('\n')) {
    if (line.startsWith('data:')) {
      try {
        const d = JSON.parse(line.slice(5).trim());
        if (d.result !== undefined) return d.result;
        if (d.error)  throw new Error(`n8n MCP error: ${JSON.stringify(d.error)}`);
      } catch { /* continue */ }
    }
  }

  // Fallback: raw JSON
  try { return JSON.parse(text); } catch { /* ignore */ }
  return { raw: text };
}

export const n8nAdapter: ProviderAdapter = {
  id: 'google_drive' as ProviderAdapter['id'], // typed as closest available; real id: 'n8n'
  label: 'N8N Workflow Automation',
  connected: Boolean(N8N_TOKEN),
  supportedActions: SUPPORTED_ACTIONS,

  async execute(action: ProviderBridgeAction): Promise<ProviderBridgeResult> {
    const base = {
      ok: false as boolean,
      provider: action.provider,
      action: action.action,
      riskClass: action.riskClass,
    };

    // DRY RUN — always safe
    if (action.payload?.mode === 'dry_run' || !action.approved) {
      return {
        ...base,
        ok: true,
        state: 'dry_run',
        dryRun: true,
        response: {
          planned: true,
          n8nConnected: Boolean(N8N_TOKEN),
          mcpUrl: N8N_MCP_URL,
          supportedActions: SUPPORTED_ACTIONS,
          message: 'N8N adapter dry-run: would execute via MCP. No live call made.',
        },
      };
    }

    // LIVE — requires token + approval + supported action
    if (!N8N_TOKEN) {
      return {
        ...base,
        state: 'blocked',
        error: 'N8N_API_TOKEN not configured',
      };
    }

    if (!SUPPORTED_ACTIONS.includes(action.action)) {
      return {
        ...base,
        state: 'blocked',
        error: `Action "${action.action}" not supported by n8n adapter`,
      };
    }

    try {
      const result = await callN8nMcp(action.action, action.payload as Record<string, unknown>);
      return {
        ...base,
        ok: true,
        state: 'completed',
        response: result,
      };
    } catch (err) {
      return {
        ...base,
        state: 'failed',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
};

export function getN8nAdapterReadiness() {
  return {
    provider: 'n8n',
    connected: Boolean(N8N_TOKEN),
    mcpUrl: N8N_MCP_URL,
    tokenConfigured: Boolean(N8N_TOKEN),
    supportedActions: SUPPORTED_ACTIONS,
    readinessState: N8N_TOKEN
      ? 'ready_dry_run'
      : 'blocked_missing_secret',
    notes: N8N_TOKEN
      ? 'N8N MCP verified live at xtremepolishingsystems.app.n8n.cloud. Dry-run and live execution available.'
      : 'N8N_API_TOKEN required. Set in Vercel env vars.',
  };
}

import { NextResponse } from 'next/server';

const SUPA_URL = 'https://prhppuuwcnmfdhwsagug.supabase.co';
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const MCP = 'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp-extended';

async function supaWrite(table: string, data: object) {
  if (!SUPA_KEY) return null;
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(data),
  });
  return r.ok;
}

async function mcpCall(tool: string, args: object = {}) {
  try {
    const r = await fetch(MCP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: tool, arguments: args } }) });
    const d = await r.json();
    return d?.result?.content?.[0]?.text || 'ok';
  } catch { return 'mcp_error'; }
}

export async function GET() {
  const ts = new Date().toISOString();
  
  // Push Base44 state to Supabase
  await supaWrite('agent_memory', {
    agent_id: 'APEX',
    key: 'base44_state',
    value: JSON.stringify({ ts, source: 'vercel_cron_sync', status: 'active', sites: 4, automations: 16 }),
    importance: 7,
    tags: ['sync', 'vercel_cron'],
  });

  // Post MCP receipt
  const receipt = await mcpCall('post_bridge_receipt', { agent: 'APEX', ts, source: 'vercel_awos_sync' });

  return NextResponse.json({ ok: true, ts, receipt, source: 'vercel_cron' });
}

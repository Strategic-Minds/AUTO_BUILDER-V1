import { NextResponse } from 'next/server';

const MCP = 'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp-extended';
const SUPA_URL = 'https://prhppuuwcnmfdhwsagug.supabase.co';
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const HIGH_PRIORITY_TARGETS = [
  'ameripolish.com','husqvarna.com/us/construction','diamondback-ep.com',
  'epoxy.com','garagepros.com','floortex.us','garagemahal.com',
  'floorgraphix.com','quality-epoxy.com','strongholdfloors.com',
];

async function mcpCall(tool: string, args: object = {}) {
  try {
    const r = await fetch(MCP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: tool, arguments: args } }) });
    const d = await r.json();
    return d?.result?.content?.[0]?.text || 'dispatched';
  } catch { return 'error'; }
}

export async function GET() {
  const ts = new Date().toISOString();
  
  // Dispatch intelligence sweep via MCP
  const result = await mcpCall('swarm_intelligence_sweep', {
    targets: HIGH_PRIORITY_TARGETS,
    pack: 'epoxy',
    priority: 'high',
    triggered_by: 'vercel_cron_nightly',
  });

  // Log run
  if (SUPA_KEY) {
    await fetch(`${SUPA_URL}/rest/v1/agent_memory`, {
      method: 'POST',
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ agent_id: 'DISCOVERY', key: `swarm_nightly_${ts}`, value: JSON.stringify({ ts, targets: HIGH_PRIORITY_TARGETS.length, result }), importance: 7, tags: ['swarm', 'nightly', 'vercel_cron'] }),
    });
  }

  return NextResponse.json({ ok: true, ts, targets: HIGH_PRIORITY_TARGETS.length, result, source: 'vercel_cron' });
}

import { NextRequest, NextResponse } from 'next/server';

const APEX_AGENT_ID = '6a3a1cc6fda8cc665dd22ea4';
const APEX_CONV_ID = '6a3a1ccae7bbd796cdbce5c5';
const BASE44_BASE = 'https://app.base44.com';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-mcp-secret');
  if (secret !== process.env.MCP_CALLBACK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { tool, params, agent_id, task_id } = body;

  switch (tool) {
    case 'send_to_apex': {
      const { message } = params;
      const formatted = `[GPT_CALLBACK | agent:${agent_id || 'unknown'} | task:${task_id || 'none'}]\n\n${message}`;
      const r = await fetch(`${BASE44_BASE}/api/agents/${APEX_AGENT_ID}/conversations/${APEX_CONV_ID}/messages`, {
        method: 'POST',
        headers: { 'api_key': process.env.BASE44_API_KEY_2!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formatted, role: 'user' })
      });
      return NextResponse.json({ ok: r.ok, status: r.status, tool: 'send_to_apex' });
    }
    case 'post_to_slack': {
      const { channel, message } = params;
      const CHANNEL_MAP: Record<string, string> = {
        'apex-ops': 'C0BEMGNCX4G', 'apex-builds': 'C0BDV3Z0F9P',
        'apex-leads': 'C0BDWT9PK0U', 'apex-intel': 'C0BDLTRE3D1',
        'apex-approvals': 'C0BDT8DSA2W', 'apex-alerts': 'C0BDR5TEN3G',
        'apex-revenue': 'C0BDPS7QKFX',
      };
      const ch = CHANNEL_MAP[channel] || 'C0BEMGNCX4G';
      const r = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: ch, text: `🤖 *${agent_id || 'GPT Agent'}*\n${message}` })
      });
      const data = await r.json();
      return NextResponse.json({ ok: data.ok, channel: ch, tool: 'post_to_slack' });
    }
    case 'get_task_status': {
      const { project_id } = params;
      const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/factory_project_queue?project_id=eq.${project_id}&select=project_id,status,current_phase,updated_at`, {
        headers: { 'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!, 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
      });
      const data = await r.json();
      return NextResponse.json({ ok: true, data, tool: 'get_task_status' });
    }
    default:
      return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'APEX MCP Callback Server',
    version: '1.0.0',
    tools: [
      { name: 'send_to_apex', description: 'Send result directly to APEX agent', parameters: { message: 'string', agent_id: 'string?', task_id: 'string?' } },
      { name: 'post_to_slack', description: 'Post to an APEX Slack channel', parameters: { channel: 'apex-ops|apex-builds|apex-leads|apex-intel|apex-approvals|apex-alerts|apex-revenue', message: 'string' } },
      { name: 'get_task_status', description: 'Check factory project status', parameters: { project_id: 'string' } }
    ],
    endpoint: 'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/apex-callback',
    auth: 'x-mcp-secret header'
  });
}

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sbHdrs = { apikey: KEY, Authorization: `Bearer ${KEY}` };

export async function POST(req: NextRequest) {
  try {
    const { message, agent_handle = '@xab', history = [] } = await req.json();
    if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return NextResponse.json({ response: 'OpenAI not configured. Add OPENAI_API_KEY to environment.', agent: agent_handle });

    // Load agent from DB
    const agentResp = await fetch(`${SB}/rest/v1/xab_agents?handle=eq.${encodeURIComponent(agent_handle)}&select=*&limit=1`, { headers: sbHdrs });
    const agents = await agentResp.json();
    const agent = agents[0];
    const systemPrompt = agent?.system_prompt || 'You are XAB, an autonomous AI assistant. Never show code in chat.';

    // Load memories
    let memoryContext = '';
    try {
      if (agent?.agent_id) {
        const memResp = await fetch(`${SB}/rest/v1/memory_semantic?agent_id=eq.${agent.agent_id}&select=subject,predicate,object&order=confidence.desc&limit=10`, { headers: sbHdrs });
        const mems = await memResp.json();
        if (mems.length > 0) {
          memoryContext = '\n\nKEY CONTEXT:\n' + mems.map((m: {subject:string;predicate:string;object:string}) => `- ${m.subject} ${m.predicate} ${m.object}`).join('\n');
        }
      }
    } catch {}

    const messages = [
      { role: 'system', content: systemPrompt + memoryContext },
      ...history.slice(-10).map((m: {role:string;content:string}) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: agent?.preferred_model || 'gpt-4o', messages, max_tokens: 1000, temperature: Number(agent?.temperature) || 0.7 }),
    });

    const data = await r.json();
    const response = data.choices?.[0]?.message?.content || 'No response generated.';

    return NextResponse.json({ response, agent: agent_handle, agent_name: agent?.name || 'XAB', tokens: data.usage?.total_tokens });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'XAB Agent Message API', methods: ['POST'] });
}


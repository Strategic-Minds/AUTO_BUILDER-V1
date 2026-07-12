import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { prompt, type = 'component' } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

    const systemPrompt = `You are an expert web developer. Generate complete, self-contained HTML with inline CSS and JavaScript.
Requirements:
- Dark background (#0a0a10), white text, modern design
- Fully functional and interactive
- Mobile responsive
- No external dependencies except for icons from unpkg if needed
- Return ONLY the HTML, no explanation, no markdown`;

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Build: ${prompt}` }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    const data = await r.json();
    const html = data.choices?.[0]?.message?.content || '';
    const artifact = { id: Date.now().toString(), type, title: prompt.slice(0, 50), html, created_at: new Date().toISOString() };
    return NextResponse.json({ artifact, tokens: data.usage?.total_tokens });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}


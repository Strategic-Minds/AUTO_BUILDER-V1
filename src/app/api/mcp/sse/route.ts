export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type JsonValue = Record<string, unknown>;

const encoder = new TextEncoder();

function sse(data: JsonValue, event = 'message') {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function toolDefinitions() {
  return [
    { name: 'autobuilder_stack_status', description: 'Returns AUTO BUILDER stack and governance status.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
    { name: 'governance_preflight', description: 'Classifies requested action for governance safety.', inputSchema: { type: 'object', properties: { action: { type: 'string' }, targetSystem: { type: 'string' }, mutationRequested: { type: 'boolean' }, currentSessionExplicitCommand: { type: 'boolean' } }, required: ['action'], additionalProperties: true } },
    { name: 'create_repurpose_task_packet', description: 'Creates governed repurpose task packet without execution.', inputSchema: { type: 'object', properties: { sourceVideoUrl: { type: 'string' }, campaignName: { type: 'string' }, targetPlatforms: { type: 'array', items: { type: 'string' } }, postsPerDay: { type: 'number' } }, required: ['sourceVideoUrl', 'campaignName'], additionalProperties: true } },
    { name: 'recursive_prompt_chain_next', description: 'Extracts or creates next GPT instruction from final block.', inputSchema: { type: 'object', properties: { lastResponse: { type: 'string' } }, required: ['lastResponse'], additionalProperties: true } }
  ];
}

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(sse({ type: 'endpoint', endpoint: '/api/mcp', protocol: 'mcp-sse-compat', tools: toolDefinitions().map((tool) => tool.name) }, 'endpoint'));
      controller.enqueue(sse({ jsonrpc: '2.0', method: 'notifications/initialized', params: { serverInfo: { name: 'auto-builder-mcp-bridge', version: '0.3.3' }, capabilities: { tools: {} } } }, 'message'));
    }
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no'
    }
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return Response.json({
    jsonrpc: '2.0',
    id: body.id ?? null,
    result: body.method === 'tools/list' ? { tools: toolDefinitions() } : { status: 'ok', note: 'Use /api/mcp for JSON-RPC tool calls. This SSE route provides Agent Builder compatibility discovery.' }
  });
}

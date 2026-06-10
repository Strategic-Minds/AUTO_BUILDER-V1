import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_BASE_URL = 'https://auto-builder-strategic-minds-advisory.vercel.app';
const MCP_PATH = '/api/mcp-extended';

async function postJsonRpc(baseUrl: string, body: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}${MCP_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream'
    },
    body: JSON.stringify(body)
  });

  const raw = await response.text();
  const dataLine = raw
    .split('\n')
    .find((line) => line.startsWith('data: '));

  let parsed: unknown = null;
  if (dataLine) {
    try {
      parsed = JSON.parse(dataLine.replace(/^data: /, ''));
    } catch {
      parsed = null;
    }
  } else {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  return {
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get('content-type'),
    ok: response.ok,
    json: parsed
  };
}

function extractToolNames(result: unknown): string[] {
  if (!result || typeof result !== 'object') return [];
  const maybe = result as { json?: { result?: { tools?: Array<{ name?: string }> } } };
  return maybe.json?.result?.tools?.map((tool) => tool.name).filter((name): name is string => Boolean(name)) ?? [];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = url.searchParams.get('baseUrl') || DEFAULT_BASE_URL;

  const initialize = await postJsonRpc(baseUrl, {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'auto-builder-2-extended-post-bridge',
        version: '1.0.0'
      }
    }
  });

  const toolsList = await postJsonRpc(baseUrl, {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  });

  const toolNames = extractToolNames(toolsList);

  return NextResponse.json({
    bridge: '/api/mcp-extended-post-test',
    target: `${baseUrl}${MCP_PATH}`,
    initialize: {
      status: initialize.status,
      statusText: initialize.statusText,
      ok: initialize.ok,
      contentType: initialize.contentType,
      protocolVersion: (initialize.json as { result?: { protocolVersion?: string } } | null)?.result?.protocolVersion ?? null,
      serverInfo: (initialize.json as { result?: { serverInfo?: unknown } } | null)?.result?.serverInfo ?? null
    },
    toolsList: {
      status: toolsList.status,
      statusText: toolsList.statusText,
      ok: toolsList.ok,
      contentType: toolsList.contentType
    },
    toolCount: toolNames.length,
    toolNames
  });
}

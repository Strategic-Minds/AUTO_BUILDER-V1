import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_BASE_URL = 'https://auto-builder-g9dh7661i-strategic-minds-advisory.vercel.app';
const MCP_PATH = '/api/mcp';

async function postJsonRpc(baseUrl: string, body: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}${MCP_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream'
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let parsed: unknown = null;

  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }

  return {
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get('content-type'),
    raw: text,
    json: parsed
  };
}

function extractToolNames(result: unknown): string[] {
  if (!result || typeof result !== 'object') return [];
  const container = result as { json?: { result?: { tools?: Array<{ name?: string }> } } };
  return container.json?.result?.tools?.map((tool) => tool.name).filter((name): name is string => Boolean(name)) ?? [];
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
        name: 'auto-builder-2-preview-post-bridge',
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
    bridge: '/api/mcp-post-test',
    target: `${baseUrl}${MCP_PATH}`,
    initialize,
    toolsList,
    toolCount: toolNames.length,
    toolNames
  });
}

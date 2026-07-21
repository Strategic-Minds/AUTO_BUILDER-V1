export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CheckResult = {
  route: string;
  ok: boolean;
  httpStatus?: number;
  response?: unknown;
  error?: string;
};

const expectedToolNames = [
  'image_generate_asset',
  'drive_upload_image',
  'drive_upload_file',
  'drive_download_file',
  'drive_create_folder_tree',
  'drive_move_file',
  'drive_move_folder',
  'drive_copy_file',
  'drive_write_receipt'
];

async function postJson(origin: string, body: Record<string, unknown>): Promise<CheckResult> {
  try {
    const response = await fetch(`${origin}/api/mcp-media-drive`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    });
    const json = await response.json().catch(() => ({}));
    return {
      route: '/api/mcp-media-drive',
      ok: response.ok,
      httpStatus: response.status,
      response: json
    };
  } catch (error) {
    return {
      route: '/api/mcp-media-drive',
      ok: false,
      error: error instanceof Error ? error.message : 'unknown_error'
    };
  }
}

async function getJson(origin: string, route: string): Promise<CheckResult> {
  try {
    const response = await fetch(`${origin}${route}`, { cache: 'no-store' });
    const json = await response.json().catch(() => ({}));
    return {
      route,
      ok: response.ok,
      httpStatus: response.status,
      response: json
    };
  } catch (error) {
    return {
      route,
      ok: false,
      error: error instanceof Error ? error.message : 'unknown_error'
    };
  }
}

function resultObject(check: CheckResult) {
  const response = check.response;
  if (!response || typeof response !== 'object') return {} as Record<string, unknown>;
  return response as Record<string, unknown>;
}

function mcpResult(check: CheckResult) {
  const response = resultObject(check);
  const result = response.result;
  return result && typeof result === 'object' ? result as Record<string, unknown> : {};
}

function parseToolCallText(check: CheckResult) {
  const result = mcpResult(check);
  const content = result.content;
  if (!Array.isArray(content)) return {} as Record<string, unknown>;
  const first = content[0];
  if (!first || typeof first !== 'object') return {} as Record<string, unknown>;
  const text = (first as { text?: unknown }).text;
  if (typeof text !== 'string') return {} as Record<string, unknown>;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
  } catch {
    return {} as Record<string, unknown>;
  }
}

function smokeResult(check: CheckResult) {
  return resultObject(check);
}

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV === 'production') {
    return Response.json(
      {
        ok: false,
        status: 'blocked_in_production',
        reason: 'Media Drive preview validation is disabled in production.'
      },
      { status: 403 }
    );
  }

  const origin = new URL(request.url).origin;

  const initializeCheck = await postJson(origin, {
    jsonrpc: '2.0',
    id: 'initialize',
    method: 'initialize',
    params: {}
  });

  const toolsListCheck = await postJson(origin, {
    jsonrpc: '2.0',
    id: 'tools-list',
    method: 'tools/list',
    params: {}
  });

  const hardGateCheck = await postJson(origin, {
    jsonrpc: '2.0',
    id: 'hard-gate',
    method: 'tools/call',
    params: {
      name: 'drive_move_file',
      arguments: {
        project_slug: 'preview-validation-media-drive',
        file_id: 'planned-blocked-file',
        to_folder_id: 'planned-target-folder',
        source_folder_path: '00 Source Truth/locked-file.png',
        reason: 'Preview validation should force source truth hard gate.',
        delete_action: true
      }
    }
  });

  const smokeCheck = await getJson(origin, '/api/mcp-media-drive-smoke');

  const initializeResult = mcpResult(initializeCheck);
  const toolsResult = mcpResult(toolsListCheck);
  const tools = Array.isArray(toolsResult.tools) ? toolsResult.tools : [];
  const toolNames = tools
    .map((tool) => tool && typeof tool === 'object' ? (tool as { name?: unknown }).name : '')
    .filter((name): name is string => typeof name === 'string')
    .sort();
  const missingTools = expectedToolNames.filter((name) => !toolNames.includes(name));

  const hardGateResult = parseToolCallText(hardGateCheck);
  const smoke = smokeResult(smokeCheck);

  const validations = {
    initialize: initializeCheck.ok && (initializeResult.serverInfo as { name?: unknown } | undefined)?.name === 'auto-builder-2-media-drive-pipeline',
    toolsList: toolsListCheck.ok && toolNames.length === expectedToolNames.length && missingTools.length === 0,
    hardGate: hardGateCheck.ok && hardGateResult.status === 'hard_gated' && hardGateResult.liveMutation === false,
    smoke: smokeCheck.ok && smoke.status === 'pass' && smoke.liveMutation === false && smoke.steps === 7 && smoke.hard_gated === 0
  };

  const ok = Object.values(validations).every(Boolean);

  return Response.json(
    {
      ok,
      status: ok ? 'pass' : 'failed',
      origin,
      validations,
      expectedToolNames,
      toolNames,
      missingTools,
      checks: {
        initializeCheck,
        toolsListCheck,
        hardGateCheck: {
          ...hardGateCheck,
          parsedToolResult: hardGateResult
        },
        smokeCheck
      },
      liveMutation: false,
      productionApprovalReady: false,
      nextAction: ok
        ? 'Keep PR #38 draft until workflow evidence and review decision are complete.'
        : 'Fix Media Drive preview validation failures before review promotion.'
    },
    { status: ok ? 200 : 424 }
  );
}

import { NextRequest, NextResponse } from 'next/server';

type JsonRpcRequest = {
  jsonrpc?: '2.0';
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

type ToolCallParams = {
  name?: string;
  arguments?: Record<string, unknown>;
};

const SERVER_INFO = {
  name: 'auto-builder-mcp-bridge',
  version: '0.2.0',
};

const TOOL_DEFINITIONS = [
  {
    name: 'autobuilder_stack_status',
    title: 'AUTO BUILDER Stack Status',
    description:
      'Returns the locked AUTO BUILDER stack, governance posture, and active bridge surfaces.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'create_repurpose_task_packet',
    title: 'Create Repurpose Task Packet',
    description:
      'Creates a governed task packet for video repurposing through Repurpose.io, Drive handoff, Xyla/Facebook publishing, and Shopify attribution. This does not publish or mutate external systems.',
    inputSchema: {
      type: 'object',
      properties: {
        sourceVideoUrl: { type: 'string', description: 'Drive URL, public URL, or source identifier for the video.' },
        campaignName: { type: 'string', description: 'Campaign or product campaign name.' },
        shopifyProductHandle: { type: 'string', description: 'Optional Shopify product handle or product identifier.' },
        targetPlatforms: {
          type: 'array',
          items: { type: 'string' },
          description: 'Target platforms such as Facebook, Instagram, TikTok, YouTube, LinkedIn, Reddit.',
        },
        postsPerDay: { type: 'number', description: 'Desired posting cadence.' },
      },
      required: ['sourceVideoUrl', 'campaignName'],
      additionalProperties: true,
    },
  },
  {
    name: 'governance_preflight',
    title: 'Governance Preflight',
    description:
      'Classifies a requested action as read-only, safe planned work, or protected mutation requiring Jeremy approval.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string' },
        targetSystem: { type: 'string' },
        mutationRequested: { type: 'boolean' },
        currentSessionExplicitCommand: { type: 'boolean' },
      },
      required: ['action'],
      additionalProperties: true,
    },
  },
  {
    name: 'recursive_prompt_chain_next',
    title: 'Recursive Prompt Chain Next',
    description:
      'Extracts or creates the next executable GPT instruction from the prior response final block. This preserves recursive AUTO BUILDER progression without authorizing protected mutation.',
    inputSchema: {
      type: 'object',
      properties: {
        lastResponse: { type: 'string', description: 'The full prior GPT response, including the final executive block if available.' },
        currentPhaseStep: { type: 'string', description: 'Current PHASE-X / STEP-Y marker.' },
        objective: { type: 'string', description: 'Optional objective if fallback generation is needed.' },
        humanNeeded: { type: 'boolean', description: 'Whether the last response required human intervention.' },
      },
      required: ['lastResponse'],
      additionalProperties: true,
    },
  },
];

function jsonRpcResult(id: JsonRpcRequest['id'], result: unknown) {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, result });
}

function jsonRpcError(id: JsonRpcRequest['id'], code: number, message: string, data?: unknown) {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message, data } }, { status: 200 });
}

function asText(content: unknown) {
  return [{ type: 'text', text: typeof content === 'string' ? content : JSON.stringify(content, null, 2) }];
}

function requireBridgeToken(req: NextRequest) {
  const configured = process.env.AUTO_BUILDER_MCP_TOKEN;
  if (!configured) return true;
  const auth = req.headers.get('authorization') || '';
  return auth === `Bearer ${configured}`;
}

function stackStatus() {
  return {
    phase: 'PHASE-10 / STEP-12',
    stack: [
      'Google Workspace',
      'Google Drive',
      'Google Sheets',
      'Shopify',
      'Stripe',
      'Repurpose.io',
      'Xyla',
      'Facebook',
      'GitHub',
      'Vercel',
      'Supabase',
      'OpenAI',
      'MCP Bridge Layer',
    ],
    primaryCanon: {
      drive: 'https://drive.google.com/drive/folders/1UbkNznxlUcdeJi8NGgMIIGXbuA6BcDu-',
      opsSheet: 'https://docs.google.com/spreadsheets/d/1jlfP3ZGtrR9gZQ2MokljJjtQZMKNcNVC-xGifOryfao',
    },
    connectedByUser: {
      stripe: 'Connected with read/write access under strategicmindsadvisory@gmail.com; MCP defaults to read-only financial inspection unless exact current-session command authorizes mutation.',
      repurpose: 'Repurpose.io connected under strategicmindsadvisory@gmail.com with Facebook connection complete by user report.',
    },
    governance: {
      defaultMode: 'read-only inspection, planning, task packet creation, validation, and continuity logging',
      protectedMutationRule:
        'No workflow, governance, source-truth, billing, deployment, database, Shopify, Stripe money movement, Vercel env, Supabase schema, Drive canon, Sheets canon, or authority-file mutation without Jeremy explicit current-session command.',
    },
    closedLoopTarget:
      'GPT -> MCP bridge -> Drive/Repurpose.io -> finished clips -> Xyla/Facebook -> Shopify/Stripe attribution -> Supabase telemetry -> recursive optimization',
  };
}

function createRepurposeTaskPacket(args: Record<string, unknown>) {
  const targetPlatforms = Array.isArray(args.targetPlatforms) ? args.targetPlatforms : ['Facebook'];
  return {
    status: 'TASK_PACKET_CREATED_NOT_EXECUTED',
    governance: 'No external publish, Shopify mutation, Stripe money movement, or production action performed by this tool.',
    packet: {
      sourceVideoUrl: args.sourceVideoUrl,
      campaignName: args.campaignName,
      shopifyProductHandle: args.shopifyProductHandle ?? null,
      targetPlatforms,
      postsPerDay: args.postsPerDay ?? 3,
      handoff: {
        intake: 'Place source video in Drive intake folder or provide URL.',
        repurpose: 'Use Repurpose.io connected under strategicmindsadvisory@gmail.com.',
        output: 'Export finished clips/shorts to Drive output folder.',
        publish: 'Route finalized assets to Xyla/Facebook publishing queue.',
        attribution: 'Attach UTM campaign, platform, clip ID, product handle, date, Shopify outcome, and Stripe payment/deposit reference when available.',
      },
      requiredValidation: [
        'Confirm video intake asset exists.',
        'Confirm Repurpose.io job created or queued.',
        'Confirm finished clip output exists.',
        'Confirm publish destination connected.',
        'Confirm Shopify/Stripe attribution fields are recorded before optimization.',
      ],
    },
  };
}

function governancePreflight(args: Record<string, unknown>) {
  const mutation = args.mutationRequested === true;
  const explicit = args.currentSessionExplicitCommand === true;
  const target = String(args.targetSystem ?? 'unknown').toLowerCase();
  const financialTarget = target.includes('stripe') || target.includes('billing') || target.includes('payout') || target.includes('refund');
  const protectedMutation = mutation && !explicit;
  return {
    action: args.action,
    targetSystem: args.targetSystem ?? 'unknown',
    classification: protectedMutation ? 'BLOCKED_PROTECTED_MUTATION' : mutation ? 'AUTHORIZED_MUTATION_REQUIRES_VALIDATION' : 'SAFE_READ_OR_PLAN',
    humanNeeded: protectedMutation,
    financialSafety: financialTarget
      ? 'Stripe/billing/payout/refund actions are protected. Default MCP behavior is read-only unless Jeremy explicitly commands the exact mutation in the current session.'
      : 'No financial protected target detected.',
    nextStep: protectedMutation
      ? 'Stop mutation, document blocker, provide workaround, request exact Jeremy command.'
      : 'Continue governed execution with validation and dehydrate logging.',
  };
}

function recursivePromptChainNext(args: Record<string, unknown>) {
  const lastResponse = String(args.lastResponse || '');
  const match = lastResponse.match(/NEXT GPT INSTRUCTION:\s*```(?:text)?\s*([\s\S]*?)```/i);
  const extracted = match?.[1]?.trim();
  const objective = String(args.objective || 'Continue AUTO BUILDER recursive operation.');

  return {
    status: extracted ? 'EXTRACTED_NEXT_INSTRUCTION' : 'GENERATED_FALLBACK_NEXT_INSTRUCTION',
    humanNeeded: args.humanNeeded === true,
    currentPhaseStep: args.currentPhaseStep ?? 'UNKNOWN',
    nextInstruction:
      extracted ||
      `PHASE-NEXT / STEP-1 :\n\nRehydrate AUTO BUILDER continuity from the AUTOBUILDER BRIDGE Ops Sheet and governance hierarchy.\n\nObjective: ${objective}\n\nPreserve governance locks, executive final block reporting, blocker/workaround/self-heal logging, recursive continuation logic, and autonomous continuity preservation. If prior context is insufficient, stop and request rehydrate before any protected mutation.`,
    governance:
      'The recursive prompt-chain tool must not authorize protected mutation unless Jeremy explicitly commanded that exact mutation in the current session.',
  };
}

async function handleRpc(req: NextRequest, body: JsonRpcRequest) {
  if (!requireBridgeToken(req)) {
    return jsonRpcError(body.id, -32001, 'Unauthorized MCP bridge request.');
  }

  switch (body.method) {
    case 'initialize':
      return jsonRpcResult(body.id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });

    case 'tools/list':
      return jsonRpcResult(body.id, { tools: TOOL_DEFINITIONS });

    case 'tools/call': {
      const params = (body.params || {}) as ToolCallParams;
      const args = params.arguments || {};
      if (params.name === 'autobuilder_stack_status') return jsonRpcResult(body.id, { content: asText(stackStatus()) });
      if (params.name === 'create_repurpose_task_packet') return jsonRpcResult(body.id, { content: asText(createRepurposeTaskPacket(args)) });
      if (params.name === 'governance_preflight') return jsonRpcResult(body.id, { content: asText(governancePreflight(args)) });
      if (params.name === 'recursive_prompt_chain_next') return jsonRpcResult(body.id, { content: asText(recursivePromptChainNext(args)) });
      return jsonRpcError(body.id, -32602, `Unknown tool: ${params.name}`);
    }

    default:
      return jsonRpcError(body.id, -32601, `Unsupported method: ${body.method}`);
  }
}

export async function GET() {
  return NextResponse.json({
    name: SERVER_INFO.name,
    version: SERVER_INFO.version,
    status: 'ok',
    endpoint: '/api/mcp',
    tools: TOOL_DEFINITIONS.map((tool) => tool.name),
    installHint: 'Use POST JSON-RPC MCP requests or add this deployed URL as a ChatGPT MCP/custom app server if your workspace supports custom MCP apps.',
  });
}

export async function POST(req: NextRequest) {
  let body: JsonRpcRequest;
  try {
    body = await req.json();
  } catch {
    return jsonRpcError(null, -32700, 'Invalid JSON.');
  }
  return handleRpc(req, body);
}

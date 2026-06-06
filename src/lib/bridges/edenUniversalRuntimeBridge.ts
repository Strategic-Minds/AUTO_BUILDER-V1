import { handleGitHubWorkflowBridge, type GitHubWorkflowBridgeRequest } from '@/lib/bridges/githubWorkflowBridge';
import { triggerVercelRedeploy, type VercelRedeployRequest } from '@/lib/bridges/vercelRedeployBridge';
import { insertTelemetry, telemetryStoreStatus } from '@/lib/telemetry-store';

export type EdenRuntimeProvider = 'github' | 'vercel' | 'supabase' | 'drive' | 'shopify' | 'heygen';
export type EdenRuntimeIntent = 'read' | 'write' | 'execute' | 'queue' | 'readiness';

export type EdenRuntimeBridgeRequest = {
  provider?: EdenRuntimeProvider;
  intent?: EdenRuntimeIntent;
  action?: string;
  requestedBy?: string;
  payload?: Record<string, unknown>;
  approvedExternalWrite?: boolean;
  approvalPhrase?: string;
  dryRun?: boolean;
};

type SupabasePayload = {
  table?: string;
  method?: 'GET' | 'POST';
  select?: string;
  filters?: Record<string, string>;
  body?: Record<string, unknown>;
  limit?: number;
};

const WRITE_APPROVAL_PHRASE = 'APPROVE EDEN RUNTIME WRITE';
const EXECUTE_APPROVAL_PHRASE = 'APPROVE EDEN RUNTIME EXECUTE';
const SAFE_SUPABASE_WRITE_TABLES = new Set([
  'bridge_evidence',
  'bridge_blockers',
  'bridge_next_prompts',
  'bridge_connector_actions',
  'queue_jobs',
  'runtime_telemetry_events',
  'approval_queue'
]);

function envPresent(name: string) {
  return Boolean(process.env[name]);
}

function getBridgeAuthConfigured() {
  return Boolean(process.env.EDEN_RUNTIME_BRIDGE_TOKEN);
}

function isAuthorized(authHeader: string | null) {
  const token = process.env.EDEN_RUNTIME_BRIDGE_TOKEN;
  if (!token) return false;
  return authHeader === `Bearer ${token}`;
}

function externalMutationApproved(input: EdenRuntimeBridgeRequest) {
  if (input.intent === 'write') {
    return input.approvedExternalWrite === true && input.approvalPhrase === WRITE_APPROVAL_PHRASE;
  }

  if (input.intent === 'execute') {
    return input.approvedExternalWrite === true && input.approvalPhrase === EXECUTE_APPROVAL_PHRASE;
  }

  return true;
}

export function getEdenUniversalRuntimeReadiness() {
  const supabaseStatus = telemetryStoreStatus();

  return {
    ok: true,
    bridge: 'eden-universal-runtime-bridge',
    secretsExposed: false,
    auth: {
      writeTokenConfigured: getBridgeAuthConfigured(),
      writeAndExecuteRequireBearerToken: true
    },
    approval: {
      writePhrase: WRITE_APPROVAL_PHRASE,
      executePhrase: EXECUTE_APPROVAL_PHRASE,
      productionDeploysRemainBlockedUnlessExplicitlyApproved: true,
      shopifyMutationsRemainApprovalGated: true,
      publicPublishingRemainApprovalGated: true,
      paymentAndDiscountChangesRemainApprovalGated: true,
      supabaseSchemaMutationsRemainBlocked: true
    },
    providers: [
      {
        provider: 'github',
        status: envPresent('GITHUB_WORKFLOW_TOKEN') || envPresent('GITHUB_TOKEN') ? 'ready' : 'blocked',
        reads: ['workflow list', 'workflow runs', 'jobs', 'job logs'],
        writes: ['workflow_dispatch through governed approval gate'],
        requiredEnv: ['GITHUB_WORKFLOW_TOKEN or GITHUB_TOKEN']
      },
      {
        provider: 'vercel',
        status: envPresent('VERCEL_TOKEN') ? 'partial' : 'blocked',
        reads: ['bridge readiness'],
        writes: ['preview redeploy through governed bridge'],
        requiredEnv: ['VERCEL_TOKEN', 'AUTO_BUILDER_VERCEL_PROJECT_ID or VERCEL_PROJECT_ID', 'EDEN_SKYE_VERCEL_PROJECT_ID for Eden target']
      },
      {
        provider: 'supabase',
        status: supabaseStatus.configured ? 'partial' : 'blocked',
        reads: ['REST select from configured project'],
        writes: ['REST insert only to safe bridge/queue/approval tables'],
        requiredEnv: ['SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
      },
      {
        provider: 'drive',
        status: envPresent('GOOGLE_CLIENT_EMAIL') && envPresent('GOOGLE_PRIVATE_KEY') ? 'adapter_env_present' : 'queue_only',
        reads: ['queue packet and external connector handoff'],
        writes: ['queued Drive move/create/update packet until runtime adapter is installed'],
        requiredEnv: ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY']
      },
      {
        provider: 'shopify',
        status: envPresent('SHOPIFY_ADMIN_TOKEN') && envPresent('SHOPIFY_SHOP') ? 'adapter_env_present' : 'queue_only',
        reads: ['queue packet and external connector handoff'],
        writes: ['queued product/media/collection packet until approved runtime adapter is installed'],
        requiredEnv: ['SHOPIFY_ADMIN_TOKEN', 'SHOPIFY_SHOP']
      },
      {
        provider: 'heygen',
        status: envPresent('HEYGEN_API_KEY') ? 'adapter_env_present' : 'queue_only',
        reads: ['queue packet and external connector handoff'],
        writes: ['queued avatar/video/speech packet until approved runtime adapter is installed'],
        requiredEnv: ['HEYGEN_API_KEY']
      }
    ]
  };
}

async function block(input: EdenRuntimeBridgeRequest, reason: string, severity: 'yellow' | 'red' = 'red') {
  await insertTelemetry('bridge_blockers', {
    worker: 'eden-universal-runtime-bridge',
    blocker: reason,
    severity,
    created_at: new Date().toISOString()
  });

  return {
    ok: false,
    blocked: true,
    status: severity === 'red' ? 423 : 503,
    reason,
    provider: input.provider,
    intent: input.intent,
    action: input.action
  };
}

async function queuePacket(input: EdenRuntimeBridgeRequest, reason = 'Provider runtime adapter is queue-first in current cloud bridge.') {
  const receipt = await insertTelemetry('bridge_evidence', {
    worker: 'eden-universal-runtime-bridge',
    status: 'queued',
    evidence: JSON.stringify({ provider: input.provider, intent: input.intent, action: input.action, payload: input.payload ?? {} }),
    blocker: reason,
    created_at: new Date().toISOString()
  });

  return {
    ok: true,
    status: 202,
    mode: 'queued',
    provider: input.provider,
    intent: input.intent,
    action: input.action,
    reason,
    receipt
  };
}

async function handleSupabase(input: EdenRuntimeBridgeRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const payload = (input.payload ?? {}) as SupabasePayload;
  const method = payload.method ?? (input.intent === 'read' ? 'GET' : 'POST');
  const table = payload.table;

  if (!supabaseUrl || !serviceRoleKey) {
    return block(input, 'Supabase runtime env is missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.', 'yellow');
  }

  if (!table) {
    return block(input, 'Supabase payload.table is required.');
  }

  if (method !== 'GET' && !SAFE_SUPABASE_WRITE_TABLES.has(table)) {
    return block(input, `Supabase write blocked. Table ${table} is not in the safe bridge table allowlist.`);
  }

  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  if (method === 'GET') {
    url.searchParams.set('select', payload.select ?? '*');
    url.searchParams.set('limit', String(payload.limit ?? 25));
    for (const [key, value] of Object.entries(payload.filters ?? {})) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      'content-type': 'application/json',
      ...(method === 'POST' ? { prefer: 'return=representation' } : {})
    },
    body: method === 'POST' ? JSON.stringify(payload.body ?? {}) : undefined,
    cache: 'no-store'
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  await insertTelemetry('bridge_evidence', {
    worker: 'eden-universal-runtime-bridge',
    status: response.ok ? 'success' : 'failed',
    evidence: JSON.stringify({ provider: 'supabase', table, method, status: response.status }),
    blocker: response.ok ? null : text,
    created_at: new Date().toISOString()
  });

  return {
    ok: response.ok,
    status: response.status,
    provider: 'supabase',
    table,
    method,
    data
  };
}

export async function handleEdenUniversalRuntimeBridge(input: EdenRuntimeBridgeRequest, authHeader: string | null) {
  if (!input.provider || input.intent === 'readiness' || input.action === 'readiness') {
    return getEdenUniversalRuntimeReadiness();
  }

  const intent = input.intent ?? 'read';
  const protectedIntent = intent === 'write' || intent === 'execute';
  if (protectedIntent && !isAuthorized(authHeader)) {
    return block(input, 'Write/execute requests require EDEN_RUNTIME_BRIDGE_TOKEN bearer auth.');
  }

  if (protectedIntent && !externalMutationApproved({ ...input, intent })) {
    return block(input, 'Write/execute request missing required approval flag and approval phrase.');
  }

  if (input.dryRun) {
    return queuePacket({ ...input, intent }, 'Dry run requested; no external mutation executed.');
  }

  if (input.provider === 'github') {
    return handleGitHubWorkflowBridge(input.payload as GitHubWorkflowBridgeRequest);
  }

  if (input.provider === 'vercel') {
    return triggerVercelRedeploy(input.payload as VercelRedeployRequest);
  }

  if (input.provider === 'supabase') {
    return handleSupabase({ ...input, intent });
  }

  if (input.provider === 'drive' || input.provider === 'shopify' || input.provider === 'heygen') {
    return queuePacket({ ...input, intent });
  }

  return block(input, 'Unsupported provider.');
}

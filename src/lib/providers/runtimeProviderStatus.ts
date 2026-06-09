export type RuntimeProviderReadiness = {
  provider: string;
  ready: boolean;
  requiredEnv: string[];
  configuredEnv: Record<string, boolean>;
  notes: string;
};

function envPresent(name: string) {
  return Boolean(process.env[name]);
}

function readiness(provider: string, requiredEnv: string[], notes: string): RuntimeProviderReadiness {
  const configuredEnv = Object.fromEntries(requiredEnv.map((name) => [name, envPresent(name)]));
  return {
    provider,
    ready: requiredEnv.every(envPresent),
    requiredEnv,
    configuredEnv,
    notes
  };
}

function anyOfReadiness(provider: string, groups: string[][], notes: string): RuntimeProviderReadiness {
  const requiredEnv = groups.map((group) => group.join(" or "));
  const names = [...new Set(groups.flat())];
  const configuredEnv = Object.fromEntries(names.map((name) => [name, envPresent(name)]));
  return {
    provider,
    ready: groups.every((group) => group.some(envPresent)),
    requiredEnv,
    configuredEnv,
    notes
  };
}

function edenUniversalRuntimeReadiness(): RuntimeProviderReadiness {
  const configuredEnv = {
    EDEN_RUNTIME_BRIDGE_TOKEN: envPresent('EDEN_RUNTIME_BRIDGE_TOKEN'),
    GITHUB_WORKFLOW_TOKEN: envPresent('GITHUB_WORKFLOW_TOKEN'),
    GITHUB_TOKEN: envPresent('GITHUB_TOKEN'),
    VERCEL_TOKEN: envPresent('VERCEL_TOKEN'),
    SUPABASE_SERVICE_ROLE_KEY: envPresent('SUPABASE_SERVICE_ROLE_KEY'),
    GOOGLE_CLIENT_EMAIL: envPresent('GOOGLE_CLIENT_EMAIL'),
    GOOGLE_PRIVATE_KEY: envPresent('GOOGLE_PRIVATE_KEY'),
    SHOPIFY_ADMIN_TOKEN: envPresent('SHOPIFY_ADMIN_TOKEN'),
    SHOPIFY_SHOP: envPresent('SHOPIFY_SHOP'),
    SHOPIFY_STORE_DOMAIN: envPresent('SHOPIFY_STORE_DOMAIN'),
    HEYGEN_API_KEY: envPresent('HEYGEN_API_KEY')
  };

  return {
    provider: 'eden_universal_runtime',
    ready: configuredEnv.EDEN_RUNTIME_BRIDGE_TOKEN && (configuredEnv.GITHUB_WORKFLOW_TOKEN || configuredEnv.GITHUB_TOKEN || configuredEnv.VERCEL_TOKEN || configuredEnv.SUPABASE_SERVICE_ROLE_KEY),
    requiredEnv: ['EDEN_RUNTIME_BRIDGE_TOKEN', 'provider-specific env for GitHub, Vercel, Supabase, Drive, Shopify, or HeyGen'],
    configuredEnv,
    notes: 'Single governed route for Eden GPT runtimes to read, queue, write, and execute across provider bridges. External writes require bearer auth and approval phrase.'
  };
}

function githubWorkflowReadiness(): RuntimeProviderReadiness {
  const configuredEnv = {
    GITHUB_WORKFLOW_TOKEN: envPresent('GITHUB_WORKFLOW_TOKEN'),
    GITHUB_TOKEN: envPresent('GITHUB_TOKEN')
  };

  return {
    provider: 'github_workflows',
    ready: configuredEnv.GITHUB_WORKFLOW_TOKEN || configuredEnv.GITHUB_TOKEN,
    requiredEnv: ['GITHUB_WORKFLOW_TOKEN or GITHUB_TOKEN'],
    configuredEnv,
    notes: 'Required for GPT to list workflow runs, read jobs/logs, and dispatch workflow_dispatch runs through the governed GitHub workflow bridge.'
  };
}

function edenVercelReadiness(): RuntimeProviderReadiness {
  const configuredEnv = {
    VERCEL_TOKEN: envPresent('VERCEL_TOKEN'),
    EDEN_SKYE_VERCEL_PROJECT_ID: envPresent('EDEN_SKYE_VERCEL_PROJECT_ID'),
    TARGET_VERCEL_PROJECT_ID: envPresent('TARGET_VERCEL_PROJECT_ID'),
    VERCEL_TEAM_ID: envPresent('VERCEL_TEAM_ID')
  };

  return {
    provider: 'vercel_eden_preview',
    ready: configuredEnv.VERCEL_TOKEN && (configuredEnv.EDEN_SKYE_VERCEL_PROJECT_ID || configuredEnv.TARGET_VERCEL_PROJECT_ID),
    requiredEnv: ['VERCEL_TOKEN', 'EDEN_SKYE_VERCEL_PROJECT_ID or TARGET_VERCEL_PROJECT_ID'],
    configuredEnv,
    notes: 'Required for Auto Builder to trigger Eden Skye Studios preview deployments. Production deploys remain approval-gated.'
  };
}

function autoBuilderRedeployReadiness(): RuntimeProviderReadiness {
  const configuredEnv = {
    VERCEL_TOKEN: envPresent('VERCEL_TOKEN'),
    AUTO_BUILDER_VERCEL_PROJECT_ID: envPresent('AUTO_BUILDER_VERCEL_PROJECT_ID'),
    VERCEL_PROJECT_ID: envPresent('VERCEL_PROJECT_ID'),
    VERCEL_TEAM_ID: envPresent('VERCEL_TEAM_ID')
  };

  return {
    provider: 'vercel_auto_builder_redeploy',
    ready: configuredEnv.VERCEL_TOKEN && (configuredEnv.AUTO_BUILDER_VERCEL_PROJECT_ID || configuredEnv.VERCEL_PROJECT_ID),
    requiredEnv: ['VERCEL_TOKEN', 'AUTO_BUILDER_VERCEL_PROJECT_ID or VERCEL_PROJECT_ID'],
    configuredEnv,
    notes: 'Required for Auto Builder to redeploy itself through the governed cloud bridge. Preview is default; production requires explicit approval phrase.'
  };
}

function metricoolReadiness(): RuntimeProviderReadiness {
  return anyOfReadiness(
    'metricool',
    [
      ['METRICOOL_API_URL', 'METRICOOL_BASE_URL'],
      ['METRICOOL_API_TOKEN', 'METRICOOL_API_KEY', 'METRICOOL_TOKEN']
    ],
    'Required for Metricool draft scheduling and analytics. Supports existing Vercel env aliases for API URL/base URL and token/API key.'
  );
}

function xylaShopifyReadiness(): RuntimeProviderReadiness {
  return anyOfReadiness(
    'xyla_shopify_bridge',
    [
      ['SHOPIFY_ADMIN_TOKEN'],
      ['SHOPIFY_SHOP', 'SHOPIFY_STORE_DOMAIN'],
      ['SHOPIFY_XYLA_ENABLED', 'EDEN_CLOSET_SHOPIFY_ENABLED']
    ],
    'Xyla is treated as a Shopify-operated storefront/content bridge. It can create draft Shopify records, collections, metafields, and feed packets only when explicitly enabled; no separate Xyla MCP is required.'
  );
}

export function getRuntimeProviderStatus() {
  const providers = [
    anyOfReadiness('bridge_event_bus', [['BRIDGE_SECRET', 'AUTO_BUILDER_BRIDGE_TOKEN', 'ADMIN_API_TOKEN', 'BRIDGE_API_KEY'], ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'], ['SUPABASE_SERVICE_ROLE_KEY']], 'Required for HMAC/bearer event bus writes, registry, retry, and receipts.'),
    readiness('supabase', ['SUPABASE_SERVICE_ROLE_KEY'], 'Uses SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL plus service role through telemetry-store.'),
    edenUniversalRuntimeReadiness(),
    githubWorkflowReadiness(),
    edenVercelReadiness(),
    autoBuilderRedeployReadiness(),
    readiness('google_chat', ['GOOGLE_CHAT_WEBHOOK_URL'], 'Draft route works without sending; live send also requires GOOGLE_CHAT_SEND_ENABLED=true and approval.'),
    readiness('ai_gateway', ['AI_GATEWAY_API_KEY'], 'Required for AI Gateway model routing, budget caps, fallback, and cost receipts.'),
    readiness('n8n', ['N8N_WEBHOOK_URL', 'N8N_API_KEY'], 'Optional for later n8n webhook replay and external workflow routing. Eden website/social loop does not depend on n8n readiness.'),
    metricoolReadiness(),
    readiness('heygen', ['HEYGEN_API_KEY'], 'Required for HeyGen avatar/video draft generation.'),
    xylaShopifyReadiness(),
    readiness('meta_facebook', ['META_ACCESS_TOKEN', 'META_FACEBOOK_PAGE_ID'], 'Required for direct Meta Facebook Graph API writes. Metricool remains the preferred scheduling bridge when direct Meta is absent.'),
    readiness('instagram', ['META_ACCESS_TOKEN', 'META_INSTAGRAM_BUSINESS_ACCOUNT_ID'], 'Required for direct Instagram Graph API writes. Metricool remains the preferred scheduling bridge when direct Instagram is absent.'),
    readiness('google_workspace', ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY'], 'Required for server-side Google Workspace writes from Vercel.'),
    readiness('notion', ['NOTION_API_KEY'], 'Required for server-side Notion writes.'),
    readiness('klaviyo', ['KLAVIYO_API_KEY'], 'Required for Klaviyo draft/campaign API actions.'),
    readiness('xyla', ['XYLA_API_KEY'], 'Optional direct Xyla provider path. If absent, Eden uses the Shopify-operated Xyla bridge and Metricool-first scheduling.'),
    readiness('opus', ['OPUS_API_KEY'], 'Optional repurposing provider; not required for Eden website/social loop.')
  ];

  return {
    ok: true,
    secretsExposed: false,
    providers,
    readyProviders: providers.filter((provider) => provider.ready).map((provider) => provider.provider),
    checkedAt: new Date().toISOString()
  };
}

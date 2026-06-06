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

export function getRuntimeProviderStatus() {
  const providers = [
    readiness('supabase', ['SUPABASE_SERVICE_ROLE_KEY'], 'Uses SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL plus service role through telemetry-store.'),
    githubWorkflowReadiness(),
    edenVercelReadiness(),
    autoBuilderRedeployReadiness(),
    readiness('metricool', ['METRICOOL_API_URL', 'METRICOOL_API_TOKEN'], 'Required for Metricool Facebook and Instagram draft/write bridge.'),
    readiness('meta_facebook', ['META_ACCESS_TOKEN', 'META_FACEBOOK_PAGE_ID'], 'Required for direct Meta Facebook Graph API writes.'),
    readiness('instagram', ['META_ACCESS_TOKEN', 'META_INSTAGRAM_BUSINESS_ACCOUNT_ID'], 'Required for direct Instagram Graph API writes.'),
    readiness('google_workspace', ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY'], 'Required for server-side Google Workspace writes from Vercel.'),
    readiness('notion', ['NOTION_API_KEY'], 'Required for server-side Notion writes.'),
    readiness('klaviyo', ['KLAVIYO_API_KEY'], 'Required for Klaviyo draft/campaign API actions.'),
    readiness('xyla', ['XYLA_API_KEY'], 'Required for Xyla provider actions.'),
    readiness('opus', ['OPUS_API_KEY'], 'Required for Opus provider actions.')
  ];

  return {
    ok: true,
    secretsExposed: false,
    providers,
    readyProviders: providers.filter((provider) => provider.ready).map((provider) => provider.provider),
    checkedAt: new Date().toISOString()
  };
}

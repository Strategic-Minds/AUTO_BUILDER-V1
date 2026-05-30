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

export function getRuntimeProviderStatus() {
  const providers = [
    readiness('supabase', ['SUPABASE_SERVICE_ROLE_KEY'], 'Uses SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL plus service role through telemetry-store.'),
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

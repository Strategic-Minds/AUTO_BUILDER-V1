import type { AutoBuilderProvider } from "./types";

const categories = [
  "read",
  "write",
  "create",
  "update",
  "move",
  "delete",
  "execute",
  "deploy",
  "publish",
  "sync",
  "validate",
  "monitor",
  "report",
  "rollback"
] as const;

function actions(providerId: string, category: string) {
  return [`${category}_${providerId}_status`, `${category}_${providerId}_resource`, `${category}_${providerId}_receipt`];
}

function provider(input: Partial<AutoBuilderProvider> & Pick<AutoBuilderProvider, "providerId" | "displayName" | "category" | "authType">): AutoBuilderProvider {
  const providerId = input.providerId;
  return {
    providerId,
    displayName: input.displayName,
    category: input.category,
    authType: input.authType,
    requiredSecrets: input.requiredSecrets ?? [],
    optionalSecrets: input.optionalSecrets ?? [],
    oauthScopes: input.oauthScopes ?? [],
    envBindings: input.envBindings ?? [],
    apiBaseUrl: input.apiBaseUrl,
    docsUrl: input.docsUrl,
    readActions: input.readActions ?? actions(providerId, "read"),
    writeActions: input.writeActions ?? actions(providerId, "write"),
    createActions: input.createActions ?? actions(providerId, "create"),
    updateActions: input.updateActions ?? actions(providerId, "update"),
    moveActions: input.moveActions ?? actions(providerId, "move"),
    deleteActions: input.deleteActions ?? actions(providerId, "delete"),
    executeActions: input.executeActions ?? actions(providerId, "execute"),
    deployActions: input.deployActions ?? actions(providerId, "deploy"),
    publishActions: input.publishActions ?? actions(providerId, "publish"),
    syncActions: input.syncActions ?? actions(providerId, "sync"),
    importActions: input.importActions ?? actions(providerId, "import"),
    exportActions: input.exportActions ?? actions(providerId, "export"),
    validationActions: input.validationActions ?? actions(providerId, "validate"),
    monitoringActions: input.monitoringActions ?? actions(providerId, "monitor"),
    reportingActions: input.reportingActions ?? actions(providerId, "report"),
    rollbackActions: input.rollbackActions ?? actions(providerId, "rollback"),
    browserFallbackAvailable: input.browserFallbackAvailable ?? true,
    apiSupportLevel: input.apiSupportLevel ?? "unknown",
    readiness: input.readiness ?? "planned",
    fallbackMode: input.fallbackMode ?? "Return capability metadata and receipt until provider auth is verified."
  };
}

export const providerRegistry: AutoBuilderProvider[] = [
  provider({ providerId: "github", displayName: "GitHub", category: "repo", authType: "api_key", requiredSecrets: ["GITHUB_TOKEN"], apiSupportLevel: "partial", readiness: "partial" }),
  provider({ providerId: "vercel", displayName: "Vercel", category: "hosting", authType: "api_key", requiredSecrets: ["VERCEL_TOKEN", "VERCEL_TEAM_ID"], apiSupportLevel: "partial", readiness: "planned" }),
  provider({ providerId: "shopify", displayName: "Shopify", category: "commerce", authType: "api_key", requiredSecrets: ["SHOPIFY_ADMIN_TOKEN", "SHOPIFY_SHOP"], apiSupportLevel: "partial", readiness: "planned" }),
  provider({ providerId: "google_workspace", displayName: "Google Workspace", category: "workspace", authType: "service_account", requiredSecrets: ["GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY"], apiSupportLevel: "partial" }),
  provider({ providerId: "google_cloud", displayName: "Google Cloud", category: "cloud", authType: "service_account", requiredSecrets: ["GOOGLE_CLOUD_PROJECT", "GOOGLE_APPLICATION_CREDENTIALS"], apiSupportLevel: "partial" }),
  provider({ providerId: "n8n", displayName: "n8n MCP", category: "cloud", authType: "api_key", requiredSecrets: ["N8N_MCP_ACCESS_TOKEN", "N8N_MCP_SERVER_URL"], optionalSecrets: ["N8N_WEBHOOK_URL", "N8N_BASE_URL"], envBindings: ["N8N_MCP_ACCESS_TOKEN", "N8N_MCP_SERVER_URL", "N8N_WEBHOOK_URL", "N8N_BASE_URL"], apiSupportLevel: "partial", readiness: "planned", executeActions: ["execute_n8n_mcp_tool", "trigger_n8n_webhook", "replay_n8n_execution"], readActions: ["read_n8n_workflows", "read_n8n_executions", "read_n8n_mcp_status"], validationActions: ["validate_n8n_connection"], syncActions: ["sync_n8n_receipts"], fallbackMode: "Use N8N_MCP_ACCESS_TOKEN from Vercel env. Do not store access token in repo." }),
  provider({ providerId: "heygen", displayName: "HeyGen", category: "creative", authType: "api_key", requiredSecrets: ["HEYGEN_API_KEY"] }),
  provider({ providerId: "hubspot", displayName: "HubSpot", category: "crm", authType: "api_key", requiredSecrets: ["HUBSPOT_ACCESS_TOKEN"] }),
  provider({ providerId: "higgsfield", displayName: "Higgsfield AI", category: "creative", authType: "api_key", requiredSecrets: ["HIGGSFIELD_API_KEY"] }),
  provider({ providerId: "metricool", displayName: "Metricool", category: "social", authType: "api_key", requiredSecrets: ["METRICOOL_API_TOKEN"] }),
  provider({ providerId: "xyla", displayName: "Xyla", category: "creative", authType: "api_key", requiredSecrets: ["XYLA_API_KEY"] }),
  provider({ providerId: "stripe", displayName: "Stripe", category: "payments", authType: "api_key", requiredSecrets: ["STRIPE_SECRET_KEY"] }),
  provider({ providerId: "semrush", displayName: "Semrush", category: "seo", authType: "api_key", requiredSecrets: ["SEMRUSH_API_KEY"] }),
  provider({ providerId: "supabase", displayName: "Supabase", category: "database", authType: "api_key", requiredSecrets: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] }),
  provider({ providerId: "openai_platform", displayName: "OpenAI Platform", category: "ai", authType: "api_key", requiredSecrets: ["OPENAI_API_KEY", "OPENAI_PROJECT_ID"], apiSupportLevel: "partial" }),
  provider({ providerId: "runway", displayName: "Runway", category: "media", authType: "api_key", requiredSecrets: ["RUNWAY_API_KEY"] }),
  provider({ providerId: "adobe_express", displayName: "Adobe Express", category: "design", authType: "oauth", requiredSecrets: ["ADOBE_EXPRESS_CLIENT_ID", "ADOBE_EXPRESS_CLIENT_SECRET"] }),
  provider({ providerId: "canva", displayName: "Canva", category: "design", authType: "oauth", requiredSecrets: ["CANVA_CLIENT_ID", "CANVA_CLIENT_SECRET"] }),
  provider({ providerId: "whatsapp", displayName: "WhatsApp", category: "messaging", authType: "api_key", requiredSecrets: ["WHATSAPP_BUSINESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"] }),
  ...["facebook", "instagram", "snapchat", "x", "linkedin", "tiktok", "youtube", "pinterest", "threads", "reddit"].map((id) =>
    provider({ providerId: id, displayName: id.toUpperCase(), category: "social", authType: "oauth", requiredSecrets: [`${id.toUpperCase()}_ACCESS_TOKEN`] })
  ),
  provider({ providerId: "edenskyestudios", displayName: "edenskyestudios.com", category: "website", authType: "manual", requiredSecrets: ["EDENSKYE_SITE_PROVIDER", "EDENSKYE_DEPLOYMENT_PROJECT_ID"] }),
  provider({ providerId: "autobuilderos", displayName: "autobuilderos.com", category: "website", authType: "manual", requiredSecrets: ["AUTOBUILDEROS_SITE_PROVIDER", "AUTOBUILDEROS_DEPLOYMENT_PROJECT_ID"] }),
  provider({ providerId: "browser", displayName: "Browser", category: "browser", authType: "browser", requiredSecrets: [] }),
  provider({ providerId: "playwright", displayName: "Playwright", category: "browser", authType: "manual", requiredSecrets: [] }),
  provider({ providerId: "universal_app", displayName: "Universal Future App", category: "future", authType: "manual", requiredSecrets: [], apiSupportLevel: "unknown" })
];

export const actionCategories = categories;

export function findProvider(providerId: string) {
  return providerRegistry.find((provider) => provider.providerId === providerId);
}

import type { AutoBuilderAction, AutoBuilderActionCategory } from "./types";
import { actionCategories, providerRegistry } from "./provider-registry";

const directActionNames = [
  "create_repository",
  "create_github_repository",
  "create_branch",
  "commit_files",
  "open_pull_request",
  "dispatch_github_workflow",
  "rerun_failed_github_workflow",
  "create_vercel_project",
  "create_vercel_website",
  "connect_github_repo_to_vercel",
  "trigger_vercel_build",
  "deploy_to_vercel_preview",
  "deploy_to_vercel_production",
  "rollback_vercel_deployment",
  "create_drive_folder",
  "create_drive_project_folder",
  "create_drive_project_folder_structure",
  "move_drive_file",
  "move_drive_folder",
  "move_drive_doc",
  "move_drive_sheet",
  "upload_drive_file",
  "upload_drive_image",
  "upload_drive_images",
  "create_drive_doc",
  "create_drive_sheet",
  "create_project_drive_structure",
  "create_shopify_site_project",
  "create_shopify_product_draft",
  "create_shopify_page_draft",
  "create_shopify_collection_draft",
  "create_shopify_theme_draft",
  "publish_shopify_item",
  "run_shopify_validation",
  "sync_shopify_catalog",
  "execute_n8n_mcp_tool",
  "trigger_n8n_webhook",
  "validate_n8n_connection",
  "create_hubspot_contact",
  "update_hubspot_deal",
  "create_stripe_product",
  "create_stripe_checkout_session",
  "run_semrush_audit",
  "create_supabase_project_record",
  "create_supabase_migration_draft",
  "run_supabase_validation",
  "create_openai_agent",
  "run_openai_response",
  "upload_openai_file",
  "create_vector_store",
  "generate_heygen_video",
  "generate_higgsfield_asset",
  "generate_runway_asset",
  "create_canva_design",
  "create_adobe_express_design",
  "schedule_metricool_post",
  "generate_xyla_asset",
  "send_whatsapp_message",
  "create_social_post_draft",
  "publish_social_post",
  "pull_social_analytics",
  "run_browser_task",
  "run_playwright_test",
  "capture_screenshot",
  "validate_website",
  "validate_api",
  "validate_deployment",
  "return_live_deployment_url"
];

export const universalActions: AutoBuilderAction[] = actionCategories.map((category) => ({
  name: `universal_${category}`,
  providerId: "universal_app",
  category: category as AutoBuilderActionCategory,
  description: `Universal ${category} action routed through provider registry and provider router.`,
  executionMode: "manual_receipt",
  requiredAuth: [],
  returnsReceipt: true
}));

function inferProviderId(name: string) {
  if (name.includes("drive")) return "google_workspace";
  if (name.includes("n8n")) return "n8n";
  if (name.includes("vercel")) return "vercel";
  if (name.includes("shopify")) return "shopify";
  if (name.includes("github") || name.includes("repository") || name.includes("branch") || name.includes("pull_request")) return "github";
  return "universal_app";
}

export const providerActions: AutoBuilderAction[] = providerRegistry.flatMap((provider) =>
  actionCategories.map((category) => ({
    name: `${category}_${provider.providerId}`,
    providerId: provider.providerId,
    category: category as AutoBuilderActionCategory,
    description: `${provider.displayName} ${category} capability surface.`,
    executionMode: provider.authType === "browser" ? "browser" : "manual_receipt",
    requiredAuth: provider.requiredSecrets,
    returnsReceipt: true
  }))
);

export const directActions: AutoBuilderAction[] = directActionNames.map((name) => {
  const providerId = inferProviderId(name);
  return {
    name,
    providerId,
    category: name.includes("validate") ? "validate" : name.includes("deploy") ? "deploy" : name.includes("publish") ? "publish" : name.includes("move") ? "move" : name.includes("upload") ? "create" : name.includes("create") ? "create" : name.includes("run") || name.includes("trigger") || name.includes("execute") ? "execute" : "operate",
    description: `Direct Auto Builder 2 action: ${name}`,
    executionMode: "manual_receipt",
    requiredAuth: providerRegistry.find((provider) => provider.providerId === providerId)?.requiredSecrets ?? [],
    returnsReceipt: true
  };
});

export const actionCatalog: AutoBuilderAction[] = [...universalActions, ...providerActions, ...directActions];

export function findAction(name: string) {
  return actionCatalog.find((action) => action.name === name);
}

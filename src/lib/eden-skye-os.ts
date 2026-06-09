import { createClient } from "@supabase/supabase-js";

export type EdenOperation = "discover" | "analyze" | "create" | "quarantine" | "approve" | "schedule" | "validate" | "heal" | "dispatch";
export type EdenGate = "autonomous" | "draft_only" | "owner_approval_required" | "locked";

export const edenOperations: EdenOperation[] = ["discover", "analyze", "create", "quarantine", "approve", "schedule", "validate", "heal", "dispatch"];

export const edenCohorts = [
  { key: "male_18_25", label: "18-25 male", target: 20 },
  { key: "female_18_25", label: "18-25 female", target: 20 },
  { key: "male_25_50", label: "25-50 male", target: 20 },
  { key: "female_25_50", label: "25-50 female", target: 20 },
  { key: "male_50_plus", label: "50+ male", target: 20 },
  { key: "female_50_plus", label: "50+ female", target: 20 },
  { key: "international", label: "international", target: 20 },
  { key: "faceless", label: "faceless", target: 20 }
] as const;

export const edenProtectedActions = [
  "live social publishing",
  "outbound comments/replies/DMs",
  "adult-content release",
  "payment or membership activation",
  "Shopify/Xyla product publication",
  "n8n dispatch",
  "credentialed browser action",
  "production Supabase migration"
] as const;

export const edenModules = [
  "model_registry",
  "media_library",
  "content_calendar",
  "publishing_queue",
  "engagement_desk",
  "approval_center",
  "quarantine",
  "sandbox",
  "taxonomy_index",
  "memory",
  "self_reflection",
  "ab_testing_lab",
  "agent_ops",
  "receipts",
  "website_admin_backend"
] as const;

export function gateForOperation(operation: EdenOperation): EdenGate {
  if (["discover", "analyze", "validate", "heal"].includes(operation)) return "autonomous";
  if (["create", "quarantine"].includes(operation)) return "draft_only";
  if (["approve", "schedule", "dispatch"].includes(operation)) return "owner_approval_required";
  return "locked";
}

export function buildModelRegistrySeed() {
  return edenCohorts.flatMap((cohort) =>
    Array.from({ length: cohort.target }, (_, index) => ({
      external_key: `${cohort.key}_${String(index + 1).padStart(2, "0")}`,
      display_name: `${cohort.label} account ${String(index + 1).padStart(2, "0")}`,
      cohort: cohort.key,
      age_band: cohort.label.includes("18-25") ? "18-25" : cohort.label.includes("50+") ? "50+" : "25+",
      persona: cohort.key === "faceless" ? "Faceless theme page with no identity claims." : "Draft digital creator/model profile pending media QA.",
      status: "draft",
      risk_class: cohort.key === "faceless" || cohort.key === "international" ? "medium" : "low",
      platform_targets: ["instagram", "tiktok", "facebook", "youtube_shorts", "pinterest"]
    }))
  );
}

export function buildQueueSeed() {
  return [
    { id: "discover-001", operation: "discover", lane: "trend_discovery", status: "queued", gate: "autonomous", target: "benchmarks and platform signals" },
    { id: "create-001", operation: "create", lane: "draft_content", status: "queued", gate: "draft_only", target: "captions, scripts, prompts, website copy" },
    { id: "media-001", operation: "create", lane: "media_library", status: "queued", gate: "draft_only", target: "image and video generation queues" },
    { id: "engage-001", operation: "create", lane: "engagement_desk", status: "queued", gate: "draft_only", target: "comment, reply, and message drafts" },
    { id: "approve-001", operation: "approve", lane: "approval_center", status: "blocked", gate: "owner_approval_required", target: "live actions" },
    { id: "validate-001", operation: "validate", lane: "agent_ops", status: "queued", gate: "autonomous", target: "five-minute health and receipts" }
  ];
}

export function buildEdenReceipt(operation: EdenOperation, payload: Record<string, unknown> = {}) {
  const gate = gateForOperation(operation);
  return {
    ok: true,
    system: "eden-skye-studios-auto-social-os",
    operation,
    gate,
    productionActionAllowed: false,
    timestamp: new Date().toISOString(),
    payload,
    protectedActions: edenProtectedActions,
    modules: edenModules,
    registryTarget: buildModelRegistrySeed().length,
    queue: buildQueueSeed(),
    nextActions: gate === "owner_approval_required"
      ? ["Create approval receipt before any external action.", "Keep item in draft/locked queue."]
      : ["Persist receipt if Supabase schema is applied.", "Advance next safe queue item."]
  };
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function persistEdenReceipt(receipt: ReturnType<typeof buildEdenReceipt>) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { mode: "memory_only", ok: true, reason: "Supabase env not configured" };
  const { error } = await supabase.from("eden_receipts").insert({
    action: receipt.operation,
    gate: receipt.gate,
    ok: receipt.ok,
    production_action_allowed: false,
    evidence: receipt
  });
  if (error) return { mode: "supabase", ok: false, reason: error.message };
  return { mode: "supabase", ok: true };
}

export function getConnectorReadiness() {
  const env = (name: string) => Boolean(process.env[name]);
  return [
    { connector: "supabase", ready: Boolean(getSupabaseAdmin()), required: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] },
    { connector: "vercel", ready: env("VERCEL_TOKEN"), required: ["VERCEL_TOKEN"] },
    { connector: "metricool", ready: env("METRICOOL_API_KEY"), required: ["METRICOOL_API_KEY"] },
    { connector: "shopify_xyla", ready: env("SHOPIFY_ADMIN_TOKEN") || env("XYLA_API_KEY"), required: ["SHOPIFY_ADMIN_TOKEN or XYLA_API_KEY"] },
    { connector: "heygen", ready: env("HEYGEN_API_KEY"), required: ["HEYGEN_API_KEY"] },
    { connector: "n8n", ready: env("N8N_API_KEY") && env("N8N_API_ROOT"), required: ["N8N_API_KEY", "N8N_API_ROOT"] }
  ];
}

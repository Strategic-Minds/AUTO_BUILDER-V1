import type { ReflectionEntry } from "./types";

export const autoSocialMemoryScopes = [
  "operator_rules",
  "source_truth",
  "model_registry",
  "media_library",
  "content_calendar",
  "engagement_queue",
  "connector_readiness",
  "approval_receipts",
  "experiment_results",
  "failure_reflections"
] as const;

export function buildMemorySeed() {
  return autoSocialMemoryScopes.map((scope) => ({
    scope,
    fact: `Initialize ${scope} memory for Eden Skye AUTO SOCIAL.`,
    confidence: "seed",
    source: "enterprise-build-packet",
    tags: ["eden-skye", "auto-social", "sandbox-first"]
  }));
}

export function summarizeReflection(entry: ReflectionEntry) {
  return {
    scope: entry.scope,
    findingCount: entry.findings.length,
    improvementCount: entry.improvements.length,
    rememberCount: entry.remember.length,
    status: entry.findings.length > 0 ? "reflection_recorded" : "reflection_empty"
  };
}

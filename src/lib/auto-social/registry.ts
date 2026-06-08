import type { AutoSocialModel, AutoSocialOperation, AutoSocialQueueItem, CohortKey } from "./types";

export const cohortTargets: Record<CohortKey, { label: string; targetAccounts: number; defaultAgeBand: string }> = {
  male_18_25: { label: "18-25 male", targetAccounts: 20, defaultAgeBand: "18-25" },
  female_18_25: { label: "18-25 female", targetAccounts: 20, defaultAgeBand: "18-25" },
  male_25_50: { label: "25-50 male", targetAccounts: 20, defaultAgeBand: "25-50" },
  female_25_50: { label: "25-50 female", targetAccounts: 20, defaultAgeBand: "25-50" },
  male_50_plus: { label: "50+ male", targetAccounts: 20, defaultAgeBand: "50+" },
  female_50_plus: { label: "50+ female", targetAccounts: 20, defaultAgeBand: "50+" },
  international: { label: "international", targetAccounts: 20, defaultAgeBand: "adult" },
  faceless: { label: "faceless", targetAccounts: 20, defaultAgeBand: "adult" }
};

export const modelRegistrySeed: AutoSocialModel[] = Object.entries(cohortTargets).map(([cohort, config], index) => ({
  id: `eden-${cohort}`,
  name: `Eden Skye ${config.label} cohort`,
  cohort: cohort as CohortKey,
  ageBand: config.defaultAgeBand,
  persona: "Draft-safe digital creator cohort pending source-image QA and operator approval.",
  platforms: ["instagram", "tiktok", "facebook", "youtube_shorts", "pinterest"],
  status: "draft",
  risk: index >= 6 ? "medium" : "low"
}));

export const autoSocialOperations: AutoSocialOperation[] = [
  "discover",
  "analyze",
  "create",
  "quarantine",
  "approve",
  "schedule",
  "validate",
  "heal",
  "n8n-approved-dispatch"
];

export const enterpriseModules = [
  "sandbox",
  "quarantine",
  "index",
  "taxonomy",
  "memory",
  "self_reflection",
  "media_library",
  "template_library",
  "scheduling",
  "ab_testing",
  "receipts"
] as const;

export function buildInitialQueue(): AutoSocialQueueItem[] {
  return [
    {
      id: "queue-discover-001",
      operation: "discover",
      lane: "trend-and-benchmark",
      target: "Eden Skye platform/source scan",
      status: "queued",
      gate: "read_only",
      risk: "low",
      receiptRequired: true,
      notes: "Read-only discovery can run without publishing."
    },
    {
      id: "queue-create-001",
      operation: "create",
      lane: "draft-content",
      target: "30-day captions, hooks, scripts, prompts",
      status: "queued",
      gate: "draft_only",
      risk: "medium",
      receiptRequired: true,
      notes: "No outbound or public action from draft generation."
    },
    {
      id: "queue-validate-001",
      operation: "validate",
      lane: "agent-validation",
      target: "registry, queue, approval gates, connector readiness",
      status: "queued",
      gate: "autonomous",
      risk: "low",
      receiptRequired: true,
      notes: "Validation returns evidence only."
    }
  ];
}

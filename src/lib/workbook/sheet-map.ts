import type { WorkbookSourceKey } from "@/lib/workbook/contract";

export type SyncDirection = "inbound" | "outbound" | "both";

export interface WorkbookSheetMapEntry {
  sourceKey: WorkbookSourceKey;
  sheetName: string;
  purpose: string;
  targetTables: string[];
  direction: SyncDirection;
  runtimeObjectType: string;
}

export const WORKBOOK_SHEET_MAP: WorkbookSheetMapEntry[] = [
  {
    sourceKey: "content_media_integrated",
    sheetName: "49_Avatar_Voice",
    purpose: "provider, consent, and safety policy",
    targetTables: ["provider_capability_rules"],
    direction: "inbound",
    runtimeObjectType: "provider_capability_rule",
  },
  {
    sourceKey: "content_media_integrated",
    sheetName: "50_Playwright_Agent",
    purpose: "sandbox/browser test profiles",
    targetTables: ["playwright_test_profiles"],
    direction: "inbound",
    runtimeObjectType: "playwright_test_profile",
  },
  {
    sourceKey: "content_media_integrated",
    sheetName: "51_Content_Workflow",
    purpose: "stage machine and workflow templates",
    targetTables: ["workflow_stage_templates"],
    direction: "inbound",
    runtimeObjectType: "workflow_stage_template",
  },
  {
    sourceKey: "content_media_integrated",
    sheetName: "52_Content_Governance",
    purpose: "publish and compliance rules",
    targetTables: ["governance_rules"],
    direction: "inbound",
    runtimeObjectType: "governance_rule",
  },
  {
    sourceKey: "content_media_integrated",
    sheetName: "53_Content_Task_Tags",
    purpose: "task and GitHub label taxonomy",
    targetTables: ["task_tag_map"],
    direction: "inbound",
    runtimeObjectType: "task_tag_rule",
  },
  {
    sourceKey: "content_media_integrated",
    sheetName: "54_Content_Prompts",
    purpose: "prompt registry",
    targetTables: ["prompt_registry"],
    direction: "inbound",
    runtimeObjectType: "prompt_definition",
  },
  {
    sourceKey: "content_media_integrated",
    sheetName: "55_Content_Simulations",
    purpose: "replay scenarios",
    targetTables: ["simulation_fixtures"],
    direction: "inbound",
    runtimeObjectType: "simulation_fixture",
  },
  {
    sourceKey: "content_media_integrated",
    sheetName: "56_Content_Validation",
    purpose: "validation and readiness rules",
    targetTables: ["validation_rules"],
    direction: "inbound",
    runtimeObjectType: "validation_rule",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "46_Recursive_Validation",
    purpose: "recursive validation pass results",
    targetTables: ["recursive_validation_runs"],
    direction: "both",
    runtimeObjectType: "recursive_validation_run",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "47_Social_Media_OS",
    purpose: "operating mix and cadence",
    targetTables: ["channel_strategy_profiles"],
    direction: "inbound",
    runtimeObjectType: "channel_strategy_profile",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "48_AI_Media_Generation",
    purpose: "media generation templates",
    targetTables: ["media_job_templates"],
    direction: "inbound",
    runtimeObjectType: "media_job_template",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "49_Avatar_Voice",
    purpose: "duplicate provider policy source",
    targetTables: ["provider_capability_rules"],
    direction: "inbound",
    runtimeObjectType: "provider_capability_rule",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "50_Playwright_Agent",
    purpose: "duplicate sandbox source",
    targetTables: ["playwright_test_profiles"],
    direction: "inbound",
    runtimeObjectType: "playwright_test_profile",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "51_Content_Workflow",
    purpose: "duplicate workflow source",
    targetTables: ["workflow_stage_templates"],
    direction: "inbound",
    runtimeObjectType: "workflow_stage_template",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "52_Content_Governance",
    purpose: "duplicate governance source",
    targetTables: ["governance_rules"],
    direction: "inbound",
    runtimeObjectType: "governance_rule",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "53_Content_Task_Tags",
    purpose: "duplicate taxonomy source",
    targetTables: ["task_tag_map"],
    direction: "inbound",
    runtimeObjectType: "task_tag_rule",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "54_Content_Prompts",
    purpose: "duplicate prompt source",
    targetTables: ["prompt_registry"],
    direction: "inbound",
    runtimeObjectType: "prompt_definition",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "55_Content_Simulations",
    purpose: "duplicate simulation source",
    targetTables: ["simulation_fixtures"],
    direction: "inbound",
    runtimeObjectType: "simulation_fixture",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "56_Content_Validation",
    purpose: "duplicate validation source",
    targetTables: ["validation_rules"],
    direction: "inbound",
    runtimeObjectType: "validation_rule",
  },
  {
    sourceKey: "benchmark_integrated",
    sheetName: "15_Analytics_Scorecard",
    purpose: "performance and optimization scorecard",
    targetTables: ["content_scorecards", "analytics_snapshots", "optimization_backlog"],
    direction: "both",
    runtimeObjectType: "analytics_scorecard",
  },
];

export function getSheetMapForSource(sourceKey: WorkbookSourceKey) {
  return WORKBOOK_SHEET_MAP.filter((entry) => entry.sourceKey === sourceKey);
}

export function getSheetMapEntry(sourceKey: WorkbookSourceKey, sheetName: string) {
  return WORKBOOK_SHEET_MAP.find(
    (entry) => entry.sourceKey === sourceKey && entry.sheetName === sheetName,
  );
}

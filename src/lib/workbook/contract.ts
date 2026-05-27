export const WORKBOOK_SYNC_VERSION = "2026-05-26.2";

export const WORKBOOK_SOURCE_KEYS = [
  "content_media_integrated",
  "benchmark_integrated",
] as const;

export type WorkbookSourceKey = (typeof WORKBOOK_SOURCE_KEYS)[number];

export const WORKBOOK_REGISTRY: Record<
  WorkbookSourceKey,
  {
    driveFileId: string;
    title: string;
    role: "content_media" | "benchmark";
  }
> = {
  content_media_integrated: {
    driveFileId: "1lSev0Af8YlONzbXa_-l9FMsnNv_94rgE",
    title: "SWF_Universal_AutoBuild_Workbook_OS_Content_Media_Integrated.xlsx",
    role: "content_media",
  },
  benchmark_integrated: {
    driveFileId: "1aF2ndVTNLFL8WbEuYWV6K-2GxmTU1wFc",
    title: "SWF_Universal_AutoBuild_Workbook_OS_Benchmark_Integrated.xlsx",
    role: "benchmark",
  },
};

export const REQUIRED_SYNC_COLUMNS = [
  "sync_source_key",
  "sheet_name",
  "sheet_row_key",
  "sheet_row_hash",
  "runtime_object_type",
  "runtime_object_id",
  "last_runtime_status",
  "last_runtime_error",
  "last_synced_at",
] as const;

export const GOVERNED_MUTATION_TYPES = [
  "shopify_product_mutation",
  "shopify_publish_mutation",
  "xyla_publish_mutation",
  "pricing_change",
  "ad_spend_change",
  "regulated_claim_publish",
  "refund_or_service_recovery",
  "production_deployment_change",
] as const;

export const DEFAULT_WRITEBACK_FIELDS = [
  "runtime_object_id",
  "last_runtime_status",
  "last_runtime_error",
  "last_synced_at",
  "approval_state",
  "blocker_state",
  "next_action",
] as const;

export const INBOUND_SYNC_ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_DRIVE_ACCESS_TOKEN",
] as const;

export function isWorkbookSourceKey(value: string): value is WorkbookSourceKey {
  return WORKBOOK_SOURCE_KEYS.includes(value as WorkbookSourceKey);
}

export function assertWorkbookSourceKey(value: string): WorkbookSourceKey {
  if (!isWorkbookSourceKey(value)) {
    throw new Error(`Unsupported workbook source key: ${value}`);
  }
  return value;
}

export function getWorkbookRegistryRow(sourceKey: WorkbookSourceKey) {
  return WORKBOOK_REGISTRY[sourceKey];
}

export function getRequiredMissingEnv(keys: readonly string[]) {
  return keys.filter((key) => !process.env[key]);
}

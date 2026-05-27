import { createHash } from "node:crypto";
import type { WorkbookSourceKey } from "@/lib/workbook/contract";
import type { WorkbookSheetMapEntry } from "@/lib/workbook/sheet-map";

export interface WorkbookRawRow {
  [key: string]: unknown;
}

export interface NormalizedWorkbookRow {
  source_key: WorkbookSourceKey;
  drive_file_id: string;
  sheet_name: string;
  sheet_row_key: string;
  sheet_row_hash: string;
  runtime_object_type: string;
  runtime_object_id: string | null;
  last_runtime_status: string | null;
  last_runtime_error: string | null;
  last_synced_at: string;
  row_index: number;
  payload: Record<string, unknown>;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function stableStringify(value: unknown) {
  return JSON.stringify(value, (_key, current) => {
    if (current && typeof current === "object" && !Array.isArray(current)) {
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(current).sort()) {
        sorted[key] = (current as Record<string, unknown>)[key];
      }
      return sorted;
    }
    return current;
  });
}

function buildFallbackRowKey(sheetName: string, rowIndex: number, row: WorkbookRawRow) {
  const preferredKeys = ["id", "key", "slug", "name", "title", "prompt_id", "rule_id"];
  for (const preferredKey of preferredKeys) {
    const value = row[preferredKey];
    if (typeof value === "string" && value.trim()) {
      return slugify(value);
    }
  }

  return `${slugify(sheetName)}_${rowIndex + 1}`;
}

export function normalizeWorkbookRows(args: {
  sourceKey: WorkbookSourceKey;
  driveFileId: string;
  sheet: WorkbookSheetMapEntry;
  rows: WorkbookRawRow[];
}): NormalizedWorkbookRow[] {
  const { sourceKey, driveFileId, sheet, rows } = args;

  return rows.map((row, index) => {
    const sheetRowKey =
      typeof row.sheet_row_key === "string" && row.sheet_row_key.trim()
        ? row.sheet_row_key.trim()
        : buildFallbackRowKey(sheet.sheetName, index, row);

    const payload = { ...row };
    const payloadJson = stableStringify(payload);
    const sheetRowHash = createHash("sha256").update(payloadJson).digest("hex");

    return {
      source_key: sourceKey,
      drive_file_id: driveFileId,
      sheet_name: sheet.sheetName,
      sheet_row_key: sheetRowKey,
      sheet_row_hash: sheetRowHash,
      runtime_object_type: sheet.runtimeObjectType,
      runtime_object_id:
        typeof row.runtime_object_id === "string" ? row.runtime_object_id : null,
      last_runtime_status:
        typeof row.last_runtime_status === "string" ? row.last_runtime_status : null,
      last_runtime_error:
        typeof row.last_runtime_error === "string" ? row.last_runtime_error : null,
      last_synced_at: new Date().toISOString(),
      row_index: index + 1,
      payload,
    };
  });
}

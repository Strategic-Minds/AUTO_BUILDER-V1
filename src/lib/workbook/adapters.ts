import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getWorkbookRegistryRow, REQUIRED_SYNC_COLUMNS, type WorkbookSourceKey } from "@/lib/workbook/contract";
import type { NormalizedWorkbookRow, WorkbookRawRow } from "@/lib/workbook/normalizer";
import type { WorkbookSheetMapEntry } from "@/lib/workbook/sheet-map";

let supabaseAdminClient: SupabaseClient | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    supabaseAdminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseAdminClient;
}

function getGoogleDriveAccessToken() {
  const token = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Missing GOOGLE_DRIVE_ACCESS_TOKEN");
  }
  return token;
}

async function googleSheetsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://sheets.googleapis.com/v4/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getGoogleDriveAccessToken()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T | { error?: { message?: string } }) : ({} as T);
  if (!response.ok) {
    const message =
      typeof data === "object" && data && "error" in data && data.error?.message
        ? data.error.message
        : `Google Sheets request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

function columnLetter(index: number) {
  let current = index + 1;
  let output = "";
  while (current > 0) {
    const remainder = (current - 1) % 26;
    output = String.fromCharCode(65 + remainder) + output;
    current = Math.floor((current - 1) / 26);
  }
  return output;
}

function cleanHeaderValue(value: string | undefined, index: number) {
  const trimmed = (value ?? "").trim();
  return trimmed || `column_${index + 1}`;
}

function serializeCellValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function parseMaybeJson(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return value;
    }
  }
  return value;
}

function pickText(row: Record<string, unknown>, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return fallback;
}

function pickNumber(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return null;
}

async function readSheetMatrix(fileId: string, sheetName: string) {
  const encodedRange = encodeURIComponent(`${sheetName}!1:2000`);
  const result = await googleSheetsFetch<{ values?: string[][] }>(
    `spreadsheets/${fileId}/values/${encodedRange}?majorDimension=ROWS`,
  );
  return result.values ?? [];
}

async function updateHeaderRow(fileId: string, sheetName: string, headers: string[]) {
  const encodedRange = encodeURIComponent(`${sheetName}!1:1`);
  await googleSheetsFetch(
    `spreadsheets/${fileId}/values/${encodedRange}?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ range: `${sheetName}!1:1`, majorDimension: "ROWS", values: [headers] }),
    },
  );
}

export async function readWorkbookSheetRows(args: {
  sourceKey: WorkbookSourceKey;
  driveFileId?: string;
  sheetName: string;
}): Promise<WorkbookRawRow[]> {
  const fileId = args.driveFileId ?? getWorkbookRegistryRow(args.sourceKey).driveFileId;
  const matrix = await readSheetMatrix(fileId, args.sheetName);
  if (matrix.length === 0) return [];

  const headers = matrix[0].map((value, index) => cleanHeaderValue(value, index));
  return matrix.slice(1).map((row) => {
    const objectRow: WorkbookRawRow = {};
    headers.forEach((header, index) => {
      objectRow[header] = parseMaybeJson(row[index] ?? "");
    });
    return objectRow;
  });
}

export async function writeWorkbookRowsByKey(args: {
  sourceKey: WorkbookSourceKey;
  driveFileId?: string;
  sheetName: string;
  rows: Array<{ sheet_row_key: string; values: Record<string, unknown> }>;
}) {
  const fileId = args.driveFileId ?? getWorkbookRegistryRow(args.sourceKey).driveFileId;
  const matrix = await readSheetMatrix(fileId, args.sheetName);
  const existingHeaders = matrix[0]?.map((value, index) => cleanHeaderValue(value, index)) ?? [];
  const dynamicHeaders = Array.from(
    new Set(args.rows.flatMap((row) => Object.keys(row.values))),
  );
  const headers = Array.from(new Set([...existingHeaders, ...REQUIRED_SYNC_COLUMNS, ...dynamicHeaders]));

  if (existingHeaders.length === 0 || headers.length !== existingHeaders.length) {
    await updateHeaderRow(fileId, args.sheetName, headers);
  }

  const currentRows = matrix.slice(1);
  const sheetRowKeyIndex = headers.indexOf("sheet_row_key");
  const existingByKey = new Map<string, { rowNumber: number; row: string[] }>();

  currentRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const key = row[sheetRowKeyIndex];
    if (key) {
      existingByKey.set(key, { rowNumber, row });
    }
  });

  const data: Array<{ range: string; values: string[][] }> = [];
  const appendRows: string[][] = [];

  for (const writebackRow of args.rows) {
    const values = headers.map((header) => {
      if (header === "sheet_row_key") return writebackRow.sheet_row_key;
      if (header === "sync_source_key") return args.sourceKey;
      return serializeCellValue(writebackRow.values[header]);
    });

    const existing = existingByKey.get(writebackRow.sheet_row_key);
    if (existing) {
      data.push({
        range: `${args.sheetName}!A${existing.rowNumber}:${columnLetter(headers.length - 1)}${existing.rowNumber}`,
        values: [values],
      });
    } else {
      appendRows.push(values);
    }
  }

  if (data.length > 0) {
    await googleSheetsFetch(`spreadsheets/${fileId}/values:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({ valueInputOption: "RAW", data }),
    });
  }

  if (appendRows.length > 0) {
    const encodedRange = encodeURIComponent(`${args.sheetName}!A:ZZ`);
    await googleSheetsFetch(`spreadsheets/${fileId}/values/${encodedRange}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
      method: "POST",
      body: JSON.stringify({ values: appendRows }),
    });
  }

  return { updated: data.length, appended: appendRows.length, headerCount: headers.length };
}

export async function recordSyncRunStart(args: {
  sourceKey: WorkbookSourceKey;
  driveFileId: string;
  runType: "inbound" | "outbound";
  requestedSheets: string[];
  forceRun?: boolean;
  actor?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workbook_sync_runs")
    .insert({
      source_key: args.sourceKey,
      drive_file_id: args.driveFileId,
      run_type: args.runType,
      requested_sheets: args.requestedSheets,
      force_run: args.forceRun ?? false,
      actor: args.actor ?? null,
      run_status: "running",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function recordSyncRunEnd(args: {
  runId: string;
  status: "completed" | "failed";
  summary: Record<string, unknown>;
  errorMessage?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("workbook_sync_runs")
    .update({
      run_status: args.status,
      summary: args.summary,
      error_message: args.errorMessage ?? null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", args.runId);
  if (error) throw error;
}

export async function upsertNormalizedRows(args: {
  sourceKey: WorkbookSourceKey;
  runId: string;
  rows: NormalizedWorkbookRow[];
}) {
  if (args.rows.length === 0) return { count: 0 };
  const supabase = getSupabaseAdmin();
  const payload = args.rows.map((row) => ({
    ...row,
    latest_inbound_run_id: args.runId,
  }));
  const { error } = await supabase
    .from("workbook_rows_normalized")
    .upsert(payload, { onConflict: "source_key,sheet_name,sheet_row_key" });
  if (error) throw error;

  await supabase
    .from("workbook_sync_sources")
    .update({ last_inbound_sync_at: new Date().toISOString() })
    .eq("source_key", args.sourceKey);

  return { count: args.rows.length };
}

function buildTargetRows(table: string, row: NormalizedWorkbookRow): Array<Record<string, unknown>> {
  const payload = row.payload;
  switch (table) {
    case "provider_capability_rules":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        provider_name: pickText(payload, ["provider_name", "provider", "platform"], "unknown"),
        capability_name: pickText(payload, ["capability_name", "capability", "feature"], row.sheet_row_key),
        consent_required: Boolean(payload.consent_required),
        policy_payload: payload,
        workbook_payload: payload,
      }];
    case "playwright_test_profiles":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        profile_slug: pickText(payload, ["profile_slug", "profile", "name", "title"], row.sheet_row_key),
        target_url: pickText(payload, ["target_url", "url"], ""),
        assertions: Array.isArray(payload.assertions) ? payload.assertions : [],
        workbook_payload: payload,
      }];
    case "workflow_stage_templates":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        workflow_slug: pickText(payload, ["workflow_slug", "workflow", "system"], row.sheet_row_key),
        stage_name: pickText(payload, ["stage_name", "stage", "name"], row.sheet_row_key),
        stage_order: pickNumber(payload, ["stage_order", "order", "sequence"]),
        stage_rules: payload,
        workbook_payload: payload,
      }];
    case "governance_rules":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        rule_slug: pickText(payload, ["rule_slug", "rule", "name"], row.sheet_row_key),
        rule_type: pickText(payload, ["rule_type", "type", "category"], "governance"),
        enforcement_level: pickText(payload, ["enforcement_level", "severity"], "hard"),
        condition_payload: payload,
        workbook_payload: payload,
      }];
    case "task_tag_map":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        task_tag: pickText(payload, ["task_tag", "tag", "name"], row.sheet_row_key),
        github_label: pickText(payload, ["github_label", "label"], ""),
        queue_tag: pickText(payload, ["queue_tag", "queue"], ""),
        workbook_payload: payload,
      }];
    case "prompt_registry":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        prompt_slug: pickText(payload, ["prompt_slug", "prompt_id", "name", "title"], row.sheet_row_key),
        prompt_title: pickText(payload, ["prompt_title", "title", "name"], row.sheet_row_key),
        prompt_body: pickText(payload, ["prompt_body", "prompt", "body", "text", "instruction"], row.sheet_row_key),
        prompt_role: pickText(payload, ["prompt_role", "role"], "system"),
        prompt_tags: Array.isArray(payload.prompt_tags) ? payload.prompt_tags : [],
        status: pickText(payload, ["status"], "active"),
        version_label: pickText(payload, ["version_label", "version"], "v1"),
        workbook_payload: payload,
      }];
    case "simulation_fixtures":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        fixture_slug: pickText(payload, ["fixture_slug", "name", "title"], row.sheet_row_key),
        fixture_type: pickText(payload, ["fixture_type", "type"], "simulation"),
        input_payload: payload,
        expected_payload: payload.expected_payload ?? {},
        workbook_payload: payload,
      }];
    case "validation_rules":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        rule_slug: pickText(payload, ["rule_slug", "rule", "name"], row.sheet_row_key),
        validator_type: pickText(payload, ["validator_type", "type"], "generic"),
        severity: pickText(payload, ["severity"], "medium"),
        condition_payload: payload,
        workbook_payload: payload,
      }];
    case "recursive_validation_runs":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        run_status: pickText(payload, ["run_status", "status"], "queued"),
        score: pickNumber(payload, ["score", "readiness_score"]),
        findings: Array.isArray(payload.findings) ? payload.findings : [],
        next_action: pickText(payload, ["next_action"], ""),
      }];
    case "channel_strategy_profiles":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        channel_name: pickText(payload, ["channel_name", "channel", "platform"], row.sheet_row_key),
        cadence_payload: payload,
        content_mix_payload: payload.content_mix_payload ?? payload,
        workbook_payload: payload,
      }];
    case "media_job_templates":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        template_slug: pickText(payload, ["template_slug", "name", "title"], row.sheet_row_key),
        template_type: pickText(payload, ["template_type", "type"], "media"),
        generation_payload: payload,
        workbook_payload: payload,
      }];
    case "content_scorecards":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        scorecard_key: pickText(payload, ["scorecard_key", "metric", "name", "title"], row.sheet_row_key),
        score_payload: payload,
        period_label: pickText(payload, ["period_label", "period"], "current"),
      }];
    case "analytics_snapshots":
      return [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        snapshot_type: pickText(payload, ["snapshot_type", "metric", "name"], "scorecard"),
        snapshot_payload: payload,
      }];
    case "optimization_backlog": {
      const recommendation = pickText(payload, ["recommendation", "next_action", "optimization"], "");
      return recommendation ? [{
        source_key: row.source_key,
        sheet_row_key: row.sheet_row_key,
        backlog_status: pickText(payload, ["backlog_status", "status"], "open"),
        priority: pickNumber(payload, ["priority", "score"]) ?? 100,
        recommendation,
        evidence_payload: payload,
      }] : [];
    }
    default:
      return [];
  }
}

export async function materializeWorkbookRows(args: {
  mapping: WorkbookSheetMapEntry;
  rows: NormalizedWorkbookRow[];
}) {
  const supabase = getSupabaseAdmin();
  const results: Record<string, number> = {};

  for (const table of args.mapping.targetTables) {
    const payload: Array<Record<string, unknown>> = args.rows.flatMap((row) => buildTargetRows(table, row));
    if (payload.length === 0) {
      results[table] = 0;
      continue;
    }

    const upsertableTables = new Set([
      "provider_capability_rules",
      "playwright_test_profiles",
      "workflow_stage_templates",
      "governance_rules",
      "task_tag_map",
      "prompt_registry",
      "simulation_fixtures",
      "validation_rules",
      "channel_strategy_profiles",
      "media_job_templates",
      "content_scorecards",
    ]);

    const builder = supabase.from(table as never);
    const response = upsertableTables.has(table)
      ? await builder.upsert(payload as never, { onConflict: "source_key,sheet_row_key" })
      : await builder.insert(payload as never);

    if (response.error) {
      throw response.error;
    }
    results[table] = payload.length;
  }

  return results;
}

export async function loadWritebackRows(args: {
  sourceKey: WorkbookSourceKey;
  sheetName: string;
  runtimeObjectType?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("workbook_rows_normalized")
    .select("sheet_row_key,runtime_object_id,last_runtime_status,last_runtime_error,last_synced_at")
    .eq("source_key", args.sourceKey)
    .eq("sheet_name", args.sheetName)
    .order("row_index", { ascending: true });

  if (args.runtimeObjectType) {
    query = query.eq("runtime_object_type", args.runtimeObjectType);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    sheet_row_key: row.sheet_row_key,
    values: {
      runtime_object_id: row.runtime_object_id,
      last_runtime_status: row.last_runtime_status,
      last_runtime_error: row.last_runtime_error,
      last_synced_at: row.last_synced_at,
    },
  }));
}

export async function loadScorecardWritebackRows(args: { sourceKey: WorkbookSourceKey }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("content_scorecards")
    .select("sheet_row_key,score_payload,period_label")
    .eq("source_key", args.sourceKey)
    .order("updated_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    sheet_row_key: row.sheet_row_key,
    values: {
      last_runtime_status: "scored",
      period_label: row.period_label,
      score_payload: row.score_payload,
      last_synced_at: new Date().toISOString(),
    },
  }));
}

export async function loadBlockerWritebackRows(args: { sourceKey: WorkbookSourceKey }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("blocker_log")
    .select("sheet_row_key,blocker_status,blocker_message,severity,updated_at")
    .eq("source_key", args.sourceKey)
    .order("updated_at", { ascending: false });
  if (error) throw error;

  const firstByKey = new Map<string, { blocker_status: string; blocker_message: string; severity: string; updated_at: string }>();
  for (const row of data ?? []) {
    if (!firstByKey.has(row.sheet_row_key)) {
      firstByKey.set(row.sheet_row_key, row as { blocker_status: string; blocker_message: string; severity: string; updated_at: string });
    }
  }

  return Array.from(firstByKey.entries()).map(([sheetRowKey, row]) => ({
    sheet_row_key: sheetRowKey,
    values: {
      blocker_state: row.blocker_status,
      last_runtime_error: row.blocker_message,
      severity: row.severity,
      last_synced_at: row.updated_at,
    },
  }));
}

export async function recordWritebackReceipt(args: {
  sourceKey: WorkbookSourceKey;
  driveFileId: string;
  sheetName: string;
  rowCount: number;
  writtenCount: number;
  actor?: string | null;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workbook_writeback_receipts")
    .insert({
      source_key: args.sourceKey,
      drive_file_id: args.driveFileId,
      sheet_name: args.sheetName,
      row_count: args.rowCount,
      written_count: args.writtenCount,
      actor: args.actor ?? null,
      request_payload: args.requestPayload ?? {},
      response_payload: args.responsePayload ?? {},
    })
    .select("id")
    .single();
  if (error) throw error;

  await supabase
    .from("workbook_sync_sources")
    .update({ last_outbound_sync_at: new Date().toISOString() })
    .eq("source_key", args.sourceKey);

  return data.id as string;
}

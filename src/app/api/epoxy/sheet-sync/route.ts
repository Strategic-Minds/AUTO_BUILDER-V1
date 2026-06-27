/**
 * Epoxy Competitor Intelligence — Google Sheet Sync Endpoint
 * Path: src/app/api/epoxy/sheet-sync/route.ts
 *
 * Accepts POST { receiptId, workbook, rows }
 * Requires x-epoxy-sheet-secret header
 * Writes to EPOXY_SHEET_ID (env var) via Google Sheets API
 * Upserts by row.key into named tabs: Queue, State Master, Competitor Master
 *
 * Risk: L3 (controlled external write — requires sheet secret auth)
 * Production mutation: YES — writes to Google Sheets
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SheetRow = {
  tab: string;
  operation: "upsert" | "append";
  key: string;
  values: Record<string, unknown>;
};

type SheetSyncRequest = {
  receiptId: string;
  workbook?: string;
  rows: SheetRow[];
};

const ALLOWED_TABS = new Set(["Queue", "State Master", "Competitor Master", "Failed Jobs", "Receipts"]);

function getSheetId(): string {
  return (
    process.env.GOOGLE_SHEET_ID_3 ??
    process.env.EPOXY_MASTER_SHEET_ID ??
    process.env.GOOGLE_SHEETS_EPOXY_ID ??
    ""
  );
}

function getSheetSecret(): string {
  return process.env.EPOXY_SHEET_SYNC_SECRET ?? "";
}

async function getGoogleAccessToken(): Promise<string | null> {
  // Use service account via env var if available
  const token = process.env.GOOGLE_ACCESS_TOKEN ?? process.env.GOOGLEDRIVE_ACCESS_TOKEN ?? "";
  if (token) return token;
  return null;
}

async function appendRowToSheet(
  token: string,
  sheetId: string,
  tab: string,
  values: Record<string, unknown>
): Promise<{ ok: boolean; error?: string; updatedRows?: number }> {
  const range = encodeURIComponent(`${tab}!A1`);
  const body = {
    values: [Object.values(values).map(v => v === null || v === undefined ? "" : String(v))]
  };

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json() as Record<string, unknown>;
    if (!res.ok) return { ok: false, error: JSON.stringify(data).slice(0, 300) };
    const updates = (data.updates as Record<string, unknown>) ?? {};
    return { ok: true, updatedRows: (updates.updatedRows as number) ?? 1 };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

async function upsertRowToSheet(
  token: string,
  sheetId: string,
  tab: string,
  key: string,
  values: Record<string, unknown>
): Promise<{ ok: boolean; error?: string; updatedRows?: number }> {
  // Sheets API: find the row by key (column A), update if found, append if not
  // For simplicity in Phase 1: read column A, find key, update or append
  const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab + "!A:A")}`;
  try {
    const readRes = await fetch(readUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const readData = await readRes.json() as { values?: string[][] };
    const rows = readData.values ?? [];
    const rowIndex = rows.findIndex(r => r[0] === key);

    if (rowIndex >= 0) {
      // Update existing row (1-indexed, skip header at row 1)
      const range = encodeURIComponent(`${tab}!A${rowIndex + 1}`);
      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=USER_ENTERED`;
      const updateBody = {
        values: [Object.values(values).map(v => v === null || v === undefined ? "" : String(v))]
      };
      const updateRes = await fetch(updateUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(updateBody)
      });
      const updateData = await updateRes.json() as Record<string, unknown>;
      if (!updateRes.ok) return { ok: false, error: JSON.stringify(updateData).slice(0, 300) };
      return { ok: true, updatedRows: 1 };
    } else {
      // Append new row
      return appendRowToSheet(token, sheetId, tab, values);
    }
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth check — require x-epoxy-sheet-secret
  const secret = request.headers.get("x-epoxy-sheet-secret") ?? "";
  const expected = getSheetSecret();

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "EPOXY_SHEET_SYNC_SECRET not configured" },
      { status: 503 }
    );
  }

  if (secret !== expected) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized — invalid x-epoxy-sheet-secret" },
      { status: 401 }
    );
  }

  const sheetId = getSheetId();
  if (!sheetId) {
    return NextResponse.json(
      { ok: false, error: "GOOGLE_SHEET_ID_3 not configured" },
      { status: 503 }
    );
  }

  let body: SheetSyncRequest;
  try {
    body = await request.json() as SheetSyncRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { receiptId, rows } = body;
  if (!receiptId || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { ok: false, error: "receiptId and rows[] are required" },
      { status: 400 }
    );
  }

  const token = await getGoogleAccessToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "No Google access token available" },
      { status: 503 }
    );
  }

  // Validate tabs
  const unknownTabs = rows.filter(r => !ALLOWED_TABS.has(r.tab)).map(r => r.tab);
  if (unknownTabs.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Unknown tab(s): ${unknownTabs.join(", ")}. Allowed: ${[...ALLOWED_TABS].join(", ")}` },
      { status: 400 }
    );
  }

  // Process rows
  const results: Array<{ tab: string; key: string; ok: boolean; error?: string }> = [];
  let totalWritten = 0;
  const tabsSeen = new Set<string>();

  for (const row of rows) {
    const result = row.operation === "upsert"
      ? await upsertRowToSheet(token, sheetId, row.tab, row.key, row.values)
      : await appendRowToSheet(token, sheetId, row.tab, row.values);

    results.push({ tab: row.tab, key: row.key, ok: result.ok, error: result.error });
    if (result.ok) { totalWritten++; tabsSeen.add(row.tab); }

    await new Promise(r => setTimeout(r, 100)); // rate limit: 10 req/s Sheets API
  }

  const ok = results.every(r => r.ok);

  return NextResponse.json({
    ok,
    receiptId,
    rowCount: totalWritten,
    tabs: [...tabsSeen],
    message: ok
      ? `Successfully synced ${totalWritten} row(s) across ${tabsSeen.size} tab(s).`
      : `Partial sync: ${totalWritten}/${rows.length} rows written. Check errors.`,
    errors: results.filter(r => !r.ok),
  });
}

// Health check
export async function GET(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    endpoint: "epoxy-sheet-sync",
    sheetConfigured: !!getSheetId(),
    secretConfigured: !!getSheetSecret(),
    allowedTabs: [...ALLOWED_TABS],
    note: "POST with x-epoxy-sheet-secret header and { receiptId, rows[] } body"
  });
}

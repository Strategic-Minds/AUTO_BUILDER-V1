import { NextRequest, NextResponse } from "next/server";
import { assertWorkbookSourceKey } from "@/lib/workbook/contract";
import { getSheetMapEntry } from "@/lib/workbook/sheet-map";
import { materializeWorkbookRows, readWorkbookSheetRows, recordSyncRunEnd, recordSyncRunStart, upsertNormalizedRows } from "@/lib/workbook/adapters";
import { normalizeWorkbookRows } from "@/lib/workbook/normalizer";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        sourceKey?: string;
        driveFileId?: string;
        sheetName?: string;
        actor?: string | null;
      }
    | null;

  if (!body?.sourceKey || !body?.sheetName) {
    return NextResponse.json({ ok: false, error: "sourceKey and sheetName are required" }, { status: 400 });
  }

  const sourceKey = assertWorkbookSourceKey(body.sourceKey);
  const sheet = getSheetMapEntry(sourceKey, body.sheetName);
  if (!sheet) {
    return NextResponse.json({ ok: false, error: "Sheet is not mapped for source" }, { status: 400 });
  }

  const driveFileId = body.driveFileId;
  const runId = await recordSyncRunStart({
    sourceKey,
    driveFileId: driveFileId ?? "default",
    runType: "inbound",
    requestedSheets: [sheet.sheetName],
    actor: body.actor ?? "api/workbook/sync/inbound/sheet",
  });

  const summary: Record<string, unknown> = { sourceKey, sheetName: sheet.sheetName };

  try {
    const rawRows = await readWorkbookSheetRows({ sourceKey, driveFileId, sheetName: sheet.sheetName });
    const normalizedRows = normalizeWorkbookRows({ sourceKey, driveFileId: driveFileId ?? "default", sheet, rows: rawRows });
    await upsertNormalizedRows({ sourceKey, runId, rows: normalizedRows });
    const materialized = await materializeWorkbookRows({ mapping: sheet, rows: normalizedRows });
    Object.assign(summary, { rowCount: rawRows.length, normalized: normalizedRows.length, materialized });
    await recordSyncRunEnd({ runId, status: "completed", summary });
    return NextResponse.json({ ok: true, runId, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sheet sync error";
    await recordSyncRunEnd({ runId, status: "failed", summary, errorMessage: message });
    return NextResponse.json({ ok: false, runId, error: message, summary }, { status: 500 });
  }
}

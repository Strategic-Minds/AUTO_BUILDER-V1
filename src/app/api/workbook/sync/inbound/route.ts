import { NextRequest, NextResponse } from "next/server";
import { assertWorkbookSourceKey, getRequiredMissingEnv, INBOUND_SYNC_ENV_KEYS, WORKBOOK_REGISTRY } from "@/lib/workbook/contract";
import { readWorkbookSheetRows, recordSyncRunEnd, recordSyncRunStart, upsertNormalizedRows, materializeWorkbookRows } from "@/lib/workbook/adapters";
import { normalizeWorkbookRows } from "@/lib/workbook/normalizer";
import { getSheetMapForSource } from "@/lib/workbook/sheet-map";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        sourceKey?: string;
        driveFileId?: string;
        sheets?: string[];
        force?: boolean;
        actor?: string | null;
      }
    | null;

  if (!body?.sourceKey) {
    return NextResponse.json({ ok: false, error: "sourceKey is required" }, { status: 400 });
  }

  const missingEnv = getRequiredMissingEnv(INBOUND_SYNC_ENV_KEYS);
  if (missingEnv.length > 0) {
    return NextResponse.json({ ok: false, error: `Missing environment variables: ${missingEnv.join(", ")}` }, { status: 500 });
  }

  const sourceKey = assertWorkbookSourceKey(body.sourceKey);
  const driveFileId = body.driveFileId ?? WORKBOOK_REGISTRY[sourceKey].driveFileId;
  const candidateSheets = getSheetMapForSource(sourceKey);
  const mappedSheets = body.sheets?.length
    ? candidateSheets.filter((entry) => body.sheets?.includes(entry.sheetName))
    : candidateSheets;

  const runId = await recordSyncRunStart({
    sourceKey,
    driveFileId,
    runType: "inbound",
    requestedSheets: mappedSheets.map((entry) => entry.sheetName),
    forceRun: body.force,
    actor: body.actor ?? "api/workbook/sync/inbound",
  });

  const summary: { sourceKey: string; driveFileId: string; perSheet: Array<Record<string, unknown>> } = {
    sourceKey,
    driveFileId,
    perSheet: [],
  };

  try {
    for (const sheet of mappedSheets) {
      const rawRows = await readWorkbookSheetRows({ sourceKey, driveFileId, sheetName: sheet.sheetName });
      const normalizedRows = normalizeWorkbookRows({ sourceKey, driveFileId, sheet, rows: rawRows });
      await upsertNormalizedRows({ sourceKey, runId, rows: normalizedRows });
      const materialized = await materializeWorkbookRows({ mapping: sheet, rows: normalizedRows });
      summary.perSheet.push({
        sheetName: sheet.sheetName,
        rowCount: rawRows.length,
        normalized: normalizedRows.length,
        materialized,
      });
    }

    await recordSyncRunEnd({ runId, status: "completed", summary });
    return NextResponse.json({ ok: true, runId, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown inbound sync error";
    await recordSyncRunEnd({ runId, status: "failed", summary, errorMessage: message });
    return NextResponse.json({ ok: false, runId, error: message, summary }, { status: 500 });
  }
}

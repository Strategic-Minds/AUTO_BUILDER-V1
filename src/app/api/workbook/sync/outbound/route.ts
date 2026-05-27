import { NextRequest, NextResponse } from "next/server";
import { assertWorkbookSourceKey, WORKBOOK_REGISTRY } from "@/lib/workbook/contract";
import { loadWritebackRows, recordSyncRunEnd, recordSyncRunStart, recordWritebackReceipt, writeWorkbookRowsByKey } from "@/lib/workbook/adapters";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        sourceKey?: string;
        driveFileId?: string;
        sheetName?: string;
        runtimeObjectType?: string | null;
        actor?: string | null;
      }
    | null;

  if (!body?.sourceKey || !body?.sheetName) {
    return NextResponse.json({ ok: false, error: "sourceKey and sheetName are required" }, { status: 400 });
  }

  const sourceKey = assertWorkbookSourceKey(body.sourceKey);
  const driveFileId = body.driveFileId ?? WORKBOOK_REGISTRY[sourceKey].driveFileId;
  const runId = await recordSyncRunStart({
    sourceKey,
    driveFileId,
    runType: "outbound",
    requestedSheets: [body.sheetName],
    actor: body.actor ?? "api/workbook/sync/outbound",
  });

  const summary: Record<string, unknown> = { sourceKey, driveFileId, sheetName: body.sheetName };

  try {
    const rows = await loadWritebackRows({
      sourceKey,
      sheetName: body.sheetName,
      runtimeObjectType: body.runtimeObjectType ?? null,
    });
    const writeResult = await writeWorkbookRowsByKey({
      sourceKey,
      driveFileId,
      sheetName: body.sheetName,
      rows,
    });
    const receiptId = await recordWritebackReceipt({
      sourceKey,
      driveFileId,
      sheetName: body.sheetName,
      rowCount: rows.length,
      writtenCount: writeResult.updated + writeResult.appended,
      actor: body.actor ?? "api/workbook/sync/outbound",
      requestPayload: body ?? {},
      responsePayload: writeResult,
    });

    Object.assign(summary, { rowCount: rows.length, writeResult, receiptId });
    await recordSyncRunEnd({ runId, status: "completed", summary });
    return NextResponse.json({ ok: true, runId, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown outbound sync error";
    await recordSyncRunEnd({ runId, status: "failed", summary, errorMessage: message });
    return NextResponse.json({ ok: false, runId, error: message, summary }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { assertWorkbookSourceKey, WORKBOOK_REGISTRY } from "@/lib/workbook/contract";
import { loadBlockerWritebackRows, recordSyncRunEnd, recordSyncRunStart, recordWritebackReceipt, writeWorkbookRowsByKey } from "@/lib/workbook/adapters";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        sourceKey?: string;
        driveFileId?: string;
        sheetName?: string;
        actor?: string | null;
      }
    | null;

  const sourceKey = assertWorkbookSourceKey(body?.sourceKey ?? "content_media_integrated");
  const driveFileId = body?.driveFileId ?? WORKBOOK_REGISTRY[sourceKey].driveFileId;
  const sheetName = body?.sheetName ?? "56_Content_Validation";

  const runId = await recordSyncRunStart({
    sourceKey,
    driveFileId,
    runType: "outbound",
    requestedSheets: [sheetName],
    actor: body?.actor ?? "api/workbook/sync/outbound/blockers",
  });

  const summary: Record<string, unknown> = { sourceKey, driveFileId, sheetName };

  try {
    const rows = await loadBlockerWritebackRows({ sourceKey });
    const writeResult = await writeWorkbookRowsByKey({ sourceKey, driveFileId, sheetName, rows });
    const receiptId = await recordWritebackReceipt({
      sourceKey,
      driveFileId,
      sheetName,
      rowCount: rows.length,
      writtenCount: writeResult.updated + writeResult.appended,
      actor: body?.actor ?? "api/workbook/sync/outbound/blockers",
      requestPayload: body ?? {},
      responsePayload: writeResult,
    });
    Object.assign(summary, { rowCount: rows.length, writeResult, receiptId });
    await recordSyncRunEnd({ runId, status: "completed", summary });
    return NextResponse.json({ ok: true, runId, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown blocker writeback error";
    await recordSyncRunEnd({ runId, status: "failed", summary, errorMessage: message });
    return NextResponse.json({ ok: false, runId, error: message, summary }, { status: 500 });
  }
}

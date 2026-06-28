import type { EpoxyRunMode, EpoxySheetRow } from "./types";

export type EpoxySheetSyncResult = {
  ok: boolean;
  mode: EpoxyRunMode;
  synced: boolean;
  rowCount?: number;
  tabs?: string[];
  error?: string;
};

export async function syncEpoxySheetRows(input: {
  dryRun: boolean;
  allowLiveWrites: boolean;
  receiptId: string;
  rows: EpoxySheetRow[];
}): Promise<EpoxySheetSyncResult> {
  const mode: EpoxyRunMode = input.dryRun ? "dry_run" : input.allowLiveWrites ? "live_gated" : "observe_only";

  const sheetSyncEnabled = process.env.EPOXY_SHEET_SYNC_ENABLED === "1";
  const webhookUrl = process.env.EPOXY_SHEET_SYNC_WEBHOOK_URL;
  const sheetSecret = process.env.EPOXY_SHEET_SYNC_SECRET;

  // Dry-run or sheet sync disabled — return mock result
  if (input.dryRun || !input.allowLiveWrites || !sheetSyncEnabled) {
    return {
      ok: true,
      mode,
      synced: false,
      rowCount: input.rows.length,
      tabs: [...new Set(input.rows.map(r => r.tab))],
      error: sheetSyncEnabled ? undefined : "EPOXY_SHEET_SYNC_ENABLED is not set to 1"
    };
  }

  // Live path — call the internal sheet sync endpoint
  const url = webhookUrl ?? `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://auto-builder-strategic-minds-advisory.vercel.app"}/api/epoxy/sheet-sync`;

  if (!sheetSecret) {
    return { ok: false, mode, synced: false, error: "EPOXY_SHEET_SYNC_SECRET not configured" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-epoxy-sheet-secret": sheetSecret
      },
      body: JSON.stringify({
        receiptId: input.receiptId,
        workbook: "Epoxy Competitor Intelligence Master Sheet",
        rows: input.rows
      }),
      signal: AbortSignal.timeout(15000)
    });

    const data = await res.json() as {
      ok: boolean;
      rowCount?: number;
      tabs?: string[];
      message?: string;
      error?: string;
    };

    return {
      ok: data.ok,
      mode,
      synced: data.ok,
      rowCount: data.rowCount,
      tabs: data.tabs,
      error: data.ok ? undefined : (data.error ?? data.message ?? "Sheet sync failed")
    };
  } catch (e) {
    return { ok: false, mode, synced: false, error: String(e) };
  }
}

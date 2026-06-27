import type { EpoxySheetRow, EpoxySheetSyncResult } from "./types";

type SheetWebhookResponse = {
  ok?: boolean;
  message?: string;
  receiptId?: string;
};

async function readJsonResponse(response: Response): Promise<SheetWebhookResponse> {
  try {
    const parsed = (await response.json()) as SheetWebhookResponse;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function syncEpoxySheetRows(input: {
  dryRun: boolean;
  allowLiveWrites: boolean;
  receiptId: string;
  rows: EpoxySheetRow[];
}): Promise<EpoxySheetSyncResult> {
  const sheetSyncEnabled = process.env.EPOXY_SHEET_SYNC_ENABLED === "1";
  const webhookUrl = process.env.EPOXY_SHEET_SYNC_WEBHOOK_URL;
  const webhookSecret = process.env.EPOXY_SHEET_SYNC_SECRET;

  if (input.dryRun) {
    return {
      attempted: false,
      ok: true,
      status: "dry_run",
      reason: "Dry-run mode prepared Google Sheet rows without writing them.",
      rowCount: input.rows.length,
      tabs: Array.from(new Set(input.rows.map((row) => row.tab)))
    };
  }

  if (!input.allowLiveWrites || !sheetSyncEnabled) {
    return {
      attempted: false,
      ok: true,
      status: "disabled",
      reason: "Sheet sync is disabled until release approval and EPOXY_SHEET_SYNC_ENABLED=1.",
      rowCount: input.rows.length,
      tabs: Array.from(new Set(input.rows.map((row) => row.tab)))
    };
  }

  if (!webhookUrl) {
    return {
      attempted: true,
      ok: false,
      status: "missing_env",
      reason: "Missing EPOXY_SHEET_SYNC_WEBHOOK_URL for Google Sheet sync.",
      rowCount: input.rows.length
    };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(webhookSecret ? { "x-epoxy-sheet-secret": webhookSecret } : {})
    },
    body: JSON.stringify({
      receiptId: input.receiptId,
      workbook: "Epoxy Competitor Intelligence Master Sheet",
      rows: input.rows
    })
  });

  const responseJson = await readJsonResponse(response);
  if (!response.ok) {
    return {
      attempted: true,
      ok: false,
      status: "failed",
      reason: responseJson.message ?? `Sheet sync webhook failed with HTTP ${response.status}.`,
      rowCount: input.rows.length,
      webhookStatus: response.status
    };
  }

  return {
    attempted: true,
    ok: responseJson.ok ?? true,
    status: "persisted",
    reason: responseJson.message ?? "Sheet sync webhook accepted epoxy intelligence rows.",
    rowCount: input.rows.length,
    tabs: Array.from(new Set(input.rows.map((row) => row.tab))),
    webhookStatus: response.status
  };
}

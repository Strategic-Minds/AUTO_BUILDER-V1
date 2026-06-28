import { createEpoxySupabaseClient } from "./supabase-adapter";
import type { EpoxyReceipt, EpoxyWriteResult } from "./types";

function messageFromUnknown(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "Unknown receipt persistence error.";
}

export async function writeEpoxyReceipt(input: {
  receipt: EpoxyReceipt;
  dryRun: boolean;
  allowLiveWrites: boolean;
}): Promise<EpoxyWriteResult> {
  if (input.dryRun) {
    return {
      attempted: false,
      ok: true,
      status: "dry_run",
      reason: "Dry-run mode built the receipt without persisting it."
    };
  }

  if (!input.allowLiveWrites) {
    return {
      attempted: false,
      ok: true,
      status: "disabled",
      reason: "Receipt persistence is disabled until release approval and persistence enablement."
    };
  }

  const client = createEpoxySupabaseClient();
  if (!client) {
    return {
      attempted: true,
      ok: false,
      status: "missing_env",
      reason: "Missing Supabase URL or service-role key for receipt persistence."
    };
  }

  try {
    const { error } = await client.from("epoxy_run_receipts").upsert(
      {
        receipt_key: input.receipt.receiptId,
        route: input.receipt.route,
        mode: input.receipt.mode,
        state_code: input.receipt.stateCode,
        production_action_allowed: input.receipt.productionActionAllowed,
        status: input.receipt.persistence.ok && input.receipt.sheetSync.ok ? "COMPLETE" : "PARTIAL",
        receipt_json: input.receipt
      },
      { onConflict: "receipt_key" }
    );

    if (error) {
      throw error;
    }

    return {
      attempted: true,
      ok: true,
      status: "persisted",
      reason: "Epoxy discover-engine receipt persisted.",
      tables: ["epoxy_run_receipts"],
      rowCount: 1
    };
  } catch (error) {
    const message = messageFromUnknown(error);
    return {
      attempted: true,
      ok: false,
      status: "failed",
      reason: message,
      tables: ["epoxy_run_receipts"],
      errors: [message]
    };
  }
}

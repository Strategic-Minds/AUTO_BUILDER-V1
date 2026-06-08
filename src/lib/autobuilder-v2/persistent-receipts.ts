import type { AutoBuilderReceipt } from "./types";

let receiptLedger: AutoBuilderReceipt[] = [];

export function savePersistentReceipt(receipt: AutoBuilderReceipt) {
  receiptLedger = [receipt, ...receiptLedger].slice(0, 500);
  return receipt;
}

export function listPersistentReceipts() {
  return {
    storageMode: "repo_scaffold",
    receipts: receiptLedger,
    note: "In-memory scaffold. Promote to Supabase or Drive persistence in deployed runtime."
  };
}

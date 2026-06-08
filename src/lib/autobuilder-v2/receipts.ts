import type { AutoBuilderReceipt } from "./types";

export function createReceipt(input: Omit<AutoBuilderReceipt, "receiptId" | "timestamp" | "blockers"> & { blockers?: string[] }): AutoBuilderReceipt {
  return {
    ...input,
    blockers: input.blockers ?? [],
    receiptId: `receipt_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
}

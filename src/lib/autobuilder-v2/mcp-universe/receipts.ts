import { createHash } from "crypto";
import { insertTelemetry } from "@/lib/telemetry-store";
import type { McpUniverseReceipt } from "./types";

export function hashInputs(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function createMcpUniverseReceipt(input: Omit<McpUniverseReceipt, "receiptId" | "timestamp" | "inputsHash"> & { inputs?: unknown }): McpUniverseReceipt {
  const timestamp = new Date().toISOString();
  return {
    receiptId: `mcp-${timestamp.replace(/[^0-9]/g, "")}-${input.mcpId}`,
    timestamp,
    mcpId: input.mcpId,
    category: input.category,
    action: input.action,
    autonomyLevel: input.autonomyLevel,
    riskClass: input.riskClass,
    approvalState: input.approvalState,
    target: input.target,
    inputsHash: hashInputs(input.inputs ?? { mcpId: input.mcpId, action: input.action, target: input.target }),
    resultSummary: input.resultSummary,
    validationStatus: input.validationStatus,
    rollbackRef: input.rollbackRef,
    nextAction: input.nextAction
  };
}

export async function recordMcpUniverseReceipt(receipt: McpUniverseReceipt) {
  const blocker = receipt.approvalState === "pending" || receipt.approvalState === "blocked" ? receipt.nextAction : null;

  try {
    const result = await insertTelemetry("runtime_telemetry_events", {
      worker: "auto-builder-mcp-universe",
      status: receipt.validationStatus === "failed" ? "failed" : "success",
      event_type: "mcp_universe_receipt",
      evidence: JSON.stringify({ receipt, blocker }),
      created_at: receipt.timestamp
    });

    return {
      ok: true,
      receipt,
      telemetry: result
    };
  } catch (error) {
    return {
      ok: false,
      receipt,
      telemetry: {
        mode: "dry_run",
        reason: error instanceof Error ? error.message : "Unknown telemetry error"
      }
    };
  }
}

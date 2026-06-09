import { NextRequest, NextResponse } from "next/server";
import { createMcpUniverseReceipt, recordMcpUniverseReceipt } from "@/lib/autobuilder-v2/mcp-universe/receipts";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    receiptContract: {
      receiptId: "string",
      timestamp: "ISO-8601 string",
      mcpId: "string",
      category: "operating layer or system",
      action: "string",
      autonomyLevel: "0 | 1 | 2 | 3 | 4 | 5",
      riskClass: "low | medium | high | critical",
      approvalState: "not_required | pending | approved | rejected | blocked",
      target: "string",
      inputsHash: "sha256",
      resultSummary: "string",
      validationStatus: "not_run | passed | failed | blocked",
      rollbackRef: "string | null",
      nextAction: "string"
    }
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const receipt = createMcpUniverseReceipt({
    mcpId: typeof payload.mcpId === "string" ? payload.mcpId : "manual-mcp-universe-receipt",
    category: "system",
    action: typeof payload.action === "string" ? payload.action : "manual_internal_receipt",
    autonomyLevel: 2,
    riskClass: "low",
    approvalState: "not_required",
    target: typeof payload.target === "string" ? payload.target : "/api/mcp-universe/receipts",
    resultSummary: typeof payload.resultSummary === "string" ? payload.resultSummary : "Manual internal MCP universe receipt recorded.",
    validationStatus: "not_run",
    rollbackRef: null,
    nextAction: "Review receipt and route any guarded action to approval queue.",
    inputs: payload
  });

  const result = await recordMcpUniverseReceipt(receipt);
  return NextResponse.json({
    ok: result.ok,
    productionActionAllowed: false,
    result
  });
}

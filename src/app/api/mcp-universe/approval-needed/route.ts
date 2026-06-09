import { NextResponse } from "next/server";
import { buildApprovalQueue, guardedProductionActions, neverAutonomousActions } from "@/lib/autobuilder-v2/mcp-universe/governance";
import { mcpUniverseRegistry } from "@/lib/autobuilder-v2/mcp-universe/registry";

export async function GET() {
  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    approvalQueue: buildApprovalQueue(mcpUniverseRegistry),
    guardedProductionActions,
    neverAutonomousActions,
    note: "This endpoint reports approval requirements only. It does not execute guarded actions."
  });
}

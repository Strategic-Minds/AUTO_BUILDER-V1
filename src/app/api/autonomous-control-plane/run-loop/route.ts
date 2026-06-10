import { NextResponse } from "next/server";
import { buildAutonomousDryRunReceipt } from "@/lib/autonomous-control-plane/state";
import { runMcpSelfOperatingLoop } from "@/lib/autobuilder-v2/mcp-universe/self-operating-loop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const controlPlaneReceipt = buildAutonomousDryRunReceipt();
  const mcpLoop = await runMcpSelfOperatingLoop();

  return NextResponse.json({
    ok: controlPlaneReceipt.ok && mcpLoop.ok,
    productionActionAllowed: false,
    controlPlaneReceipt,
    mcpLoop: {
      ok: mcpLoop.ok,
      runId: mcpLoop.runId,
      productionActionAllowed: mcpLoop.productionActionAllowed,
      stages: mcpLoop.stages,
      persistence: mcpLoop.persistence,
      browserValidation: mcpLoop.browserValidation,
      autoFix: mcpLoop.autoFix,
      optimization: mcpLoop.optimization
    },
    note: "Dry-run only. No production deploy, billing, schema mutation, external publishing, or connector mutation is executed."
  });
}

export const POST = GET;

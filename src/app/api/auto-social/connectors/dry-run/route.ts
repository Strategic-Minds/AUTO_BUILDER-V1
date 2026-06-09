import { NextResponse } from "next/server";
import { getAllConnectorDryRuns } from "@/lib/auto-social";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    connectors: getAllConnectorDryRuns(),
    receipt: {
      action: "connector-dry-run-readiness",
      ok: true,
      productionActionAllowed: false,
      evidence: ["readiness_check_only", "no_connector_mutation", "live_actions_locked"],
      timestamp: new Date().toISOString()
    }
  });
}

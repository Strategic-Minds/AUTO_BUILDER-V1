import { NextRequest, NextResponse } from "next/server";
import { verifySignedCronEvidenceRequest } from "@/lib/autobuilder-v2/mcp-universe/cron-evidence";
import { runMcpSelfOperatingLoop } from "@/lib/autobuilder-v2/mcp-universe/self-operating-loop";

export const runtime = "nodejs";

const target = "mcp-self-operating-loop" as const;

export async function GET(request: NextRequest) {
  const verification = verifySignedCronEvidenceRequest(request, target);
  if (!verification.ok) {
    return NextResponse.json(verification.body, { status: verification.status });
  }

  const result = await runMcpSelfOperatingLoop();

  return NextResponse.json({
    ok: result.ok,
    productionActionAllowed: false,
    evidenceMode: "signed_cron_dry_run",
    target,
    route: request.nextUrl.pathname,
    signatureVerified: true,
    signedAt: verification.signedAt,
    signatureDigest: verification.signatureDigest,
    resultSummary: "Signed dry-run evidence captured for the MCP self-operating loop cron path.",
    cronRouteUnderTest: "/api/cron/mcp-self-operating-loop",
    result
  });
}

import { NextRequest, NextResponse } from "next/server";
import { verifySignedCronEvidenceRequest } from "@/lib/autobuilder-v2/mcp-universe/cron-evidence";
import { runMcpUniversePulse } from "@/lib/autobuilder-v2/mcp-universe/pulse";

export const runtime = "nodejs";

const target = "auto-builder-mcp-pulse" as const;

export async function GET(request: NextRequest) {
  const verification = verifySignedCronEvidenceRequest(request, target);
  if (!verification.ok) {
    return NextResponse.json(verification.body, { status: verification.status });
  }

  const result = await runMcpUniversePulse();

  return NextResponse.json({
    ok: result.ok,
    productionActionAllowed: false,
    evidenceMode: "signed_cron_dry_run",
    target,
    route: request.nextUrl.pathname,
    signatureVerified: true,
    signedAt: verification.signedAt,
    signatureDigest: verification.signatureDigest,
    resultSummary: "Signed dry-run evidence captured for the MCP pulse cron path.",
    cronRouteUnderTest: "/api/cron/auto-builder-mcp-pulse",
    result
  });
}

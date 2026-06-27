import { NextRequest, NextResponse } from "next/server";
import { authorizeCronRequest } from "@/lib/cron-auth";
import { runEpoxyCompetitorQueue } from "@/lib/epoxy-discover-engine/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDryRun(request: NextRequest) {
  const dryRunParam = request.nextUrl.searchParams.get("dryRun");
  if (dryRunParam === null) {
    return process.env.EPOXY_DISCOVER_DRY_RUN_DEFAULT !== "0";
  }

  return dryRunParam !== "0";
}

function parseMaxCandidates(request: NextRequest) {
  const value = Number(request.nextUrl.searchParams.get("maxCandidates") ?? "10");
  if (!Number.isFinite(value) || value < 1) {
    return 10;
  }

  return Math.min(Math.floor(value), 50);
}

export async function GET(request: NextRequest) {
  const authorization = authorizeCronRequest(request);
  if (!authorization.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: authorization.reason,
        productionActionAllowed: false,
        authorization
      },
      { status: authorization.status }
    );
  }

  const result = await runEpoxyCompetitorQueue({
    dryRun: parseDryRun(request),
    state: request.nextUrl.searchParams.get("state"),
    source: "vercel-cron",
    requestId: request.headers.get("x-vercel-id") ?? request.headers.get("x-request-id") ?? undefined,
    maxCandidates: parseMaxCandidates(request)
  });

  return NextResponse.json({
    ...result,
    authorization
  });
}

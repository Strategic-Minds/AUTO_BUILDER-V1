import { NextRequest, NextResponse } from "next/server";
import { runEpoxyCompetitorQueue } from "@/lib/epoxy-discover-engine/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseMaxCandidates(request: NextRequest) {
  const value = Number(request.nextUrl.searchParams.get("maxCandidates") ?? "10");
  if (!Number.isFinite(value) || value < 1) {
    return 10;
  }

  return Math.min(Math.floor(value), 50);
}

export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json(
      {
        ok: false,
        error: "Preview dry-run route is disabled in production.",
        productionActionAllowed: false
      },
      { status: 404 }
    );
  }

  const result = await runEpoxyCompetitorQueue({
    dryRun: true,
    state: request.nextUrl.searchParams.get("state"),
    source: "preview-validation",
    requestId: request.headers.get("x-vercel-id") ?? request.headers.get("x-request-id") ?? undefined,
    maxCandidates: parseMaxCandidates(request)
  });

  return NextResponse.json({
    ...result,
    previewValidation: {
      ok: true,
      routeDisabledInProduction: true,
      forcedDryRun: true,
      productionActionAllowed: false
    }
  });
}

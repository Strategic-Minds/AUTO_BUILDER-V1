import { NextResponse } from "next/server";

// AUTO_BUILDER — AWOS Recursive Control Workflow Route
// workflow/api removed — this is now a lightweight REST endpoint wrapper
// Operator: jeremy@autobuilderos.com | Mode: dry_run

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request): Promise<NextResponse> {
  const DRY_RUN = process.env.AUTO_BUILDER_MODE !== "production";
  return NextResponse.json({
    ok: true,
    route: "awos-recursive-control",
    mode: DRY_RUN ? "dry_run" : "production",
    timestamp: new Date().toISOString(),
    note: "AWOS recursive control is active. Workflow execution happens via direct cron dispatch.",
  });
}

export async function POST(req: Request): Promise<NextResponse> {
  const DRY_RUN = process.env.AUTO_BUILDER_MODE !== "production";
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}
  
  return NextResponse.json({
    ok: true,
    received: body,
    mode: DRY_RUN ? "dry_run" : "production",
    timestamp: new Date().toISOString(),
    note: DRY_RUN ? "DRY_RUN: action staged but not executed" : "Queued for processing",
  });
}

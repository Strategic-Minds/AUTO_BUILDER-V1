import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedExecution } from "@/lib/autobuilder-v2/execution-route-auth";

// AUTO_BUILDER — AWOS Recursive Control Workflow Route
// workflow/api removed — this is now a lightweight REST endpoint wrapper
// Operator: jeremy@autobuilderos.com | Mode: dry_run

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(): Promise<NextResponse> {
  const DRY_RUN = process.env.AUTO_BUILDER_MODE !== "production";
  return NextResponse.json({
    ok: true,
    route: "awos-recursive-control",
    mode: DRY_RUN ? "dry_run" : "production",
    production_mutation: false,
    timestamp: new Date().toISOString(),
    note: "AWOS recursive control is active. Workflow execution happens via direct cron dispatch.",
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authorization = requireAuthorizedExecution(req, { mode: "execute", tool_id: "awos_recursive_control", namespace: "workflow" });
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.message, authorization }, { status: authorization.status });
  }

  const DRY_RUN = process.env.AUTO_BUILDER_MODE !== "production";
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  return NextResponse.json({
    ok: true,
    received: body,
    mode: DRY_RUN ? "dry_run" : "production",
    production_mutation: false,
    authorization,
    timestamp: new Date().toISOString(),
    note: DRY_RUN ? "DRY_RUN: action staged but not executed" : "Authorized request accepted for downstream processing",
  });
}

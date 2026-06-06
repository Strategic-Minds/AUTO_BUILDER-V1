import { NextRequest, NextResponse } from "next/server";
import { authorizeCronRequest } from "@/lib/cron-auth";
import { buildAutobuilderGeneratorPlan } from "@/lib/autobuilder/generator";
import { insertTelemetry } from "@/lib/telemetry-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authorization = authorizeCronRequest(request);
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.reason, mode: authorization.mode, acceptedHeaderNames: authorization.acceptedHeaderNames }, { status: authorization.status });
  }

  const plan = buildAutobuilderGeneratorPlan({ source: "vercel_cron" });
  const telemetry = await insertTelemetry("runtime_telemetry_events", {
    event_name: "autobuilder.generator.tick",
    source_system: "auto_builder",
    status: "success",
    payload: plan,
    created_at: plan.generatedAt
  });

  return NextResponse.json({
    ok: true,
    route: "/api/cron/autobuilder-generator",
    authorization,
    mutation: false,
    plan,
    telemetry
  }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const authorization = authorizeCronRequest(request);
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.reason, mode: authorization.mode, acceptedHeaderNames: authorization.acceptedHeaderNames }, { status: authorization.status });
  }

  const body = await request.json().catch(() => ({}));
  const plan = buildAutobuilderGeneratorPlan({ idea: body.idea, source: "manual_post", approvalState: body.approvalState });
  return NextResponse.json({ ok: true, mutation: false, authorization, plan }, { headers: { "cache-control": "no-store" } });
}

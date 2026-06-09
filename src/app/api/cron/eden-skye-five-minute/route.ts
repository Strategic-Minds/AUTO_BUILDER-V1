import { NextRequest, NextResponse } from "next/server";
import { runEdenWorkflowSupervisor } from "@/lib/eden-skye-workflows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET || process.env.CRON_API_TOKEN;
  if (!secret) return true;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return bearer === secret || request.headers.get("x-cron-token") === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const supervisor = await runEdenWorkflowSupervisor({ trigger: "vercel_cron_five_minute", simulateOnly: true });
  return NextResponse.json({
    ok: supervisor.ok,
    job: "eden-skye-five-minute",
    productionActionAllowed: false,
    timestamp: new Date().toISOString(),
    supervisor
  });
}

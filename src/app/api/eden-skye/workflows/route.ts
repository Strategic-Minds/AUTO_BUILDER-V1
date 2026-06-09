import { NextRequest, NextResponse } from "next/server";
import { getEdenWorkflowReadiness, runEdenWorkflowSupervisor } from "@/lib/eden-skye-workflows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await runEdenWorkflowSupervisor({ trigger: "api_get", simulateOnly: true });
  return NextResponse.json({ readiness: getEdenWorkflowReadiness(), result });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}));
  const result = await runEdenWorkflowSupervisor({
    trigger: "api_post",
    simulateOnly: payload.simulateOnly !== false,
    requestedBy: typeof payload.requestedBy === "string" ? payload.requestedBy : "api",
    payload: payload as Record<string, unknown>
  });
  return NextResponse.json({ readiness: getEdenWorkflowReadiness(), result });
}

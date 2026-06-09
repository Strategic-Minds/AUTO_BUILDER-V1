import { NextRequest, NextResponse } from "next/server";
import { edenChildWorkflowSpecs, runEdenChildWorkflow, type EdenWorkflowName } from "@/lib/eden-skye-workflows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ workflow: string }> };

async function resolveWorkflow(context: RouteContext): Promise<EdenWorkflowName | null> {
  const { workflow } = await context.params;
  return edenChildWorkflowSpecs.some((item) => item.name === workflow) ? (workflow as EdenWorkflowName) : null;
}

async function run(request: NextRequest, context: RouteContext) {
  const workflow = await resolveWorkflow(context);
  if (!workflow) return NextResponse.json({ ok: false, error: "Unknown Eden Skye workflow" }, { status: 404 });
  const payload = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const result = await runEdenChildWorkflow(workflow, {
    trigger: request.method === "POST" ? "api_post" : "api_get",
    workflow,
    simulateOnly: (payload as { simulateOnly?: boolean }).simulateOnly !== false,
    requestedBy: typeof (payload as { requestedBy?: unknown }).requestedBy === "string" ? String((payload as { requestedBy?: unknown }).requestedBy) : "api",
    payload: payload as Record<string, unknown>
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return run(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return run(request, context);
}

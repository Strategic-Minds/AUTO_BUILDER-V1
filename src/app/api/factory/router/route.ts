import { NextRequest, NextResponse } from "next/server";
import { classifyIdea } from "@/lib/factory";
import { buildFinanceSimulationPacket, isFinancialSimulationIdea } from "@/lib/finance-sim";
import { runExecutionWorker, type WorkerAction } from "@/lib/execution-worker";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    idea?: string;
    action?: string;
    approved?: boolean;
    token?: string;
    payload?: Record<string, unknown>;
  };

  if (body.action) {
    const result = await runExecutionWorker({
      action: body.action as WorkerAction,
      approved: body.approved,
      token: body.token,
      payload: body.payload
    });
    const statusCode = result.status === "blocked" ? 403 : result.status === "error" ? 500 : 200;
    return NextResponse.json(result, { status: statusCode });
  }

  const idea = body.idea?.trim();

  if (!idea) {
    return NextResponse.json({ error: "Missing idea or action" }, { status: 400 });
  }

  if (isFinancialSimulationIdea(idea)) {
    return NextResponse.json({
      status: "ok",
      idea,
      routing: buildFinanceSimulationPacket(idea).classification
    });
  }

  return NextResponse.json({
    status: "ok",
    idea,
    routing: classifyIdea(idea)
  });
}

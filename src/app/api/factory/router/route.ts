import { NextRequest, NextResponse } from "next/server";
import { classifyIdea } from "@/lib/factory";
import { buildFinanceSimulationPacket, isFinancialSimulationIdea } from "@/lib/finance-sim";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { idea?: string };
  const idea = body.idea?.trim();

  if (!idea) {
    return NextResponse.json({ error: "Missing idea" }, { status: 400 });
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

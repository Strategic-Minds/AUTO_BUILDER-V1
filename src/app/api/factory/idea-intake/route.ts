import { NextRequest, NextResponse } from "next/server";
import { buildPacketFromIdea, classifyIdea } from "@/lib/factory";
import { buildFinanceSimulationPacket, isFinancialSimulationIdea } from "@/lib/finance-sim";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    idea?: string;
    source?: string;
    user?: string;
  };

  const idea = body.idea?.trim();

  if (!idea) {
    return NextResponse.json({ error: "Missing idea" }, { status: 400 });
  }

  const finance = isFinancialSimulationIdea(idea);

  return NextResponse.json({
    status: "ok",
    intake: {
      source: body.source ?? "chat",
      user: body.user ?? "operator",
      idea
    },
    classification: finance ? buildFinanceSimulationPacket(idea).classification : classifyIdea(idea),
    starterBuildPacket: finance ? buildFinanceSimulationPacket(idea) : buildPacketFromIdea(idea)
  });
}

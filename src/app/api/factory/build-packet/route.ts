import { NextRequest, NextResponse } from "next/server";
import { buildPacketFromIdea } from "@/lib/factory";
import { buildFinanceSimulationPacket, isFinancialSimulationIdea } from "@/lib/finance-sim";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { idea?: string };
  const idea = body.idea?.trim();

  if (!idea) {
    return NextResponse.json({ error: "Missing idea" }, { status: 400 });
  }

  return NextResponse.json({
    status: "ok",
    buildPacket: isFinancialSimulationIdea(idea)
      ? buildFinanceSimulationPacket(idea)
      : buildPacketFromIdea(idea)
  });
}

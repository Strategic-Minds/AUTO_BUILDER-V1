import { NextRequest, NextResponse } from "next/server";
import { buildPacketFromIdea, classifyIdea } from "@/lib/factory";

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

  return NextResponse.json({
    status: "ok",
    intake: {
      source: body.source ?? "chat",
      user: body.user ?? "operator",
      idea
    },
    classification: classifyIdea(idea),
    starterBuildPacket: buildPacketFromIdea(idea)
  });
}

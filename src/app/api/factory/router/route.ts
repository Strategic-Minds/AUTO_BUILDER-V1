import { NextRequest, NextResponse } from "next/server";
import { classifyIdea } from "@/lib/factory";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { idea?: string };
  const idea = body.idea?.trim();

  if (!idea) {
    return NextResponse.json({ error: "Missing idea" }, { status: 400 });
  }

  return NextResponse.json({
    status: "ok",
    idea,
    routing: classifyIdea(idea)
  });
}

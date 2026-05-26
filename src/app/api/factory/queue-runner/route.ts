import { NextRequest, NextResponse } from "next/server";
import { runQueueJob } from "@/lib/queue-runner";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    queue?: string;
    payload?: Record<string, unknown>;
    attempts?: number;
  };

  if (!body.id || !body.queue) {
    return NextResponse.json({ error: "Missing id or queue" }, { status: 400 });
  }

  return NextResponse.json({
    status: "ok",
    result: runQueueJob({
      id: body.id,
      queue: body.queue,
      payload: body.payload ?? {},
      attempts: body.attempts ?? 0,
      status: "queued"
    })
  });
}

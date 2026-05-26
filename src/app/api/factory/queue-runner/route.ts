import { NextRequest, NextResponse } from "next/server";
import { runQueueJob } from "@/lib/queue-runner";

function parseBoolean(value: string | null) {
  return value === "true";
}

function buildPayload(searchParams: URLSearchParams) {
  return {
    connector: searchParams.get("connector") ?? undefined,
    uiSurface: searchParams.get("uiSurface") ?? undefined,
    summary: searchParams.get("summary") ?? undefined,
    riskClass: searchParams.get("riskClass") ?? undefined,
    templateMissing: parseBoolean(searchParams.get("templateMissing")),
    patchConflict: parseBoolean(searchParams.get("patchConflict")),
    connectorBlocked: parseBoolean(searchParams.get("connectorBlocked")),
    migrationFailed: parseBoolean(searchParams.get("migrationFailed")),
    previewFailed: parseBoolean(searchParams.get("previewFailed")),
    routeSmokeFailed: parseBoolean(searchParams.get("routeSmokeFailed")),
    blockerDetected: parseBoolean(searchParams.get("blockerDetected")),
    approvalRequired: parseBoolean(searchParams.get("approvalRequired")),
    evidence: searchParams.getAll("evidence")
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queue = searchParams.get("queue");

  if (!queue) {
    return NextResponse.json({
      status: "ok",
      system: "AUTO BUILDER queue runner",
      testMode: true,
      example: {
        queue: "vercel_preview_queue",
        connector: "Vercel",
        connectorBlocked: true,
        summary: "Preview deploy hit a blocked mutation surface."
      }
    });
  }

  return NextResponse.json({
    status: "ok",
    testMode: true,
    result: runQueueJob({
      id: searchParams.get("id") ?? "test-job",
      queue,
      payload: buildPayload(searchParams),
      attempts: Number(searchParams.get("attempts") ?? "0"),
      status: "queued"
    })
  });
}

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
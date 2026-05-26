import { NextRequest, NextResponse } from "next/server";
import { authorizeRuntimeIngest } from "@/lib/runtime-auth";
import { insertTelemetry } from "@/lib/telemetry-store";

export async function POST(request: NextRequest) {
  const auth = authorizeRuntimeIngest(request);

  if (!auth.ok) {
    return NextResponse.json({ status: "blocked", reason: auth.reason }, { status: auth.status });
  }

  const body = (await request.json().catch(() => ({}))) as {
    target?: string;
    sessionStatus?: string;
    screenshotRef?: string;
    blocker?: string;
  };

  const result = await insertTelemetry("playwright_sessions", {
    target: body.target ?? "unknown-target",
    status: body.sessionStatus ?? "running",
    screenshot_ref: body.screenshotRef ?? null,
    blocker: body.blocker ?? null,
    last_action_at: new Date().toISOString()
  });

  return NextResponse.json({
    status: result.ok ? "recorded" : "dry-run",
    result
  });
}

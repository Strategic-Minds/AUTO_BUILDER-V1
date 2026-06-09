import { NextRequest, NextResponse } from "next/server";
import { runMcpSelfOperatingLoop } from "@/lib/autobuilder-v2/mcp-universe/self-operating-loop";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_API_TOKEN;
  if (!expected) {
    return true;
  }

  const header = request.headers.get("x-cron-token") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runMcpSelfOperatingLoop();
  return NextResponse.json({
    ...result,
    workflowSubmission: "mcp-self-operating-loop-v1",
    allowedByDefault: [
      "run pulse",
      "build connector readiness inventory",
      "plan browser validation work",
      "plan auto-fix work",
      "consume optimization queue",
      "record internal receipt"
    ]
  });
}

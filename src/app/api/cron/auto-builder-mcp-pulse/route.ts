import { NextRequest, NextResponse } from "next/server";
import { runMcpUniversePulse } from "@/lib/autobuilder-v2/mcp-universe/pulse";

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

  const result = await runMcpUniversePulse();
  return NextResponse.json({
    ...result,
    allowedByDefault: [
      "read registry",
      "check provider readiness metadata",
      "check last receipts",
      "check stale failures",
      "check validation status",
      "check queue state",
      "check pending approvals",
      "check failed workflows",
      "check public uptime",
      "check build/deploy status",
      "check social draft queue",
      "check discovery queue",
      "check auto-heal candidates",
      "create internal receipt",
      "create internal task/recommendation"
    ],
    notAllowedWithoutApproval: [
      "production deploy",
      "send message",
      "publish post",
      "charge/refund",
      "edit live store",
      "write production DB",
      "change DNS",
      "rotate secrets",
      "delete/archive"
    ]
  });
}

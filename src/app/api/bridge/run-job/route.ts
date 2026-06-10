import { NextRequest, NextResponse } from "next/server";

import { requiresOperatorAuth, verifyExecutionRouteAuth } from "@/lib/autobuilder-v2/execution-route-auth";
import { runJob } from "@/lib/autobuilder-v2/execution-tools";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const input = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (requiresOperatorAuth(input)) {
    const auth = verifyExecutionRouteAuth(request);
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  return NextResponse.json(runJob(input as never));
}

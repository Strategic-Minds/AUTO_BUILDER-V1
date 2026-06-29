import { NextRequest, NextResponse } from "next/server";
import { resumeHook } from "workflow/api";

import { verifyExecutionRouteAuth } from "@/lib/autobuilder-v2/execution-route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = verifyExecutionRouteAuth(request);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const token = typeof body.token === "string" ? body.token : "";
  const approved = body.approved === true;
  const approvalPhrase = typeof body.approvalPhrase === "string" ? body.approvalPhrase : undefined;

  if (!token) {
    return NextResponse.json({ ok: false, error: "Approval hook token is required." }, { status: 400 });
  }

  if (approved && approvalPhrase !== "APPROVE PRODUCTION DEPLOY") {
    return NextResponse.json(
      { ok: false, error: "Production approval requires exact phrase: APPROVE PRODUCTION DEPLOY" },
      { status: 400 },
    );
  }

  await resumeHook(token, {
    approved,
    approvalPhrase,
    approvedBy: typeof body.approvedBy === "string" ? body.approvedBy : "operator",
    comment: typeof body.comment === "string" ? body.comment : undefined,
  });

  return NextResponse.json({
    ok: true,
    resumed: true,
    approved,
    nextActions: approved
      ? ["Workflow production approval hook resumed. Continue watching the run status and event stream."]
      : ["Workflow production approval hook resumed as rejected; no production deployment should occur."],
  });
}

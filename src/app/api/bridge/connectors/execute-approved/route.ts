import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const riskClass = Number(body.riskClass ?? body.risk_class ?? 2);
  const bridgeId = String(body.bridgeId || body.bridge_id || "unknown");
  const approvalId = String(body.approvalId || body.approval_id || request.headers.get("x-awos-approval-id") || "");
  const liveMutationEnabled = process.env.BRIDGE_LIVE_MUTATION_ENABLED === "true";
  const approved = approvalId.length > 0;

  if (riskClass >= 2 && !approved) {
    return NextResponse.json({
      status: "blocked",
      mutation: false,
      receipt: {
        kind: "receipt",
        bridgeId,
        operation: "execute_approved",
        riskClass,
        approvalState: "blocked",
        summary: "Unapproved Class 2+ action rejected."
      },
      nextAction: "Request explicit approval and attach approval_id before retry."
    }, { status: 403 });
  }

  if (!liveMutationEnabled) {
    return NextResponse.json({
      status: "blocked",
      mutation: false,
      receipt: {
        kind: "hard_gate",
        bridgeId,
        operation: "execute_approved",
        riskClass,
        approvalState: approved ? "approved" : "not_required",
        summary: "Approval may be present, but live connector mutation is disabled for preview safety."
      },
      nextAction: "Enable connector-specific live mutation only after dry-run and smoke receipts are clean."
    }, { status: 403 });
  }

  return NextResponse.json({
    status: "queued",
    mutation: false,
    receipt: {
      kind: "validation",
      bridgeId,
      operation: "execute_approved",
      riskClass,
      approvalState: approved ? "approved" : "not_required",
      summary: "Preview scaffold accepted the approved command but did not perform external mutation."
    }
  }, { status: 202 });
}

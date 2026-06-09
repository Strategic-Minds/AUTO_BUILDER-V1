import { NextRequest, NextResponse } from "next/server";
import { buildEdenReceipt, persistEdenReceipt } from "@/lib/eden-skye-os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApprovalAction = "image_linking" | "scheduling" | "dispatch" | "edens_closet";
type RouteContext = { params: Promise<{ action: string }> };

const approvalActions: Record<ApprovalAction, { title: string; target: string; blockedReason: string; protectedActions: string[] }> = {
  image_linking: {
    title: "Image asset linking approval request",
    target: "media_library",
    blockedReason: "Images must exist, pass QA, and be owner-approved before records can be linked for scheduling.",
    protectedActions: ["Drive write", "paid generation", "asset approval", "schedule readiness"]
  },
  scheduling: {
    title: "Metricool/Xyla scheduling approval request",
    target: "publishing_queue",
    blockedReason: "Draft posts can be prepared, but external scheduling requires approved assets, final copy, and owner approval.",
    protectedActions: ["Metricool schedule", "Xyla schedule", "social publish"]
  },
  dispatch: {
    title: "External dispatch approval request",
    target: "dispatch_approved",
    blockedReason: "No post, reply, message, commerce write, or automation dispatch can run without a specific approval receipt.",
    protectedActions: ["live publishing", "outbound replies", "DMs", "Shopify/Xyla writes", "n8n dispatch"]
  },
  edens_closet: {
    title: "Eden's Closet release approval request",
    target: "edens_closet",
    blockedReason: "Membership, payment, age-gated access, and adult-content release require compliance review and owner approval.",
    protectedActions: ["payment activation", "adult-content release", "member access activation"]
  }
};

async function resolveAction(context: RouteContext): Promise<ApprovalAction | null> {
  const { action } = await context.params;
  return action in approvalActions ? (action as ApprovalAction) : null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const action = await resolveAction(context);
  if (!action) return NextResponse.json({ ok: false, error: "Unknown approval action" }, { status: 404 });
  const config = approvalActions[action];

  return NextResponse.json({
    ok: true,
    action,
    ...config,
    approvalState: "blocked",
    productionActionAllowed: false,
    externalWritesAllowed: false,
    next: "POST to create a review receipt only. This route never performs the protected action."
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const action = await resolveAction(context);
  if (!action) return NextResponse.json({ ok: false, error: "Unknown approval action" }, { status: 404 });

  const payload = await request.json().catch(() => ({}));
  const config = approvalActions[action];
  const receipt = buildEdenReceipt("approve", {
    approvalAction: action,
    target: config.target,
    title: config.title,
    blockedReason: config.blockedReason,
    protectedActions: config.protectedActions,
    requestedBy: typeof payload.requestedBy === "string" ? payload.requestedBy : "api",
    payload,
    productionActionAllowed: false,
    externalWritesAllowed: false,
    actionExecuted: false
  });
  const persistence = await persistEdenReceipt(receipt);

  return NextResponse.json({
    ok: true,
    action,
    approvalState: "blocked_pending_owner_review",
    productionActionAllowed: false,
    externalWritesAllowed: false,
    actionExecuted: false,
    receipt,
    persistence,
    message: "Approval request receipt created. Protected action remains blocked."
  });
}

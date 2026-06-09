import { NextRequest, NextResponse } from "next/server";
import { buildEdenReceipt, persistEdenReceipt } from "@/lib/eden-skye-os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const closetPlan = {
  ok: true,
  system: "eden-skye-studios-auto-social-os",
  module: "edens_closet",
  productionActionAllowed: false,
  externalWritesAllowed: false,
  paymentActivationAllowed: false,
  adultContentReleaseAllowed: false,
  status: "locked_design",
  offer: {
    name: "Eden's Closet Black Card",
    state: "draft_locked",
    purpose: "Membership backend, access tiers, payment gate, age gate, and release queue for review before any activation.",
    tiers: ["waitlist", "black_card_draft", "founding_member_draft"],
    requiredBeforeLaunch: [
      "owner approval",
      "payment test evidence",
      "age-gate and access-control review",
      "content policy review",
      "rollback plan",
      "receipt trail"
    ]
  },
  protectedActions: [
    "payment activation",
    "adult-content release",
    "member access activation",
    "external commerce write",
    "production data mutation"
  ]
};

export async function GET() {
  return NextResponse.json(closetPlan);
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}));
  const receipt = buildEdenReceipt("approve", {
    module: "edens_closet",
    requestedAction: "locked_membership_review",
    requestedBy: typeof payload.requestedBy === "string" ? payload.requestedBy : "api",
    paymentActivationAllowed: false,
    adultContentReleaseAllowed: false,
    externalWritesAllowed: false,
    productionActionAllowed: false,
    payload
  });
  const persistence = await persistEdenReceipt(receipt);

  return NextResponse.json({
    ...closetPlan,
    receipt,
    persistence,
    message: "Eden's Closet remains locked. Receipt recorded for review only."
  });
}

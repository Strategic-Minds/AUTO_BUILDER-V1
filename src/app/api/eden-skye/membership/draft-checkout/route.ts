import { NextResponse } from "next/server";
import { getEdenSkyeWebsiteSocialLoopReadiness } from "@/lib/eden-skye/website-social-loop";

export const runtime = "nodejs";

export async function GET() {
  const readiness = getEdenSkyeWebsiteSocialLoopReadiness();

  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    surface: "edens_closet_black_card_membership",
    mode: "dry_run",
    readyForDraftPlanning: readiness.readiness.stripeOrShopifyPayments,
    readyForPaidMembershipActivation: false,
    noCheckoutCreated: true,
    noPaymentActivated: true,
    noAdultContentPublished: true,
    membershipDraft: {
      productName: "Eden's Closet Black Card",
      entitlementModel: ["age_gate_required", "member_account_required", "approval_gated_premium_library", "receipt_required_before_access"],
      draftTiers: ["Black Card Monthly", "Black Card Annual", "Founding Member"],
      compliancePrerequisites: [
        "18+ age gate",
        "terms of service",
        "privacy policy",
        "creator/model consent records",
        "payment processor policy review",
        "content safety taxonomy",
        "manual owner approval before activation"
      ],
      approvalRequiredFor: ["activate_checkout", "publish_membership_product", "release_adult_content", "send_member_message", "change_price"]
    },
    nextAction: "Build draft membership schema and frontend states first. Request explicit approval before activating checkout or releasing premium/adult content."
  });
}

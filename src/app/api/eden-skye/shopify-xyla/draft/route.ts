import { NextResponse } from "next/server";
import { getEdenSkyeWebsiteSocialLoopReadiness } from "@/lib/eden-skye/website-social-loop";

export const runtime = "nodejs";

export async function GET() {
  const readiness = getEdenSkyeWebsiteSocialLoopReadiness();

  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    provider: "shopify_xyla_bridge",
    mode: "dry_run",
    ready: readiness.readyForXylaViaShopifyDrafts,
    noShopifyMutationPerformed: true,
    noProductPublished: true,
    noPaymentActivated: true,
    bridgePacket: {
      brand: "Eden Skye Studios",
      shopifySurfaces: ["draft_products", "draft_collections", "metaobjects", "metafields", "files", "blog_or_page_drafts"],
      xylaUse: "Operate Xyla-style feed and storefront records through Shopify draft objects when no standalone Xyla MCP is present.",
      edenCloset: ["Black Card draft product", "membership collection", "premium content entitlement map", "age-gate receipt map"],
      approvalRequiredFor: ["publish_product", "activate_checkout", "change_price", "release_adult_content", "send_customer_message"]
    },
    nextAction: readiness.readyForXylaViaShopifyDrafts
      ? "Prepare Shopify/Xyla draft packets for Eden Closet and model feed records."
      : "Configure Shopify admin token and shop/store domain, plus an explicit Shopify/Xyla enable flag, then rerun dry-run."
  });
}

import { NextResponse } from "next/server";
import { getEdenSkyeWebsiteSocialLoopReadiness } from "@/lib/eden-skye/website-social-loop";

export const runtime = "nodejs";

export async function GET() {
  const readiness = getEdenSkyeWebsiteSocialLoopReadiness();

  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    provider: "metricool",
    mode: "dry_run",
    ready: readiness.readyForMetricoolDraftScheduling,
    noPostingPerformed: true,
    noPublicCommentsSent: true,
    noDmsSent: true,
    draftPacket: {
      brand: "Eden Skye Studios",
      platforms: ["instagram", "tiktok", "facebook", "pinterest", "youtube_shorts", "x"],
      queueTypes: ["post_draft", "caption_variant", "publish_window", "approval_gate", "analytics_read"],
      approvalRequiredFor: ["publish_post", "reply_comment", "send_dm", "paid_campaign", "adult_or_sensitive_promo"]
    },
    nextAction: readiness.readyForMetricoolDraftScheduling
      ? "Create Metricool draft schedule packets after content queue approval."
      : "Configure Metricool API URL/base URL and token/API key in Vercel, then rerun dry-run."
  });
}

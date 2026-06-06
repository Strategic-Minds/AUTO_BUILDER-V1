import { NextRequest, NextResponse } from "next/server";
import { buildSocialDraft, normalizeSocialAction } from "@/lib/social/auto-social-draft";
import { insertBridgeEvent } from "@/lib/bridge/event-bus";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ action: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { action: rawAction } = await params;
  const action = normalizeSocialAction(rawAction);
  if (!action) {
    return NextResponse.json({ ok: false, error: "unknown_social_action", allowed: ["strategy", "calendar", "content-batch", "assets", "approvals", "publish-drafts", "analytics", "repurpose", "optimize"] }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const draft = buildSocialDraft(action, body);
  const receipt = await insertBridgeEvent({
    phase: "social",
    source_system: "auto_builder",
    target_system: "auto_social",
    payload: draft,
    metadata: { action, draft_only: true }
  }, "pending");

  return NextResponse.json({ ok: true, draft, receipt }, { headers: { "cache-control": "no-store" } });
}

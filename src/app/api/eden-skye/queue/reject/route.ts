import { NextResponse } from "next/server";
import { asOptionalString, getEdenAdminClient, mutationGate, parseJsonBody } from "@/lib/eden-skye/review-data";

export async function POST(request: Request) {
  const gate = mutationGate(request);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, status: "blocked", blocker: gate.message }, { status: gate.status });
  }

  const body = await parseJsonBody(request);
  const contentProductId = asOptionalString(body.content_product_id) || asOptionalString(body.content_queue_id);
  const personaKey = asOptionalString(body.persona_key) || "eden-skye";
  const reviewedBy = asOptionalString(body.reviewed_by) || "AUTO_BUILDER_OPERATOR";
  const blocker = asOptionalString(body.blocker) || "Rejected during Forbidden Fruit / Eden Skye queue review.";
  const workaround = asOptionalString(body.workaround) || "Revise the content product row and submit it again for review.";
  const evidence = typeof body.evidence_json === "object" && body.evidence_json !== null ? body.evidence_json : {};

  if (!contentProductId) {
    return NextResponse.json({ ok: false, status: "blocked", blocker: "content_product_id is required." }, { status: 400 });
  }

  const client = getEdenAdminClient();
  if (!client) {
    return NextResponse.json({ ok: false, status: "blocked", blocker: "Sandbox Supabase admin client is unavailable." }, { status: 503 });
  }

  const { error: updateError } = await client
    .from("content_products")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", contentProductId);

  if (updateError) {
    return NextResponse.json({ ok: false, status: "failed", blocker: updateError.message }, { status: 500 });
  }

  const { data, error: eventError } = await client
    .from("approval_events")
    .insert({
      persona_key: personaKey,
      target_table: "content_products",
      target_id: contentProductId,
      action_requested: "reject_content_product",
      risk_level: asOptionalString(body.risk_level) || "high",
      status: "rejected",
      requested_by: asOptionalString(body.requested_by) || "AUTO_BUILDER",
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      evidence_json: evidence,
      blocker,
      workaround,
      rollback_path: "Set content_products.status back to needs_review after revision."
    })
    .select("*")
    .single();

  if (eventError) {
    return NextResponse.json({ ok: false, status: "failed", blocker: eventError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: "rejected", approvalEvent: data });
}

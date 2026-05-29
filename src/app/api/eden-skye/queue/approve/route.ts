import { NextResponse } from "next/server";
import { asOptionalString, getEdenAdminClient, mutationGate, parseJsonBody } from "@/lib/eden-skye/review-data";

export async function POST(request: Request) {
  const gate = mutationGate(request);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, status: "blocked", blocker: gate.message }, { status: gate.status });
  }

  const body = await parseJsonBody(request);
  const contentQueueId = asOptionalString(body.content_queue_id);
  const reviewedBy = asOptionalString(body.reviewed_by) || "AUTO_BUILDER_OPERATOR";
  const evidence = typeof body.evidence_json === "object" && body.evidence_json !== null ? body.evidence_json : {};
  const rollbackPath = asOptionalString(body.rollback_path) || "Set eden_content_queue.status back to needs_review and supersede this approval event.";

  if (!contentQueueId) {
    return NextResponse.json({ ok: false, status: "blocked", blocker: "content_queue_id is required." }, { status: 400 });
  }

  const client = getEdenAdminClient();
  if (!client) {
    return NextResponse.json({ ok: false, status: "blocked", blocker: "Sandbox Supabase admin client is unavailable." }, { status: 503 });
  }

  const { error: updateError } = await client
    .from("eden_content_queue")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", contentQueueId);

  if (updateError) {
    return NextResponse.json({ ok: false, status: "failed", blocker: updateError.message }, { status: 500 });
  }

  const { data, error: eventError } = await client
    .from("eden_approval_events")
    .insert({
      target_table: "eden_content_queue",
      target_id: contentQueueId,
      action_requested: "approve_queue_item",
      risk_level: asOptionalString(body.risk_level) || "medium",
      status: "approved",
      requested_by: asOptionalString(body.requested_by) || "AUTO_BUILDER",
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      evidence_json: evidence,
      rollback_path: rollbackPath
    })
    .select("*")
    .single();

  if (eventError) {
    return NextResponse.json({ ok: false, status: "failed", blocker: eventError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: "approved", approvalEvent: data });
}

import { NextRequest, NextResponse } from "next/server";
import { GOVERNED_MUTATION_TYPES } from "@/lib/workbook/contract";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        mutationType?: string;
        approvalState?: string | null;
        rollbackReady?: boolean;
        evidenceCount?: number;
      }
    | null;

  if (!body?.mutationType) {
    return NextResponse.json({ ok: false, error: "mutationType is required" }, { status: 400 });
  }

  const governed = GOVERNED_MUTATION_TYPES.includes(
    body.mutationType as (typeof GOVERNED_MUTATION_TYPES)[number],
  );

  if (!governed) {
    return NextResponse.json({
      ok: true,
      governed: false,
      allowed: true,
      reason: "Mutation type is outside the governed firewall list.",
    });
  }

  const approved = body.approvalState === "approved";
  const rollbackReady = body.rollbackReady === true;
  const hasEvidence = (body.evidenceCount ?? 0) > 0;
  const allowed = approved && rollbackReady && hasEvidence;

  return NextResponse.json({
    ok: true,
    governed: true,
    allowed,
    checks: { approved, rollbackReady, hasEvidence },
    reason: allowed
      ? "Governed mutation passed release firewall."
      : "Governed mutation blocked. Approval, rollback readiness, and evidence are all required.",
  });
}

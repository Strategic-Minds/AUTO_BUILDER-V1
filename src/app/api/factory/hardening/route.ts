import { NextRequest, NextResponse } from "next/server";
import { hardeningPipeline } from "@/lib/factory";
import { blockerAutonomyPolicy } from "@/lib/blocker-remediation";
import { previewValidationChecklist } from "@/lib/queue-runner";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { target?: string };

  return NextResponse.json({
    status: "ok",
    target: body.target ?? "preview-url-or-build-packet",
    requiredChecks: hardeningPipeline.filter((test) => test.required),
    previewValidationChecklist: previewValidationChecklist(),
    blockerAutonomy: blockerAutonomyPolicy,
    decision:
      "release-blocked-until-required-checks-pass-and-unresolved-blockers-either-auto-remediate-or-hit-an-explicit-hard-gate"
  });
}
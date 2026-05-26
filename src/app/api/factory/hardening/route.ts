import { NextRequest, NextResponse } from "next/server";
import { hardeningPipeline } from "@/lib/factory";
import { previewValidationChecklist } from "@/lib/queue-runner";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { target?: string };

  return NextResponse.json({
    status: "ok",
    target: body.target ?? "preview-url-or-build-packet",
    requiredChecks: hardeningPipeline.filter((test) => test.required),
    previewValidationChecklist: previewValidationChecklist(),
    decision: "release-blocked-until-required-checks-pass"
  });
}

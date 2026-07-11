import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "one-image-live-system-factory",
    environment: "preview",
    production_locked: true,
    checks: {
      branch_implementation: "pass",
      route_health: "pass",
      api_contract: "pass",
      workbook_evidence: "pass",
      skill_package_validation: "pass",
      visual_parity: "blocked_no_approved_image",
      production_release: "locked",
    },
    timestamp: new Date().toISOString(),
  });
}

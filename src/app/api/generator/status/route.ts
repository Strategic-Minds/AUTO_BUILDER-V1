import { NextResponse } from "next/server";
import { buildAutobuilderGeneratorPlan } from "@/lib/autobuilder/generator";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/generator/status",
    status: "contract_ready_execution_gated",
    plan: buildAutobuilderGeneratorPlan({ source: "status" })
  }, { headers: { "cache-control": "no-store" } });
}

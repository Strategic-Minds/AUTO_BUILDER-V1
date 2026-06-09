import { NextResponse } from "next/server";
import { buildModelRegistrySeed, buildQueueSeed, edenCohorts, edenModules, edenProtectedActions, getConnectorReadiness } from "@/lib/eden-skye-os";
import { getEdenWorkflowReadiness } from "@/lib/eden-skye-workflows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "eden-skye-studios-auto-social-os",
    productionActionAllowed: false,
    cohorts: edenCohorts,
    targetAccounts: buildModelRegistrySeed().length,
    modules: edenModules,
    protectedActions: edenProtectedActions,
    queue: buildQueueSeed(),
    connectors: getConnectorReadiness(),
    workflows: getEdenWorkflowReadiness(),
    routes: [
      "/api/eden-skye/os",
      "/api/eden-skye/admin-control",
      "/api/eden-skye/os/discover",
      "/api/eden-skye/os/analyze",
      "/api/eden-skye/os/create",
      "/api/eden-skye/os/quarantine",
      "/api/eden-skye/os/approve",
      "/api/eden-skye/os/schedule",
      "/api/eden-skye/os/validate",
      "/api/eden-skye/os/heal",
      "/api/eden-skye/os/dispatch",
      "/api/eden-skye/workflows",
      "/api/eden-skye/workflows/discover",
      "/api/eden-skye/workflows/analyze",
      "/api/eden-skye/workflows/create_drafts",
      "/api/eden-skye/workflows/image_inventory",
      "/api/eden-skye/workflows/asset_linking",
      "/api/eden-skye/workflows/quarantine",
      "/api/eden-skye/workflows/approval_queue",
      "/api/eden-skye/workflows/schedule_drafts",
      "/api/eden-skye/workflows/validate",
      "/api/eden-skye/workflows/heal",
      "/api/eden-skye/workflows/memory_reflection",
      "/api/eden-skye/workflows/dispatch_approved",
      "/api/cron/eden-skye-five-minute",
      "/admin/eden-skye"
    ]
  });
}

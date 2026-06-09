import { NextResponse } from "next/server";
import { buildModelRegistrySeed, buildQueueSeed, edenCohorts, edenModules, edenProtectedActions, getConnectorReadiness } from "@/lib/eden-skye-os";

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
    routes: [
      "/api/eden-skye/os",
      "/api/eden-skye/os/discover",
      "/api/eden-skye/os/analyze",
      "/api/eden-skye/os/create",
      "/api/eden-skye/os/quarantine",
      "/api/eden-skye/os/approve",
      "/api/eden-skye/os/schedule",
      "/api/eden-skye/os/validate",
      "/api/eden-skye/os/heal",
      "/api/eden-skye/os/dispatch",
      "/api/cron/eden-skye-five-minute",
      "/admin/eden-skye"
    ]
  });
}

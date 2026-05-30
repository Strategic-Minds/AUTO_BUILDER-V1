import { NextResponse } from "next/server";
import { buildCapabilityTestMatrix, factoryReadiness, templateLibrary, fastPathRoutes, connectorOps, hardeningPipeline } from "@/lib/factory";
import { assetFactory, buildPacketContract, factorySchema, queueAgentMap } from "@/lib/factory-registry";
import { blockerAutonomyPolicy } from "@/lib/blocker-remediation";
import { buildFinanceCommandCenter, defaultFinanceScenarios } from "@/lib/finance-sim";
import { buildOperationalReadinessSnapshot } from "@/lib/operational-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const operationalReadiness = await buildOperationalReadinessSnapshot();

  return NextResponse.json({
    status: operationalReadiness.status === "operational" ? "ok" : "degraded",
    operationalReadiness,
    factory: factoryReadiness,
    routes: fastPathRoutes,
    templates: templateLibrary,
    connectors: connectorOps,
    schema: factorySchema,
    queueAgentMap,
    blockerAutonomy: blockerAutonomyPolicy,
    hardeningPipeline,
    assetFactory,
    buildPacketContract,
    capabilityTestMatrix: buildCapabilityTestMatrix(),
    financeSimulation: {
      scenarios: defaultFinanceScenarios,
      commandCenter: buildFinanceCommandCenter()
    }
  });
}

import { NextResponse } from "next/server";
import { buildCapabilityTestMatrix, factoryReadiness, templateLibrary, fastPathRoutes, connectorOps, hardeningPipeline } from "@/lib/factory";
import { assetFactory, buildPacketContract, factorySchema, queueAgentMap } from "@/lib/factory-registry";
import { buildFinanceCommandCenter, defaultFinanceScenarios } from "@/lib/finance-sim";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    factory: factoryReadiness,
    routes: fastPathRoutes,
    templates: templateLibrary,
    connectors: connectorOps,
    schema: factorySchema,
    queueAgentMap,
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

import { NextResponse } from "next/server";
import { getRuntimeProviderStatus } from "@/lib/providers/runtimeProviderStatus";
import { mcpUniverseRegistry } from "@/lib/autobuilder-v2/mcp-universe/registry";

export async function GET() {
  const runtime = getRuntimeProviderStatus();
  const requiredEnvNames = [...new Set(mcpUniverseRegistry.flatMap((entry) => entry.requiredCredentials.filter((credential) => credential.required).map((credential) => credential.envName)))];
  const missingRequiredEnvNames = requiredEnvNames.filter((envName) => !process.env[envName]);

  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    secretsExposed: false,
    runtime,
    registryReadiness: {
      requiredEnvNames,
      missingRequiredEnvNames,
      configuredRequiredEnvNames: requiredEnvNames.filter((envName) => Boolean(process.env[envName])),
      entriesRequiringApproval: mcpUniverseRegistry.filter((entry) => entry.requiresApprovalActions.length > 0 || entry.defaultMode === "approval_required").map((entry) => entry.id)
    }
  });
}

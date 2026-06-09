import { NextResponse } from "next/server";
import { getMcpUniverseRegistry } from "@/lib/autobuilder-v2/mcp-universe/registry";
import { rankedMcpUniverse, summarizeMcpUniverse } from "@/lib/autobuilder-v2/mcp-universe/scoring";
import { validateMcpUniverse } from "@/lib/autobuilder-v2/mcp-universe/validators";

export async function GET() {
  const registry = getMcpUniverseRegistry();
  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    registry,
    summary: summarizeMcpUniverse(registry.registry),
    ranked: rankedMcpUniverse(registry.registry),
    validation: validateMcpUniverse(registry.registry)
  });
}

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { providers, repoRoles, factorySurfaces } from "@/lib/autobuilder";
import { getAwosHandoffPack } from "@/lib/awos-handoff";
import { factoryReadiness } from "@/lib/factory";

type PackageJson = {
  name?: string;
  version?: string;
};

function getPackageMetadata(): PackageJson {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf8");
    return JSON.parse(raw) as PackageJson;
  } catch {
    return {};
  }
}

export async function GET() {
  const pkg = getPackageMetadata();
  const awosHandoffPack = getAwosHandoffPack();

  return NextResponse.json({
    status: "ok",
    system: "AUTO BUILDER Bridge Brain",
    app: {
      name: pkg.name ?? "auto-builder-bridge",
      version: pkg.version ?? "unknown"
    },
    deployment: {
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown",
      commitRef: process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
      environment: process.env.VERCEL_ENV ?? "unknown",
      deploymentUrl: process.env.VERCEL_URL ?? "unknown"
    },
    repos: repoRoles,
    providers,
    factory: {
      readiness: factoryReadiness,
      surfaces: factorySurfaces
    },
    awos: {
      doctrinePack: awosHandoffPack.name,
      handoffRoute: "/api/awos/handoff",
      recursiveStatusRoute: "/api/recursive/status",
      runtimeTelemetryRoute: "/api/runtime/telemetry",
      manualWorkflowTriggerRoute: "/api/workflows/awos-recursive-control",
      cronRoute: "/api/cron/recursive-control",
      cronCadence: "*/5 * * * *",
      sourceOfTruthMap: awosHandoffPack.sourceOfTruthMap,
      stagedMigrationFile: awosHandoffPack.stagedMigrationFile,
      migrationStatus: "staged_not_executed"
    }
  });
}

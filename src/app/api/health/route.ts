import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { providers, repoRoles } from "@/lib/autobuilder";

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
    providers
  });
}

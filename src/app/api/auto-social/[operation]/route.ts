import { NextRequest, NextResponse } from "next/server";
import {
  autoSocialOperations,
  persistAutoSocialRun,
  runAutoSocialOperation,
  type AutoSocialOperation
} from "@/lib/auto-social";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ operation: string }>;
};

async function resolveOperation(context: RouteContext): Promise<AutoSocialOperation | null> {
  const { operation } = await context.params;
  return autoSocialOperations.includes(operation as AutoSocialOperation) ? (operation as AutoSocialOperation) : null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const operation = await resolveOperation(context);
  if (!operation) {
    return NextResponse.json({ ok: false, error: "Unknown AUTO SOCIAL operation" }, { status: 404 });
  }

  const result = runAutoSocialOperation(operation);
  const persistence = await persistAutoSocialRun(result);
  return NextResponse.json({ ...result, persistence });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const operation = await resolveOperation(context);
  if (!operation) {
    return NextResponse.json({ ok: false, error: "Unknown AUTO SOCIAL operation" }, { status: 404 });
  }

  const payload = await request.json().catch(() => ({}));
  const result = runAutoSocialOperation(operation, payload);
  const persistence = await persistAutoSocialRun(result);
  return NextResponse.json({ ...result, persistence });
}

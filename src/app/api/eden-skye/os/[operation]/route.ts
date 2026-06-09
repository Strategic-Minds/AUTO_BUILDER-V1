import { NextRequest, NextResponse } from "next/server";
import { buildEdenReceipt, edenOperations, persistEdenReceipt, type EdenOperation } from "@/lib/eden-skye-os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ operation: string }> };

async function resolveOperation(context: RouteContext): Promise<EdenOperation | null> {
  const { operation } = await context.params;
  return edenOperations.includes(operation as EdenOperation) ? (operation as EdenOperation) : null;
}

async function run(request: NextRequest, context: RouteContext) {
  const operation = await resolveOperation(context);
  if (!operation) return NextResponse.json({ ok: false, error: "Unknown Eden Skye operation" }, { status: 404 });
  const payload = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const receipt = buildEdenReceipt(operation, payload as Record<string, unknown>);
  const persistence = await persistEdenReceipt(receipt);
  return NextResponse.json({ ...receipt, persistence });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return run(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return run(request, context);
}

import { NextResponse } from "next/server";
import { buildEdenAdminControlSnapshot } from "@/lib/eden-skye-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await buildEdenAdminControlSnapshot();
  return NextResponse.json(snapshot);
}

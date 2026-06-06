import { NextResponse } from "next/server";
import { socialStatus } from "@/lib/social/auto-social-draft";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(socialStatus(), { headers: { "cache-control": "no-store" } });
}

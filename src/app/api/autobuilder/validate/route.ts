import { NextResponse } from "next/server";
import { audit, readiness } from "@/lib/autobuilder";

export async function GET() {
  return NextResponse.json({
    status: "pass",
    audit,
    readiness
  });
}

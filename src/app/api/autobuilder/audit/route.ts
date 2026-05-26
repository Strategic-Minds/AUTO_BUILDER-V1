import { NextResponse } from "next/server";
import { audit } from "@/lib/autobuilder";

export async function GET() {
  return NextResponse.json(audit);
}

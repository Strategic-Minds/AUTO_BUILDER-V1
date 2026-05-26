import { NextResponse } from "next/server";
import { readiness } from "@/lib/autobuilder";

export async function GET() {
  return NextResponse.json(readiness);
}

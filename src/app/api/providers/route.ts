import { NextResponse } from "next/server";
import { providers } from "@/lib/autobuilder";

export async function GET() {
  return NextResponse.json({ providers });
}

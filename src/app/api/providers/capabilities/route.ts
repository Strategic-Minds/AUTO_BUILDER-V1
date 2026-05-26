import { NextResponse } from "next/server";
import { providerCapabilities } from "@/lib/provider-capabilities";

export async function GET() {
  return NextResponse.json({ providerCapabilities });
}

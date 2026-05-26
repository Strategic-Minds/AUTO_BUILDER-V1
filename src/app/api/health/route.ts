import { NextResponse } from "next/server";
import { providers, repoRoles } from "@/lib/autobuilder";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    system: "AUTO BUILDER Bridge Brain",
    repos: repoRoles,
    providers
  });
}

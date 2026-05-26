import { NextResponse } from "next/server";
import { repoRoles, workflow } from "@/lib/autobuilder";

export async function GET() {
  return NextResponse.json({
    repos: repoRoles,
    workflow
  });
}

import { NextResponse } from "next/server";
import { entryPrompts, repoRoles, workflow } from "@/lib/autobuilder";

export async function GET() {
  return NextResponse.json({
    status: "loop-ready",
    prompts: entryPrompts,
    repos: repoRoles,
    workflow
  });
}

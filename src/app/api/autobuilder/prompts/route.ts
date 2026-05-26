import { NextResponse } from "next/server";
import { entryPrompts } from "@/lib/autobuilder";

export async function GET() {
  return NextResponse.json({ prompts: entryPrompts });
}

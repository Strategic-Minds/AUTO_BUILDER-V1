import { NextResponse } from "next/server";
import { readPromptBank } from "@/lib/eden-skye/review-data";

export async function GET() {
  const result = await readPromptBank();

  return NextResponse.json({
    ok: true,
    table: "eden_prompt_bank",
    source: result.source,
    blockers: result.blockers,
    rows: result.rows
  });
}

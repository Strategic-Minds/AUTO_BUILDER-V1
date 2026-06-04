import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry } from "@/lib/telemetry-store";

export const runtime = "nodejs";

const CONFIRM = "queue-nrw-browser-qa-20260604";
const TARGET_URL = "https://nashvilleresinworx-strategic-minds-advisory.vercel.app";

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("confirm") !== CONFIRM) {
    return NextResponse.json({ ok: false, status: "blocked", reason: "Missing required confirmation token." }, { status: 403 });
  }

  const taskPrompt = [
    "Run Nashville Resin Worx production QA from the GitHub Actions Playwright browser worker.",
    "Capture desktop screenshot at 1440x1200 and mobile screenshot at 390x844.",
    "Verify approved Drive logo and brand-pack assets render on the page.",
    "Submit one lead form as AUTO BUILDER Cloud QA with a unique qa-cloud email.",
    "Confirm the lead row lands in Supabase if service-role access is available to the worker.",
    "Report screenshot refs, console errors, lead email, final URL, Supabase row evidence, and blockers."
  ].join(" ");

  const task = await insertTelemetry("browser_tasks", {
    task_type: "validate",
    task_prompt: taskPrompt,
    target: TARGET_URL,
    priority: "high",
    approved: true,
    safe: true,
    state: "queued",
    created_at: new Date().toISOString()
  });

  return NextResponse.json({ ok: true, queued: true, targetUrl: TARGET_URL, task });
}

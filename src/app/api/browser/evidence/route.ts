import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry, updateTelemetry } from "@/lib/telemetry-store";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    taskId?: string;
    claimId?: string;
    status?: "success" | "blocked" | "failed";
    evidence?: string;
    sourceUrl?: string;
    screenshotRef?: string;
    blocker?: string;
  };
  const now = new Date().toISOString();
  const status = body.status ?? "success";
  const evidence = await insertTelemetry("browser_evidence", {
    task_ref: body.taskId ?? null,
    claim_ref: body.claimId ?? null,
    status,
    evidence: body.evidence ?? null,
    source_url: body.sourceUrl ?? null,
    created_at: now
  });
  const screenshot = body.screenshotRef
    ? await insertTelemetry("browser_screenshots", {
        task_ref: body.taskId ?? null,
        screenshot_ref: body.screenshotRef,
        created_at: now
      })
    : null;
  const taskUpdate = body.taskId
    ? await updateTelemetry("browser_tasks", { state: status === "success" ? "completed" : "blocked" }, { id: `eq.${body.taskId}` })
    : null;
  const blocker = status !== "success"
    ? await insertTelemetry("browser_blockers", {
        task_ref: body.taskId ?? null,
        blocker: body.blocker ?? "browser worker failure",
        severity: "high",
        state: "open",
        created_at: now
      })
    : null;
  return NextResponse.json({ ok: true, evidence, screenshot, taskUpdate, blocker });
}

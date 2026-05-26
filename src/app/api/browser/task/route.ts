import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry } from "@/lib/telemetry-store";

const SAFE_BROWSER_TASKS = new Set(["navigate", "extract", "screenshot", "validate"]);

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    taskType?: string;
    taskPrompt?: string;
    target?: string;
    priority?: string;
    approved?: boolean;
  };
  const taskType = body.taskType ?? "validate";
  const approved = body.approved === true;
  const safe = SAFE_BROWSER_TASKS.has(taskType);
  const state = approved && safe ? "queued" : "blocked";
  const reason = approved ? (safe ? null : "Unsafe browser task type") : "Task not approved";

  const task = await insertTelemetry("browser_tasks", {
    task_type: taskType,
    task_prompt: body.taskPrompt ?? "No prompt provided.",
    target: body.target ?? "web",
    priority: body.priority ?? "normal",
    approved,
    safe,
    state,
    created_at: new Date().toISOString()
  });

  let blocker = null;
  if (state === "blocked") {
    blocker = await insertTelemetry("browser_blockers", {
      task_ref: task.response?.[0]?.id ?? null,
      blocker: reason ?? "Unknown blocker",
      severity: "high",
      state: "open",
      created_at: new Date().toISOString()
    });
  }

  return NextResponse.json({ ok: true, task, blocker, gptBrain: true, codexNotBrowserRuntime: true });
}

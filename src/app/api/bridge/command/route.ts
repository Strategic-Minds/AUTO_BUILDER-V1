import { NextRequest, NextResponse } from "next/server";
import { insertTelemetry } from "@/lib/telemetry-store";

const SAFE_TASK_TYPES = new Set(["repo_inspection", "code_patch", "build_validation", "playwright_validation", "telemetry_check"]);

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    taskType?: string;
    taskPrompt?: string;
    target?: string;
    priority?: string;
    approved?: boolean;
    source?: string;
  };

  const taskType = body.taskType ?? "repo_inspection";
  const approved = body.approved === true;
  const safe = SAFE_TASK_TYPES.has(taskType);
  const blockedReason = !approved
    ? "Task not approved."
    : !safe
      ? `Task type ${taskType} is not sandbox-safe.`
      : null;

  const commandInsert = await insertTelemetry("bridge_commands", {
    source: body.source ?? "gpt-autobuilder",
    task_type: taskType,
    task_prompt: body.taskPrompt ?? "No prompt provided.",
    target: body.target ?? "AUTO_BUILDER",
    priority: body.priority ?? "normal",
    approved,
    safe,
    blocked_reason: blockedReason,
    created_at: new Date().toISOString()
  });

  const taskInsert = await insertTelemetry("bridge_tasks", {
    command_ref: commandInsert.response?.[0]?.id ?? null,
    task_type: taskType,
    task_prompt: body.taskPrompt ?? "No prompt provided.",
    target: body.target ?? "AUTO_BUILDER",
    priority: body.priority ?? "normal",
    state: blockedReason ? "blocked" : "queued",
    approved,
    safe,
    created_at: new Date().toISOString()
  });

  if (blockedReason) {
    await insertTelemetry("bridge_blockers", {
      task_ref: taskInsert.response?.[0]?.id ?? null,
      blocker: blockedReason,
      state: "open",
      created_at: new Date().toISOString()
    });
  }

  return NextResponse.json({
    ok: true,
    rules: {
      gptIsBrain: true,
      codexIsExecutor: true,
      stopUnsafeProductionActions: true
    },
    command: commandInsert,
    task: taskInsert
  });
}

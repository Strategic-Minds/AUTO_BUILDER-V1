import { completionChecklist } from "./completion-checklist";
import { createRepairTasks, summarizeRepairQueue } from "./repair-queue";
import { createReceipt } from "./receipts";
import { runAutoBuilderV2Validation } from "./validation-runner";

export type WorkflowRunResult = {
  ok: boolean;
  validation: ReturnType<typeof runAutoBuilderV2Validation>;
  repairs: ReturnType<typeof createRepairTasks>;
  repairSummary: ReturnType<typeof summarizeRepairQueue>;
  receipt: ReturnType<typeof createReceipt>;
};

export function runAutoBuilderV2Workflow(): WorkflowRunResult {
  const validation = runAutoBuilderV2Validation();
  const repairs = createRepairTasks(completionChecklist.filter((item) => item.required && item.status !== "done"));
  const repairSummary = summarizeRepairQueue(repairs);
  const ok = validation.ok && repairSummary.total === 0;

  const receipt = createReceipt({
    ok,
    provider: "autobuilder_v2",
    action: "run_five_minute_workflow",
    category: "operate",
    operation: "validate_and_generate_repairs",
    requestedCapability: "Run AUTO BUILDER 2 accounting, validation, repair queue, and classification loop.",
    authStatus: "not_required",
    executionMode: "api",
    status: ok ? "completed" : "blocked",
    logs: [
      `Validation ok: ${validation.ok}`,
      `Completion: ${validation.summary.percent}%`,
      `Repair tasks generated: ${repairSummary.total}`
    ],
    blockers: validation.missing,
    artifacts: ["completion-checklist", "validation-result", "repair-queue"],
    fallbackMode: "Continue five-minute loop until every item is done or classified.",
    nextActions: ok ? ["Prepare release packet."] : repairs.slice(0, 10).map((task) => task.description)
  });

  return { ok, validation, repairs, repairSummary, receipt };
}

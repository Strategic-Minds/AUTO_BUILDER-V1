import { executeAutoBuilderV2Action } from "./execution-router";
import type { RepairTask } from "./repair-queue";

export type TaskExecutionResult = {
  taskId: string;
  status: "executed" | "blocked";
  receipt: ReturnType<typeof executeAutoBuilderV2Action>;
};

export function executeRepairTask(task: RepairTask): TaskExecutionResult {
  const receipt = executeAutoBuilderV2Action({
    action: task.action,
    providerId: "universal_app",
    category: "execute",
    payload: task
  });

  return {
    taskId: task.id,
    status: receipt.ok ? "executed" : "blocked",
    receipt
  };
}

export function executeRepairTasks(tasks: RepairTask[], limit = 10): TaskExecutionResult[] {
  return tasks.slice(0, limit).map((task) => executeRepairTask(task));
}

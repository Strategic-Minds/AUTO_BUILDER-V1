import type { CompletionChecklistItem } from "./completion-checklist";
import { classifyBlocker } from "./blocker-classifier";

export type RepairTask = {
  id: string;
  sourceItemId: string;
  action: string;
  status: "queued" | "running" | "done" | "blocked";
  blockerClass: ReturnType<typeof classifyBlocker>;
  description: string;
};

export function createRepairTasks(items: CompletionChecklistItem[]): RepairTask[] {
  return items
    .filter((item) => item.required && item.status !== "done")
    .map((item) => {
      const isFile = item.id.startsWith("file:");
      const blockerClass = classifyBlocker({ missingConfig: !isFile, buildFailed: false });
      return {
        id: `repair:${item.id}`,
        sourceItemId: item.id,
        action: isFile ? "create_or_update_missing_file" : "implement_missing_capability",
        status: "queued" as const,
        blockerClass,
        description: isFile
          ? `Create or update required file for ${item.id.replace("file:", "")}`
          : `Implement required capability for ${item.id.replace("capability:", "")}`
      };
    });
}

export function summarizeRepairQueue(tasks: RepairTask[]) {
  return {
    total: tasks.length,
    queued: tasks.filter((task) => task.status === "queued").length,
    blocked: tasks.filter((task) => task.status === "blocked").length,
    done: tasks.filter((task) => task.status === "done").length
  };
}

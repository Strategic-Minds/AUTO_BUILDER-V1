export type ChecklistStatus = "pending" | "running" | "done" | "failed" | "blocked" | "retrying";

export type CompletionChecklistItem = {
  id: string;
  category: string;
  required: boolean;
  status: ChecklistStatus;
  description: string;
};

const requiredFiles = [
  "src/lib/autobuilder-v2/types.ts",
  "src/lib/autobuilder-v2/provider-registry.ts",
  "src/lib/autobuilder-v2/receipts.ts",
  "src/lib/autobuilder-v2/completion-checklist.ts",
  "src/lib/autobuilder-v2/workflow-runner.ts",
  "src/lib/autobuilder-v2/validation-runner.ts",
  "src/lib/autobuilder-v2/repair-queue.ts",
  "src/lib/autobuilder-v2/blocker-classifier.ts",
  "src/app/api/cron/autobuilder-v2-five-minute/route.ts",
  "src/app/api/autobuilder-v2/workflow/route.ts",
  "src/app/api/autobuilder-v2/validate/route.ts",
  "vercel.json"
];

export const completionChecklist: CompletionChecklistItem[] = [
  ...requiredFiles.map((path) => ({
    id: `file:${path}`,
    category: "file",
    required: true,
    status: "pending" as ChecklistStatus,
    description: `Required file must exist: ${path}`
  })),
  ...[
    "providerRegistry",
    "receiptModel",
    "fiveMinuteCron",
    "workflowRunner",
    "validationRunner",
    "repairQueue",
    "blockerClassifier",
    "workflowApiRoute",
    "validateApiRoute"
  ].map((id) => ({
    id: `capability:${id}`,
    category: "capability",
    required: true,
    status: "pending" as ChecklistStatus,
    description: `Required Auto Builder 2 capability: ${id}`
  }))
];

export function getChecklistSummary(items: CompletionChecklistItem[] = completionChecklist) {
  const total = items.length;
  const done = items.filter((item) => item.status === "done").length;
  const blocked = items.filter((item) => item.status === "blocked").length;
  const failed = items.filter((item) => item.status === "failed").length;
  const percent = total === 0 ? 100 : Math.round((done / total) * 100);

  return { total, done, blocked, failed, percent };
}

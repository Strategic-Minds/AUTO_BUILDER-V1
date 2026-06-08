import type { AutoSocialOperation, ReflectionEntry } from "./types";

export function buildPreRunReflection(operation: AutoSocialOperation): ReflectionEntry {
  return {
    scope: "auto_social_pre_run",
    trigger: operation,
    findings: [
      "Confirm source truth is current before generating or scheduling.",
      "Confirm output remains draft-only unless owner approval is present.",
      "Confirm receipts are created for every route, cron, workflow, and connector dry-run."
    ],
    improvements: [
      "Prefer regenerating weak drafts over escalating live actions.",
      "Quarantine uncertain media or engagement responses before owner review."
    ],
    remember: [
      "n8n remains prewired but parked until authenticated API readiness is verified.",
      "Split image ZIP is required before image upload resumes."
    ]
  };
}

export function buildPostRunReflection(operation: AutoSocialOperation, ok: boolean): ReflectionEntry {
  return {
    scope: "auto_social_post_run",
    trigger: operation,
    findings: ok
      ? ["Operation completed inside sandbox and returned a receipt."]
      : ["Operation failed or was blocked before any external mutation."],
    improvements: ok
      ? ["Advance the next safe queue item."]
      : ["Move failed item to repair queue and keep live gates closed."],
    remember: ["Every completed operation should update queue state, memory, and validation receipts."]
  };
}

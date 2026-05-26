type JobPayload = Record<string, unknown>;

export type QueueJob = {
  id: string;
  queue: string;
  payload: JobPayload;
  attempts: number;
  status: "queued" | "running" | "passed" | "failed" | "dead_letter";
};

export type QueueRunResult = {
  jobId: string;
  queue: string;
  status: QueueJob["status"];
  summary: string;
  nextQueue?: string;
  deadLetterReason?: string;
  evidence: string[];
};

const MAX_ATTEMPTS: Record<string, number> = {
  idea_intake_queue: 3,
  build_router_queue: 3,
  template_pull_queue: 2,
  repo_patch_queue: 2,
  supabase_migration_queue: 2,
  vercel_preview_queue: 2,
  hardening_queue: 3,
  approval_queue: 1,
  asset_factory_queue: 2
};

export function runQueueJob(job: QueueJob): QueueRunResult {
  const maxAttempts = MAX_ATTEMPTS[job.queue] ?? 1;

  if (job.attempts >= maxAttempts) {
    return {
      jobId: job.id,
      queue: job.queue,
      status: "dead_letter",
      summary: `Job exceeded retry policy for ${job.queue}`,
      deadLetterReason: "max_attempts_reached",
      evidence: ["retry-policy-block"]
    };
  }

  switch (job.queue) {
    case "idea_intake_queue":
      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Idea captured and ready for router classification.",
        nextQueue: "build_router_queue",
        evidence: ["idea-recorded", "starter-build-packet-possible"]
      };
    case "build_router_queue":
      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Build card routed into template selection.",
        nextQueue: "template_pull_queue",
        evidence: ["route-selected", "risk-scored"]
      };
    case "template_pull_queue":
      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Template bundle assembled for sandbox patching.",
        nextQueue: "repo_patch_queue",
        evidence: ["template-bundle-selected"]
      };
    case "repo_patch_queue":
      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Patch plan ready for repo update or manual export.",
        nextQueue: "supabase_migration_queue",
        evidence: ["repo-plan-ready", "fallback-manual-patch-available"]
      };
    case "supabase_migration_queue":
      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Sandbox migration prepared and ready for preview validation.",
        nextQueue: "vercel_preview_queue",
        evidence: ["migration-dry-run-required"]
      };
    case "vercel_preview_queue":
      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Preview deployment step prepared.",
        nextQueue: "hardening_queue",
        evidence: ["preview-smoke-required"]
      };
    case "hardening_queue":
      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Hardening profile queued with required release checks.",
        nextQueue: "approval_queue",
        evidence: ["route-smoke", "queue-replay", "rollback-check"]
      };
    case "approval_queue":
      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Approval package assembled.",
        nextQueue: "asset_factory_queue",
        evidence: ["approval-required-or-documented"]
      };
    case "asset_factory_queue":
      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Reusable assets captured from the build.",
        evidence: ["prompt-pack-candidate", "ui-block-candidate", "runbook-candidate"]
      };
    default:
      return {
        jobId: job.id,
        queue: job.queue,
        status: "failed",
        summary: `Unknown queue: ${job.queue}`,
        deadLetterReason: "unknown_queue",
        evidence: ["manual-review-required"]
      };
  }
}

export function previewValidationChecklist() {
  return [
    "preview URL loads",
    "health endpoint returns factory readiness",
    "idea-intake route accepts sample idea",
    "build-packet route returns contract",
    "capability-test route exposes readiness matrix",
    "hardening route returns required checks",
    "rollback reference documented"
  ];
}

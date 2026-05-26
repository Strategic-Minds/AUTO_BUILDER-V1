import { buildBlockerRemediationPlan } from "@/lib/blocker-remediation";

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
  blocker_remediation_queue: 2,
  connector_recovery_queue: 2,
  workaround_queue: 2,
  approval_queue: 1,
  asset_factory_queue: 2
};

function payloadString(payload: JobPayload, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : undefined;
}

function payloadBoolean(payload: JobPayload, key: string) {
  return payload[key] === true;
}

function payloadEvidence(payload: JobPayload) {
  const value = payload.evidence;
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function remediationResult(job: QueueJob, blockerCode?: string): QueueRunResult {
  const plan = buildBlockerRemediationPlan({
    blockerCode,
    queue: job.queue,
    connector: payloadString(job.payload, "connector"),
    uiSurface: payloadString(job.payload, "uiSurface"),
    summary: payloadString(job.payload, "summary") ?? `Blocker detected in ${job.queue}`,
    attempts: job.attempts,
    approvalRequired: payloadBoolean(job.payload, "approvalRequired"),
    riskClass: payloadString(job.payload, "riskClass"),
    evidence: payloadEvidence(job.payload)
  });

  return {
    jobId: job.id,
    queue: job.queue,
    status: "failed",
    summary: `${plan.summary} AUTO BUILDER queued the next repair lane automatically.`,
    nextQueue: plan.nextQueue,
    deadLetterReason: plan.blockerCode,
    evidence: [
      ...plan.actions.map((action) => `${action.type}:${action.target}`),
      ...(plan.hardGate ? [`hard-gate:${plan.hardGate}`] : []),
      ...payloadEvidence(job.payload)
    ]
  };
}

export function runQueueJob(job: QueueJob): QueueRunResult {
  const maxAttempts = MAX_ATTEMPTS[job.queue] ?? 1;

  if (job.attempts >= maxAttempts) {
    if (job.queue === "blocker_remediation_queue") {
      return {
        jobId: job.id,
        queue: job.queue,
        status: "dead_letter",
        summary: "Blocker remediation itself exceeded retry policy and now requires governed review.",
        deadLetterReason: "blocker-remediation-exhausted",
        evidence: ["remediation-exhausted", "governed-review-required"]
      };
    }

    return remediationResult(job, "max_attempts_reached");
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
      if (payloadBoolean(job.payload, "templateMissing")) {
        return remediationResult(job, "template_gap");
      }

      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Template bundle assembled for sandbox patching.",
        nextQueue: "repo_patch_queue",
        evidence: ["template-bundle-selected"]
      };
    case "repo_patch_queue":
      if (payloadBoolean(job.payload, "patchConflict")) {
        return remediationResult(job, "patch_conflict");
      }

      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Patch plan ready for repo update or manual export.",
        nextQueue: "supabase_migration_queue",
        evidence: ["repo-plan-ready", "fallback-manual-patch-available"]
      };
    case "supabase_migration_queue":
      if (payloadBoolean(job.payload, "connectorBlocked")) {
        return remediationResult(job, "connector_mutation_blocked");
      }

      if (payloadBoolean(job.payload, "migrationFailed")) {
        return remediationResult(job, "migration_failed");
      }

      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Sandbox migration prepared and ready for preview validation.",
        nextQueue: "vercel_preview_queue",
        evidence: ["migration-dry-run-required"]
      };
    case "vercel_preview_queue":
      if (payloadBoolean(job.payload, "connectorBlocked")) {
        return remediationResult(job, "connector_mutation_blocked");
      }

      if (payloadBoolean(job.payload, "previewFailed")) {
        return remediationResult(job, "preview_failed");
      }

      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Preview deployment step prepared.",
        nextQueue: "hardening_queue",
        evidence: ["preview-smoke-required"]
      };
    case "hardening_queue":
      if (payloadBoolean(job.payload, "routeSmokeFailed") || payloadBoolean(job.payload, "blockerDetected")) {
        return remediationResult(job, "route_smoke_failed");
      }

      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Hardening profile queued with required release checks.",
        nextQueue: "approval_queue",
        evidence: ["route-smoke", "queue-replay", "rollback-check"]
      };
    case "blocker_remediation_queue": {
      const plan = buildBlockerRemediationPlan({
        blockerCode: payloadString(job.payload, "blockerCode"),
        queue: payloadString(job.payload, "failedQueue") ?? payloadString(job.payload, "queue") ?? job.queue,
        connector: payloadString(job.payload, "connector"),
        uiSurface: payloadString(job.payload, "uiSurface") ?? "ui-blocker-card",
        summary: payloadString(job.payload, "summary"),
        attempts: job.attempts,
        approvalRequired: payloadBoolean(job.payload, "approvalRequired"),
        riskClass: payloadString(job.payload, "riskClass"),
        evidence: payloadEvidence(job.payload)
      });

      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: plan.summary,
        nextQueue: plan.nextQueue,
        deadLetterReason: plan.hardGate,
        evidence: plan.actions.map((action) => `${action.type}:${action.target}`)
      };
    }
    case "connector_recovery_queue":
      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Connector blocker rerouted through fallback receipt or bridge path.",
        nextQueue: "hardening_queue",
        evidence: ["connector-fallback-selected", "receipt-or-recovery-path-active"]
      };
    case "workaround_queue":
      return {
        jobId: job.id,
        queue: job.queue,
        status: "passed",
        summary: "Generic workaround or scaffold selected so the build can continue.",
        nextQueue: "hardening_queue",
        evidence: ["generic-workaround-selected", "asset-gap-captured"]
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
      return remediationResult(job, "unknown_queue");
  }
}

export function previewValidationChecklist() {
  return [
    "preview URL loads",
    "health endpoint returns factory readiness",
    "idea-intake route accepts sample idea",
    "build-packet route returns contract",
    "capability-test route exposes readiness matrix",
    "blocker-remediation route returns autonomous fix plan",
    "hardening route returns required checks",
    "rollback reference documented"
  ];
}

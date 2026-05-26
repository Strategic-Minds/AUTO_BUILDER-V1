import { connectorOps } from "@/lib/factory";

export type BlockerSeverity = "low" | "medium" | "high" | "critical";

export type BlockerCode =
  | "max_attempts_reached"
  | "unknown_queue"
  | "connector_mutation_blocked"
  | "missing_secrets"
  | "template_gap"
  | "patch_conflict"
  | "migration_failed"
  | "preview_failed"
  | "route_smoke_failed"
  | "approval_required"
  | "unknown_blocker";

export type BlockerTrigger = {
  blockerCode?: string;
  queue?: string;
  connector?: string;
  uiSurface?: string;
  summary?: string;
  evidence?: string[];
  attempts?: number;
  approvalRequired?: boolean;
  riskClass?: string;
};

export type BlockerRemediationAction = {
  id: string;
  type:
    | "retry_queue"
    | "reroute_queue"
    | "connector_fallback"
    | "generic_scaffold"
    | "approval_request"
    | "release_hold";
  description: string;
  target: string;
  autoDispatch: boolean;
  evidence: string[];
};

export type BlockerRemediationPlan = {
  blockerCode: BlockerCode;
  severity: BlockerSeverity;
  status: "auto_remediation_queued" | "approval_required" | "release_hold";
  summary: string;
  triggerSource: string;
  nextQueue: string;
  autoDispatch: boolean;
  actions: BlockerRemediationAction[];
  hardGate?: string;
};

export const blockerAutonomyPolicy = {
  autoTriggerSources: [
    "UI blocker cards",
    "queue-runner failures",
    "preview-validation failures",
    "hardening failures",
    "connector readiness receipts"
  ],
  autonomousObjectives: [
    "keep builds moving",
    "convert hard blockers into retries, reroutes, or workarounds",
    "fallback before escalation when risk allows",
    "preserve release gates for irreversible actions"
  ],
  fallbackPriority: [
    "retry the original queue if evidence suggests a transient failure",
    "reroute into connector recovery if the blocker is a tool-surface issue",
    "switch to workaround or generic scaffold if the build can continue safely",
    "open an approval gate only when the blocker touches a protected surface"
  ],
  hardGates: [
    "secret creation or rotation",
    "production deploys without a healthy preview",
    "payments, ad spend, or money movement",
    "legal or regulated claims",
    "customer-facing recovery or refunds",
    "irreversible live data deletion"
  ]
} as const;

function normalize(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function queueFallbackCode(queue?: string): BlockerCode | undefined {
  switch (queue) {
    case "supabase_migration_queue":
      return "migration_failed";
    case "vercel_preview_queue":
      return "preview_failed";
    case "template_pull_queue":
      return "template_gap";
    case "repo_patch_queue":
      return "patch_conflict";
    case "hardening_queue":
      return "route_smoke_failed";
    default:
      return undefined;
  }
}

function classifyBlocker(trigger: BlockerTrigger): BlockerCode {
  const blockerCode = normalize(trigger.blockerCode);
  const queueCode = queueFallbackCode(trigger.queue);
  const summary = normalize(trigger.summary);
  const connector = normalize(trigger.connector);
  const riskClass = normalize(trigger.riskClass);

  if (trigger.approvalRequired || riskClass === "high" || blockerCode === "approval_required") {
    return "approval_required";
  }

  if (blockerCode === "max_attempts_reached") {
    return queueCode ?? "unknown_blocker";
  }

  if (blockerCode === "unknown_queue" || summary.includes("unknown queue")) {
    return "unknown_queue";
  }

  if (summary.includes("secret") || summary.includes("token") || summary.includes("env")) {
    return "missing_secrets";
  }

  if (connector) {
    const connectorProfile = connectorOps.find((candidate) => normalize(candidate.connector) === connector);
    if (connectorProfile && connectorProfile.readiness !== "Ready") {
      return "connector_mutation_blocked";
    }
  }

  if (summary.includes("migration") || summary.includes("sql") || summary.includes("rls") || summary.includes("supabase")) {
    return "migration_failed";
  }

  if (summary.includes("preview") || summary.includes("deploy") || summary.includes("vercel") || summary.includes("build failed")) {
    return "preview_failed";
  }

  if (summary.includes("template") || summary.includes("missing module") || summary.includes("scaffold")) {
    return "template_gap";
  }

  if (summary.includes("patch") || summary.includes("conflict") || summary.includes("merge")) {
    return "patch_conflict";
  }

  if (summary.includes("route") || summary.includes("api") || summary.includes("endpoint") || summary.includes("smoke")) {
    return "route_smoke_failed";
  }

  if (blockerCode) {
    return blockerCode as BlockerCode;
  }

  return queueCode ?? "unknown_blocker";
}

function connectorFallback(connector?: string) {
  return connectorOps.find((candidate) => normalize(candidate.connector) === normalize(connector));
}

export function buildBlockerRemediationPlan(trigger: BlockerTrigger): BlockerRemediationPlan {
  const blockerCode = classifyBlocker(trigger);
  const triggerSource = `${trigger.uiSurface ?? "runtime"}:${trigger.queue ?? "unscoped"}`;
  const fallback = connectorFallback(trigger.connector);

  switch (blockerCode) {
    case "approval_required":
      return {
        blockerCode,
        severity: "high",
        status: "approval_required",
        summary: "Blocker routed into the approval queue because the action touches a governed surface.",
        triggerSource,
        nextQueue: "approval_queue",
        autoDispatch: false,
        hardGate: "Protected action requires explicit approval before continuation.",
        actions: [
          {
            id: "ACT-APPROVAL-001",
            type: "approval_request",
            description: "Create approval package with blocker evidence and next safe action.",
            target: "approval_queue",
            autoDispatch: false,
            evidence: ["approval-gate", "governed-surface"]
          }
        ]
      };
    case "missing_secrets":
      return {
        blockerCode,
        severity: "critical",
        status: "release_hold",
        summary: "The build can keep moving in workaround mode, but live mutation stays blocked until secrets are connected.",
        triggerSource,
        nextQueue: "workaround_queue",
        autoDispatch: true,
        hardGate: "Secrets must exist before live mutation or release.",
        actions: [
          {
            id: "ACT-SECRETS-001",
            type: "connector_fallback",
            description: "Switch the current task into fallback or bridge mode so the build can keep progressing.",
            target: "workaround_queue",
            autoDispatch: true,
            evidence: ["missing-secrets", "fallback-mode"]
          },
          {
            id: "ACT-SECRETS-002",
            type: "release_hold",
            description: "Hold release until the required secret contract is satisfied.",
            target: "release-gate",
            autoDispatch: false,
            evidence: ["release-hold", "secret-contract-required"]
          }
        ]
      };
    case "connector_mutation_blocked":
      return {
        blockerCode,
        severity: "high",
        status: "auto_remediation_queued",
        summary: `Connector mutation is blocked, so AUTO BUILDER reroutes into connector recovery${fallback ? ` using ${fallback.fallbackReceiptMode}` : " with a governed fallback"}.`,
        triggerSource,
        nextQueue: "connector_recovery_queue",
        autoDispatch: true,
        actions: [
          {
            id: "ACT-CONNECTOR-001",
            type: "reroute_queue",
            description: "Move the blocked job into connector recovery instead of stopping the build.",
            target: "connector_recovery_queue",
            autoDispatch: true,
            evidence: ["connector-blocked", "reroute-selected"]
          },
          {
            id: "ACT-CONNECTOR-002",
            type: "connector_fallback",
            description: fallback
              ? `Use ${fallback.fallbackReceiptMode} while the direct mutation surface is unavailable.`
              : "Use the best available bridge or receipt-based fallback path.",
            target: fallback?.connector ?? trigger.connector ?? "connector-fallback",
            autoDispatch: true,
            evidence: ["fallback-receipt", "build-can-continue"]
          }
        ]
      };
    case "migration_failed":
      return {
        blockerCode,
        severity: "high",
        status: "auto_remediation_queued",
        summary: "Database migration failure rerouted into connector recovery and SQL fallback so the app layer does not stall.",
        triggerSource,
        nextQueue: "connector_recovery_queue",
        autoDispatch: true,
        actions: [
          {
            id: "ACT-MIGRATION-001",
            type: "reroute_queue",
            description: "Retry the migration through the connector recovery lane.",
            target: "connector_recovery_queue",
            autoDispatch: true,
            evidence: ["migration-failed", "retry-through-recovery"]
          },
          {
            id: "ACT-MIGRATION-002",
            type: "connector_fallback",
            description: "Prepare governed SQL handoff while preserving the release hold on unapplied schema changes.",
            target: "SQL-fallback",
            autoDispatch: true,
            evidence: ["sql-handoff", "schema-gate"]
          }
        ]
      };
    case "preview_failed":
      return {
        blockerCode,
        severity: "high",
        status: "auto_remediation_queued",
        summary: "Preview failure rerouted into retry and hardening so the system can repair before any release decision.",
        triggerSource,
        nextQueue: "hardening_queue",
        autoDispatch: true,
        actions: [
          {
            id: "ACT-PREVIEW-001",
            type: "retry_queue",
            description: "Retry the preview path after applying the blocker-aware repair lane.",
            target: "vercel_preview_queue",
            autoDispatch: true,
            evidence: ["preview-retry", "smoke-required"]
          },
          {
            id: "ACT-PREVIEW-002",
            type: "reroute_queue",
            description: "Feed the preview blocker into hardening so the patch and smoke path stay connected.",
            target: "hardening_queue",
            autoDispatch: true,
            evidence: ["hardening-reroute", "release-still-blocked"]
          }
        ]
      };
    case "template_gap":
      return {
        blockerCode,
        severity: "medium",
        status: "auto_remediation_queued",
        summary: "Missing template coverage rerouted into workaround mode so a generic scaffold can keep the build moving.",
        triggerSource,
        nextQueue: "workaround_queue",
        autoDispatch: true,
        actions: [
          {
            id: "ACT-TEMPLATE-001",
            type: "generic_scaffold",
            description: "Swap to the generic scaffold path and capture the missing template as a future asset candidate.",
            target: "workaround_queue",
            autoDispatch: true,
            evidence: ["generic-scaffold", "template-gap-captured"]
          }
        ]
      };
    case "patch_conflict":
      return {
        blockerCode,
        severity: "medium",
        status: "auto_remediation_queued",
        summary: "Patch conflict rerouted into workaround mode with export-friendly instructions instead of halting the build.",
        triggerSource,
        nextQueue: "workaround_queue",
        autoDispatch: true,
        actions: [
          {
            id: "ACT-PATCH-001",
            type: "connector_fallback",
            description: "Convert the patch into a governed fallback path such as manual export or alternate file-level instructions.",
            target: "workaround_queue",
            autoDispatch: true,
            evidence: ["patch-conflict", "fallback-patch-plan"]
          }
        ]
      };
    case "route_smoke_failed":
      return {
        blockerCode,
        severity: "medium",
        status: "auto_remediation_queued",
        summary: "Route smoke failure stays inside the hardening lane until the route passes or a protected gate stops release.",
        triggerSource,
        nextQueue: "hardening_queue",
        autoDispatch: true,
        actions: [
          {
            id: "ACT-ROUTE-001",
            type: "reroute_queue",
            description: "Re-run the route through hardening and patch the failing endpoint.",
            target: "hardening_queue",
            autoDispatch: true,
            evidence: ["route-smoke-failed", "patch-required"]
          }
        ]
      };
    case "unknown_queue":
    case "unknown_blocker":
    default:
      return {
        blockerCode: blockerCode === "unknown_queue" ? blockerCode : "unknown_blocker",
        severity: "medium",
        status: "auto_remediation_queued",
        summary: "Unknown blocker routed into the generic workaround lane so AUTO BUILDER keeps moving while capturing evidence for future hardening.",
        triggerSource,
        nextQueue: "workaround_queue",
        autoDispatch: true,
        actions: [
          {
            id: "ACT-UNKNOWN-001",
            type: "reroute_queue",
            description: "Send the blocker into workaround mode and log it for future template or policy upgrades.",
            target: "workaround_queue",
            autoDispatch: true,
            evidence: ["unknown-blocker", "evidence-captured"]
          }
        ]
      };
  }
}

import type { AutoSocialOperation } from "@/lib/auto-social";

export type AutoSocialWorkflowStep = {
  id: string;
  operation: AutoSocialOperation;
  description: string;
  gate: "read_only" | "draft_only" | "autonomous_safe" | "owner_approval_required";
  retry: {
    attempts: number;
    backoffSeconds: number;
  };
};

export const edenSkyeEnterpriseWorkflow: AutoSocialWorkflowStep[] = [
  {
    id: "discover-signals",
    operation: "discover",
    description: "Read-only trend, benchmark, source, folder, and connector readiness discovery.",
    gate: "read_only",
    retry: { attempts: 2, backoffSeconds: 30 }
  },
  {
    id: "analyze-fit",
    operation: "analyze",
    description: "Score content, model, cohort, offer, platform, and risk fit.",
    gate: "autonomous_safe",
    retry: { attempts: 2, backoffSeconds: 30 }
  },
  {
    id: "create-drafts",
    operation: "create",
    description: "Create draft-only hooks, captions, scripts, prompts, reply drafts, and schedule candidates.",
    gate: "draft_only",
    retry: { attempts: 3, backoffSeconds: 45 }
  },
  {
    id: "quarantine-risk",
    operation: "quarantine",
    description: "Move uncertain, unsafe, or unapproved assets and engagement responses into quarantine.",
    gate: "draft_only",
    retry: { attempts: 2, backoffSeconds: 30 }
  },
  {
    id: "validate-receipts",
    operation: "validate",
    description: "Validate registry, queue states, approval gates, connector posture, and generated receipts.",
    gate: "autonomous_safe",
    retry: { attempts: 3, backoffSeconds: 60 }
  },
  {
    id: "heal-safe-failures",
    operation: "heal",
    description: "Auto-heal safe metadata, regenerate failed drafts, and reopen dead-letter tasks.",
    gate: "autonomous_safe",
    retry: { attempts: 2, backoffSeconds: 60 }
  },
  {
    id: "approve-live-action",
    operation: "approve",
    description: "Request owner approval before live post, reply, DM, n8n dispatch, browser action, or production migration.",
    gate: "owner_approval_required",
    retry: { attempts: 1, backoffSeconds: 0 }
  },
  {
    id: "schedule-approved",
    operation: "schedule",
    description: "Create Metricool/Xyla schedule records only after approval.",
    gate: "owner_approval_required",
    retry: { attempts: 1, backoffSeconds: 0 }
  },
  {
    id: "dispatch-approved-n8n",
    operation: "n8n-approved-dispatch",
    description: "Dispatch to n8n only after authenticated API readiness and explicit approval.",
    gate: "owner_approval_required",
    retry: { attempts: 1, backoffSeconds: 0 }
  }
];

export function getWorkflowReadiness() {
  return {
    workflow: "eden-skye-enterprise-auto-social",
    productionActionAllowed: false,
    steps: edenSkyeEnterpriseWorkflow,
    liveGates: [
      "publishing",
      "comments",
      "replies",
      "direct_messages",
      "n8n_dispatch",
      "browser_credentials",
      "payments",
      "production_migrations"
    ]
  };
}

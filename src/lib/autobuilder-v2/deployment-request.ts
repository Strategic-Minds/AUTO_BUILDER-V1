import { createReceipt } from "./receipts";

export type AutoBuilderDeploymentTarget = "preview" | "production";

export type AutoBuilderDeploymentRequest = {
  id: string;
  repo: string;
  branch: string;
  target: AutoBuilderDeploymentTarget;
  requestedBy: string;
  status: "queued" | "blocked" | "submitted";
  createdAt: string;
  notes: string[];
};

export function createDeploymentRequest(input: {
  repo?: string;
  branch?: string;
  target?: AutoBuilderDeploymentTarget;
  requestedBy?: string;
}) {
  const request: AutoBuilderDeploymentRequest = {
    id: `deploy_${Date.now()}`,
    repo: input.repo ?? "Strategic-Minds/AUTO_BUILDER",
    branch: input.branch ?? "feature/autobuilder-v2-universal-capability-bus",
    target: input.target ?? "preview",
    requestedBy: input.requestedBy ?? "autobuilder-v2-workflow",
    status: "queued",
    createdAt: new Date().toISOString(),
    notes: [
      "Deployment request created for Vercel workflow pickup.",
      "This helper does not store secrets or directly mutate production.",
      "Vercel deployment execution requires connected Vercel project/runtime pipeline."
    ]
  };

  const receipt = createReceipt({
    ok: true,
    provider: "vercel",
    action: `request_vercel_${request.target}_deployment`,
    category: "deploy",
    operation: "queue_deployment_request",
    requestedCapability: `Deploy ${request.repo}@${request.branch} to Vercel ${request.target}`,
    authStatus: "unknown",
    executionMode: "manual_receipt",
    status: "queued",
    projectId: request.repo,
    logs: request.notes,
    artifacts: ["deployment-request"],
    fallbackMode: "Queue deployment request for Vercel workflow or connected deployment pipeline.",
    nextActions: [
      "Verify Vercel project binding.",
      "Run build validation.",
      "Trigger preview deployment.",
      "Return deployment URL."
    ]
  });

  return { request, receipt };
}

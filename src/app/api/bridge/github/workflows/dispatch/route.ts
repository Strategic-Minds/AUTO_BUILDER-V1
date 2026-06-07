import {
  getRepoParts,
  githubRequest,
  isBridgeAuthorized,
  jsonError,
  normalizeDispatchBody,
  type WorkflowDispatchBody
} from "@/lib/bridges/githubWorkflowBridge";

export const dynamic = "force-dynamic";

function enforcePreviewLocks(inputs: Record<string, string>) {
  const environment = inputs.environment || "preview";
  const productionLocked = inputs.production_locked || "true";
  const shopifyLocked = inputs.shopify_mutation_locked || "true";

  if (environment !== "preview") {
    throw new Error("Workflow dispatch bridge is preview-only. environment must be preview.");
  }

  if (productionLocked !== "true") {
    throw new Error("production_locked must remain true.");
  }

  if (shopifyLocked !== "true") {
    throw new Error("shopify_mutation_locked must remain true.");
  }
}

export async function POST(request: Request) {
  try {
    if (!isBridgeAuthorized(request)) {
      return jsonError("Unauthorized bridge request", 401);
    }

    const body = (await request.json()) as WorkflowDispatchBody;
    const { repoFullName, workflowId, ref, inputs } = normalizeDispatchBody(body);
    enforcePreviewLocks(inputs);

    const { owner, repo } = getRepoParts(repoFullName);
    const payload = { ref, inputs };

    await githubRequest(`/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(workflowId)}/dispatches`, {
      method: "POST",
      body: payload
    });

    return Response.json({
      ok: true,
      dispatched: true,
      repo: `${owner}/${repo}`,
      workflow_id: workflowId,
      ref,
      inputs,
      locks: {
        production_locked: true,
        shopify_mutation_locked: true,
        environment: "preview"
      }
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unknown workflow dispatch error", 400);
  }
}

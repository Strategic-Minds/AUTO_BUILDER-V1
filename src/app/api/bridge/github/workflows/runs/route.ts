import { getRepoParts, githubRequest, isBridgeAuthorized, jsonError } from "@/lib/bridges/githubWorkflowBridge";

export const dynamic = "force-dynamic";

type GithubRun = {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  event: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
};

type GithubRunsResponse = {
  total_count: number;
  workflow_runs: GithubRun[];
};

export async function GET(request: Request) {
  try {
    if (!isBridgeAuthorized(request)) {
      return jsonError("Unauthorized bridge request", 401);
    }

    const url = new URL(request.url);
    const repoFullName = url.searchParams.get("repo") || url.searchParams.get("repository_full_name") || undefined;
    const workflowId = url.searchParams.get("workflow_id");
    const branch = url.searchParams.get("branch");
    const event = url.searchParams.get("event");
    const perPage = url.searchParams.get("per_page") || "20";
    const { owner, repo } = getRepoParts(repoFullName);

    const params = new URLSearchParams({ per_page: perPage });
    if (branch) params.set("branch", branch);
    if (event) params.set("event", event);

    const path = workflowId
      ? `/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(workflowId)}/runs?${params.toString()}`
      : `/repos/${owner}/${repo}/actions/runs?${params.toString()}`;

    const data = await githubRequest<GithubRunsResponse>(path);

    return Response.json({
      ok: true,
      repo: `${owner}/${repo}`,
      workflow_id: workflowId,
      total_count: data.total_count,
      runs: data.workflow_runs.map((run) => ({
        id: run.id,
        name: run.name,
        branch: run.head_branch,
        sha: run.head_sha,
        event: run.event,
        status: run.status,
        conclusion: run.conclusion,
        html_url: run.html_url,
        created_at: run.created_at,
        updated_at: run.updated_at
      }))
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unknown workflow runs error");
  }
}

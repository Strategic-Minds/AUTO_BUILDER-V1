import { getRepoParts, githubRequest, isBridgeAuthorized, jsonError } from "@/lib/bridges/githubWorkflowBridge";

export const dynamic = "force-dynamic";

type GithubWorkflow = {
  id: number;
  name: string;
  path: string;
  state: string;
  html_url: string;
};

type GithubWorkflowsResponse = {
  total_count: number;
  workflows: GithubWorkflow[];
};

export async function GET(request: Request) {
  try {
    if (!isBridgeAuthorized(request)) {
      return jsonError("Unauthorized bridge request", 401);
    }

    const url = new URL(request.url);
    const repoFullName = url.searchParams.get("repo") || url.searchParams.get("repository_full_name") || undefined;
    const { owner, repo } = getRepoParts(repoFullName);

    const data = await githubRequest<GithubWorkflowsResponse>(`/repos/${owner}/${repo}/actions/workflows`);

    return Response.json({
      ok: true,
      repo: `${owner}/${repo}`,
      total_count: data.total_count,
      workflows: data.workflows.map((workflow) => ({
        id: workflow.id,
        name: workflow.name,
        path: workflow.path,
        state: workflow.state,
        html_url: workflow.html_url
      }))
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unknown workflow list error");
  }
}

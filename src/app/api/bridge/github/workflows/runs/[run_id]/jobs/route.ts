import { getRepoParts, githubRequest, isBridgeAuthorized, jsonError } from "@/lib/bridges/githubWorkflowBridge";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ run_id: string }>;
};

type GithubJob = {
  id: number;
  run_id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  html_url: string;
};

type GithubJobsResponse = {
  total_count: number;
  jobs: GithubJob[];
};

export async function GET(request: Request, context: RouteContext) {
  try {
    if (!isBridgeAuthorized(request)) {
      return jsonError("Unauthorized bridge request", 401);
    }

    const { run_id: runId } = await context.params;
    const url = new URL(request.url);
    const repoFullName = url.searchParams.get("repo") || url.searchParams.get("repository_full_name") || undefined;
    const { owner, repo } = getRepoParts(repoFullName);

    const data = await githubRequest<GithubJobsResponse>(`/repos/${owner}/${repo}/actions/runs/${encodeURIComponent(runId)}/jobs`);

    return Response.json({
      ok: true,
      repo: `${owner}/${repo}`,
      run_id: Number(runId),
      total_count: data.total_count,
      jobs: data.jobs.map((job) => ({
        id: job.id,
        run_id: job.run_id,
        name: job.name,
        status: job.status,
        conclusion: job.conclusion,
        started_at: job.started_at,
        completed_at: job.completed_at,
        html_url: job.html_url
      }))
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unknown workflow jobs error");
  }
}

type GithubMethod = "GET" | "POST";

type GithubRequestOptions = {
  method?: GithubMethod;
  body?: unknown;
};

export type WorkflowDispatchBody = {
  repoFullName?: string;
  repository_full_name?: string;
  workflow_id: string;
  ref: string;
  inputs?: Record<string, string>;
};

const DEFAULT_REPO = "Strategic-Minds/EDENSKYESTUDIOS";

export function getRepoParts(repoFullName = DEFAULT_REPO) {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) {
    throw new Error("repoFullName must be in owner/name format");
  }
  return { owner, repo, repoFullName };
}

export function isBridgeAuthorized(request: Request) {
  const requiredToken = process.env.AUTO_BUILDER_BRIDGE_TOKEN;
  if (!requiredToken) return true;

  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const headerToken = request.headers.get("x-bridge-token") || "";

  return bearerToken === requiredToken || headerToken === requiredToken;
}

export function getGithubToken() {
  return process.env.GITHUB_TOKEN || process.env.GITHUB_PAT || process.env.AUTO_BUILDER_GITHUB_TOKEN || "";
}

export async function githubRequest<T>(path: string, options: GithubRequestOptions = {}): Promise<T> {
  const token = getGithubToken();
  if (!token) {
    throw new Error("Missing GitHub token. Set GITHUB_TOKEN, GITHUB_PAT, or AUTO_BUILDER_GITHUB_TOKEN.");
  }

  const response = await fetch(`https://api.github.com${path}`, {
    method: options.method || "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store"
  });

  if (response.status === 204) {
    return { ok: true, status: 204 } as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || response.statusText;
    throw new Error(`GitHub API ${response.status}: ${message}`);
  }

  return data as T;
}

export function jsonError(message: string, status = 500, details?: unknown) {
  return Response.json({ ok: false, error: message, details }, { status });
}

export function normalizeDispatchBody(body: WorkflowDispatchBody) {
  const repoFullName = body.repoFullName || body.repository_full_name || DEFAULT_REPO;
  if (!body.workflow_id) throw new Error("workflow_id is required");
  if (!body.ref) throw new Error("ref is required");

  return {
    repoFullName,
    workflowId: body.workflow_id,
    ref: body.ref,
    inputs: body.inputs || {}
  };
}

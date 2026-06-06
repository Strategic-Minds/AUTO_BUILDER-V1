import { NextRequest, NextResponse } from "next/server";
import { runGovernedGitCliBridge } from "@/lib/bridges/governedGitCliBridge";

function authorized(request: NextRequest) {
  const expected = process.env.GIT_CLI_BRIDGE_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${expected}`;
}

export async function GET() {
  return NextResponse.json({
    bridge: "git-cli",
    enabled: process.env.GIT_CLI_BRIDGE_ENABLED === "true",
    allowedReposConfigured: Boolean(process.env.GIT_CLI_ALLOWED_REPOS),
    safeOperations: [
      "status_short",
      "status_branch",
      "diff_stat",
      "diff_names",
      "diff",
      "log_oneline",
      "branch_current",
      "branch_list",
      "remote",
      "head",
      "head_branch",
      "checkout_new_branch",
      "switch_branch",
      "switch_new_branch",
      "add",
      "commit",
      "pull_ff_only",
      "fetch_prune",
      "push_branch"
    ],
    blockedByDefault: [
      "reset --hard",
      "clean -fd",
      "force push",
      "branch deletion",
      "history rewrite",
      "command chaining",
      "arbitrary shell"
    ]
  });
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await runGovernedGitCliBridge(body);
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Git CLI bridge failed."
      },
      { status: 400 }
    );
  }
}

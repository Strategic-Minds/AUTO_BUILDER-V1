import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type GitCliBridgeRequest = {
  repoPath?: string;
  operation?: string;
  args?: string[];
  reason?: string;
  requestedBy?: string;
  approvalPhrase?: string;
};

export type GitCliBridgeResult = {
  ok: boolean;
  operation: string;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  receipt: Record<string, unknown>;
};

const READ_OPERATIONS = new Map<string, string[]>([
  ["status_short", ["status", "--short"]],
  ["status_branch", ["status", "--branch", "--short"]],
  ["diff_stat", ["diff", "--stat"]],
  ["diff_names", ["diff", "--name-only"]],
  ["diff", ["diff"]],
  ["log_oneline", ["log", "--oneline"]],
  ["branch_current", ["branch", "--show-current"]],
  ["branch_list", ["branch", "--list"]],
  ["remote", ["remote", "-v"]],
  ["head", ["rev-parse", "HEAD"]],
  ["head_branch", ["rev-parse", "--abbrev-ref", "HEAD"]]
]);

const WRITE_OPERATIONS = new Set([
  "checkout_new_branch",
  "switch_branch",
  "switch_new_branch",
  "add",
  "commit",
  "pull_ff_only",
  "fetch_prune",
  "push_branch"
]);

const BLOCKED_TOKENS = [
  ";",
  "&&",
  "||",
  "`",
  "$(",
  "--force",
  "--force-with-lease",
  "reset",
  "clean",
  "filter-branch",
  "branch -D",
  "checkout --"
];

const DESTRUCTIVE_APPROVAL =
  process.env.GIT_CLI_DESTRUCTIVE_APPROVAL_PHRASE || "APPROVE GIT DESTRUCTIVE EXECUTION";

function allowedRepos() {
  return (process.env.GIT_CLI_ALLOWED_REPOS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isSubpath(candidate: string, allowed: string) {
  const relative = path.relative(allowed, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function resolveRepoPath(repoPath?: string) {
  if (!repoPath) throw new Error("Missing repoPath.");

  const resolved = path.resolve(repoPath);
  const allowed = allowedRepos().map((item) => path.resolve(item));

  if (allowed.length === 0) {
    throw new Error("No allowed repositories configured.");
  }

  if (!allowed.some((allowedPath) => isSubpath(resolved, allowedPath))) {
    throw new Error("repoPath is outside configured allowlist.");
  }

  return resolved;
}

function rejectUnsafeArgs(args: string[]) {
  const joined = args.join(" ");
  for (const token of BLOCKED_TOKENS) {
    if (joined.includes(token)) {
      throw new Error(`Blocked unsafe Git token: ${token}`);
    }
  }
}

function buildGitArgs(input: GitCliBridgeRequest) {
  const operation = input.operation || "";
  const args = Array.isArray(input.args) ? input.args.map(String) : [];

  if (READ_OPERATIONS.has(operation)) {
    const base = READ_OPERATIONS.get(operation)!;
    if (operation === "log_oneline") {
      const limit = args[0] && /^\d+$/.test(args[0]) ? args[0] : "20";
      return { safeClass: "read", gitArgs: [...base, "-n", limit] };
    }
    return { safeClass: "read", gitArgs: base };
  }

  if (!WRITE_OPERATIONS.has(operation)) {
    throw new Error(`Unsupported Git operation: ${operation}`);
  }

  rejectUnsafeArgs(args);

  switch (operation) {
    case "checkout_new_branch":
      if (!args[0]) throw new Error("checkout_new_branch requires branch name.");
      return { safeClass: "write", gitArgs: ["checkout", "-b", args[0]] };
    case "switch_branch":
      if (!args[0]) throw new Error("switch_branch requires branch name.");
      return { safeClass: "write", gitArgs: ["switch", args[0]] };
    case "switch_new_branch":
      if (!args[0]) throw new Error("switch_new_branch requires branch name.");
      return { safeClass: "write", gitArgs: ["switch", "-c", args[0]] };
    case "add":
      if (args.length === 0) throw new Error("add requires at least one path.");
      return { safeClass: "write", gitArgs: ["add", ...args] };
    case "commit":
      if (!args[0]) throw new Error("commit requires message.");
      return { safeClass: "write", gitArgs: ["commit", "-m", args[0]] };
    case "pull_ff_only":
      return { safeClass: "write", gitArgs: ["pull", "--ff-only"] };
    case "fetch_prune":
      return { safeClass: "write", gitArgs: ["fetch", "--prune"] };
    case "push_branch":
      if (!args[0]) throw new Error("push_branch requires branch name.");
      return { safeClass: "write", gitArgs: ["push", "origin", args[0]] };
    default:
      throw new Error(`Unhandled Git operation: ${operation}`);
  }
}

export async function runGovernedGitCliBridge(
  input: GitCliBridgeRequest
): Promise<GitCliBridgeResult> {
  if (process.env.GIT_CLI_BRIDGE_ENABLED !== "true") {
    throw new Error("Git CLI bridge is disabled.");
  }

  const repoPath = resolveRepoPath(input.repoPath);
  const operation = input.operation || "";
  const { safeClass, gitArgs } = buildGitArgs(input);

  const destructiveRequested = safeClass === "destructive";
  if (destructiveRequested && input.approvalPhrase !== DESTRUCTIVE_APPROVAL) {
    throw new Error("Destructive Git operation requires exact approval phrase.");
  }

  try {
    const result = await execFileAsync("git", gitArgs, {
      cwd: repoPath,
      timeout: 120000,
      maxBuffer: 1024 * 1024
    });

    return {
      ok: true,
      operation,
      command: `git ${gitArgs.join(" ")}`,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: 0,
      receipt: {
        targetSystem: "git",
        operation,
        safeClass,
        repoPath,
        command: `git ${gitArgs.join(" ")}`,
        blocked: false,
        requestedBy: input.requestedBy || "unknown",
        reason: input.reason || "",
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; code?: number; message?: string };
    return {
      ok: false,
      operation,
      command: `git ${gitArgs.join(" ")}`,
      stdout: err.stdout || "",
      stderr: err.stderr || err.message || "",
      exitCode: typeof err.code === "number" ? err.code : 1,
      receipt: {
        targetSystem: "git",
        operation,
        safeClass,
        repoPath,
        command: `git ${gitArgs.join(" ")}`,
        blocked: false,
        requestedBy: input.requestedBy || "unknown",
        reason: input.reason || "",
        timestamp: new Date().toISOString(),
        error: err.message || "Git command failed."
      }
    };
  }
}

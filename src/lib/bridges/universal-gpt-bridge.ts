import { randomUUID } from "node:crypto";
import { exec as execCallback } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSecretNameInventory } from "./secret-name-bridge";

const exec = promisify(execCallback);

export type UniversalBridgeAction =
  | "secrets.listNames"
  | "codex.listFiles"
  | "codex.readFile"
  | "codex.writeFile"
  | "codex.execute"
  | "git.status"
  | "git.execute"
  | "vercel.execute"
  | "supabase.execute"
  | "drive.execute"
  | "shopify.execute"
  | "heygen.execute"
  | "metricool.execute";

export type UniversalBridgeRequest = {
  action?: UniversalBridgeAction;
  token?: string;
  approved?: boolean;
  payload?: Record<string, unknown>;
};

export type UniversalBridgeResult = {
  status: "ok" | "blocked" | "error";
  action?: UniversalBridgeAction;
  receipt: Record<string, unknown>;
};

const mutationActions = new Set<UniversalBridgeAction>([
  "codex.writeFile",
  "codex.execute",
  "git.execute",
  "vercel.execute",
  "supabase.execute",
  "drive.execute",
  "shopify.execute",
  "heygen.execute",
  "metricool.execute"
]);

const deniedCommandFragments = [
  "rm -rf /",
  "mkfs",
  "dd if=",
  "shutdown",
  "reboot",
  "poweroff",
  "diskpart",
  "format "
];

export async function runUniversalGptBridge(request: UniversalBridgeRequest): Promise<UniversalBridgeResult> {
  const gate = requireUniversalBridgeEnabled(request);
  if (gate) return gate;

  const action = request.action as UniversalBridgeAction;
  const payload = request.payload ?? {};

  try {
    if (action === "secrets.listNames") {
      return ok(action, { inventory: getSecretNameInventory() });
    }

    if (action === "codex.listFiles") {
      const relativePath = optionalString(payload, "relativePath", ".");
      const root = getWorkspaceRoot();
      const directory = resolveInsideRoot(root, relativePath);
      const entries = await readdir(directory, { withFileTypes: true });
      return ok(action, {
        root,
        relativePath,
        entries: entries.map((entry) => ({ name: entry.name, type: entry.isDirectory() ? "directory" : "file" }))
      });
    }

    if (action === "codex.readFile") {
      const relativePath = requireString(payload, "relativePath");
      const root = getWorkspaceRoot();
      const filePath = resolveInsideRoot(root, relativePath);
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) throw new Error("Requested path is not a file");
      const maxBytes = optionalNumber(payload, "maxBytes", 200000);
      if (fileStat.size > maxBytes) throw new Error(`File exceeds maxBytes: ${fileStat.size}`);
      return ok(action, { root, relativePath, content: await readFile(filePath, "utf8") });
    }

    if (action === "codex.writeFile") {
      const relativePath = requireString(payload, "relativePath");
      const content = requireString(payload, "content");
      const root = getWorkspaceRoot();
      const filePath = resolveInsideRoot(root, relativePath);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content, "utf8");
      return ok(action, { root, relativePath, bytesWritten: Buffer.byteLength(content, "utf8") });
    }

    if (action === "codex.execute" || action.endsWith(".execute") || action === "git.status") {
      const command = action === "git.status" ? "git status --short" : requireString(payload, "command");
      if (deniedCommandFragments.some((fragment) => command.includes(fragment))) {
        return blocked(action, { reason: "Command denied by bridge policy", command });
      }
      const root = getWorkspaceRoot();
      const cwd = resolveInsideRoot(root, optionalString(payload, "cwd", "."));
      const timeout = optionalNumber(payload, "timeoutMs", 120000);
      const result = await exec(command, { cwd, timeout, maxBuffer: 1024 * 1024 * 5 });
      return ok(action, {
        root,
        cwd,
        command,
        stdout: result.stdout.slice(-20000),
        stderr: result.stderr.slice(-20000)
      });
    }

    return blocked(action, { reason: "Unsupported bridge action" });
  } catch (error) {
    return {
      status: "error",
      action,
      receipt: baseReceipt({ error: error instanceof Error ? error.message : String(error) })
    };
  }
}

function requireUniversalBridgeEnabled(request: UniversalBridgeRequest): UniversalBridgeResult | null {
  if (process.env.AUTO_BUILDER_UNIVERSAL_BRIDGE_ENABLED !== "true") {
    return blocked(request.action, {
      reason: "AUTO_BUILDER_UNIVERSAL_BRIDGE_ENABLED is not true",
      requiredEnv: ["AUTO_BUILDER_UNIVERSAL_BRIDGE_ENABLED", "AUTO_BUILDER_UNIVERSAL_BRIDGE_TOKEN"]
    });
  }

  const expectedToken = process.env.AUTO_BUILDER_UNIVERSAL_BRIDGE_TOKEN ?? process.env.AUTO_BUILDER_WORKER_TOKEN;
  if (!expectedToken || request.token !== expectedToken) {
    return blocked(request.action, {
      reason: "Universal bridge token missing or invalid",
      requiredEnv: ["AUTO_BUILDER_UNIVERSAL_BRIDGE_TOKEN"]
    });
  }

  if (!request.action) return blocked(undefined, { reason: "Missing action" });

  if (mutationActions.has(request.action) && request.approved !== true) {
    return blocked(request.action, { reason: "Explicit approval is required for this action", requiredField: "approved: true" });
  }

  return null;
}

function getWorkspaceRoot() {
  return path.resolve(process.env.BRIDGE_WORKSPACE_ROOT ?? process.env.CODEX_WORKSPACE_ROOT ?? process.cwd());
}

function resolveInsideRoot(root: string, relativePath: string) {
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error("Path escapes BRIDGE_WORKSPACE_ROOT");
  }
  return resolved;
}

function requireString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing required payload.${key}`);
  return value;
}

function optionalString(payload: Record<string, unknown>, key: string, fallback: string) {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function optionalNumber(payload: Record<string, unknown>, key: string, fallback: number) {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function ok(action: UniversalBridgeAction, receipt: Record<string, unknown>): UniversalBridgeResult {
  return { status: "ok", action, receipt: baseReceipt(receipt) };
}

function blocked(action: UniversalBridgeAction | undefined, receipt: Record<string, unknown>): UniversalBridgeResult {
  return { status: "blocked", action, receipt: baseReceipt(receipt) };
}

function baseReceipt(receipt: Record<string, unknown>) {
  return {
    receiptId: randomUUID(),
    generatedAt: new Date().toISOString(),
    ...receipt
  };
}

export type SandboxWritableFile = {
  path: string;
  content: string;
  mode?: number;
};

export type SandboxTaskInput = {
  jobId: string;
  label: string;
  runtime?: "node24" | "node22" | "python3.13";
  timeoutMs?: number;
  allowNetwork?: boolean;
  files?: SandboxWritableFile[];
  command: {
    cmd: string;
    args?: string[];
    cwd?: string;
    env?: Record<string, string>;
  };
  artifactPath?: string;
};

export type SandboxTaskResult = {
  ok: boolean;
  skipped?: boolean;
  mode: "disabled" | "vercel_sandbox" | "error";
  jobId: string;
  label: string;
  reason?: string;
  runtime: "node24" | "node22" | "python3.13";
  networkPolicy: "allow-all" | "deny-all";
  sandboxId?: string;
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
  artifact?: unknown;
};

export function sandboxRuntimeStatus() {
  return {
    enabled: process.env.AUTO_BUILDER_SANDBOX_ENABLED === "true",
    oidcTokenAvailable: Boolean(process.env.VERCEL_OIDC_TOKEN),
    accessTokenAvailable: Boolean(process.env.VERCEL_TOKEN),
    projectIdConfigured: Boolean(process.env.VERCEL_PROJECT_ID),
    defaultRuntime: "node24" as const
  };
}

export async function runSandboxTask(task: SandboxTaskInput): Promise<SandboxTaskResult> {
  const runtime = task.runtime ?? "node24";
  const networkPolicy = task.allowNetwork ? "allow-all" : "deny-all";
  const status = sandboxRuntimeStatus();

  if (!status.enabled) {
    return {
      ok: false,
      skipped: true,
      mode: "disabled",
      jobId: task.jobId,
      label: task.label,
      reason: "AUTO_BUILDER_SANDBOX_ENABLED is not true.",
      runtime,
      networkPolicy
    };
  }

  let sandbox: {
    sandboxId: string;
    writeFiles: (files: { path: string; content: Buffer; mode?: number }[]) => Promise<void>;
    runCommand: (command: {
      cmd: string;
      args?: string[];
      cwd?: string;
      env?: Record<string, string>;
    }) => Promise<{
      exitCode: number | null;
      stdout: () => Promise<string>;
      stderr: () => Promise<string>;
    }>;
    readFileToBuffer: (input: { path: string }) => Promise<Buffer | null>;
    stop: () => Promise<unknown>;
  } | null = null;

  try {
    const { Sandbox } = await import("@vercel/sandbox");
    sandbox = await Sandbox.create({
      runtime,
      timeout: task.timeoutMs ?? 300_000,
      networkPolicy,
      env: {
        NODE_ENV: "production"
      }
    });

    if (task.files && task.files.length > 0) {
      await sandbox.writeFiles(
        task.files.map((file) => ({
          path: file.path,
          content: Buffer.from(file.content),
          ...(typeof file.mode === "number" ? { mode: file.mode } : {})
        }))
      );
    }

    const command = await sandbox.runCommand({
      cmd: task.command.cmd,
      args: task.command.args,
      cwd: task.command.cwd,
      env: task.command.env
    });

    let artifact: unknown = null;
    if (task.artifactPath) {
      const artifactBuffer = await sandbox.readFileToBuffer({ path: task.artifactPath });
      if (artifactBuffer) {
        const text = artifactBuffer.toString("utf8");
        artifact = text ? JSON.parse(text) : null;
      }
    }

    return {
      ok: command.exitCode === 0,
      mode: "vercel_sandbox",
      jobId: task.jobId,
      label: task.label,
      runtime,
      networkPolicy,
      sandboxId: sandbox.sandboxId,
      exitCode: command.exitCode,
      stdout: await command.stdout(),
      stderr: await command.stderr(),
      artifact
    };
  } catch (error) {
    return {
      ok: false,
      mode: "error",
      jobId: task.jobId,
      label: task.label,
      reason: error instanceof Error ? error.message : String(error),
      runtime,
      networkPolicy
    };
  } finally {
    if (sandbox) {
      await sandbox.stop().catch(() => undefined);
    }
  }
}

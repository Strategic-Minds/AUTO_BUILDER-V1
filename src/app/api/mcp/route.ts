import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

export const runtime = "nodejs";

const repoFiles: Record<string, string> = {
  "README.md": `# AUTO BUILDER Bridge

GPT remains the orchestration brain. Cloud workers and bridges execute recurring operations. Codex is reserved for implementation runtime tasks.
`,
  "docs/handoffs/dev-handoff.md": `# Dev Handoff

## Current objective
Transform xps-ai-factory into a top-ceiling autonomous platform that can:
- build frontend/backend systems rapidly
- onboard connectors quickly
- validate browser/API flows
- deploy to Railway
- support XPS Intelligence and Contractor OS
`,
  "docs/prompts/repo-discovery.prompt.md": `Inspect this repository completely before making changes.
Treat GitHub remote as source of truth, Docker local as runtime truth, and Railway as deploy target.
Use repo-local skills where relevant.
Produce:
1. repo map
2. stack detection
3. env/config contract
4. validation plan
5. top implementation priorities
Do not implement yet.
`,
  "apps/control-plane/package.json": JSON.stringify(
    {
      name: "@xps-ai-factory/control-plane",
      private: true,
      version: "0.1.0",
      scripts: {
        dev: "node server.js",
        start: "node server.js",
        lint: "echo lint placeholder",
        test: "echo test placeholder"
      }
    },
    null,
    2
  )
};

const resources = [
  {
    uri: "xps://README.md",
    name: "Repo README",
    description: "Top-level repository overview and MCP usage notes.",
    mimeType: "text/markdown",
    path: "README.md"
  },
  {
    uri: "xps://docs/handoffs/dev-handoff.md",
    name: "Dev Handoff",
    description: "Project handoff notes and operating assumptions.",
    mimeType: "text/markdown",
    path: "docs/handoffs/dev-handoff.md"
  },
  {
    uri: "xps://docs/prompts/repo-discovery.prompt.md",
    name: "Repo Discovery Prompt",
    description: "Prompt used to orient discovery inside this repo.",
    mimeType: "text/markdown",
    path: "docs/prompts/repo-discovery.prompt.md"
  },
  {
    uri: "xps://apps/control-plane/package.json",
    name: "Control Plane Package",
    description: "Package metadata for the control-plane app.",
    mimeType: "application/json",
    path: "apps/control-plane/package.json"
  }
] as const;

const visibleRepoPaths = [
  ".",
  "README.md",
  "docs",
  "docs/handoffs",
  "docs/handoffs/dev-handoff.md",
  "docs/prompts",
  "docs/prompts/repo-discovery.prompt.md",
  "apps",
  "apps/control-plane",
  "apps/control-plane/package.json"
] as const;

function buildRepoSummary() {
  return {
    repoRoot: "remote-bundled-content",
    rootPackageName: "auto-builder-bridge",
    rootScripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      "validate:factory": "node scripts/validate-factory.mjs"
    },
    controlPlanePackageName: "@xps-ai-factory/control-plane",
    controlPlaneScripts: {
      dev: "node server.js",
      start: "node server.js",
      lint: "echo lint placeholder",
      test: "echo test placeholder"
    },
    keyPaths: {
      readme: "README.md",
      controlPlanePackage: "apps/control-plane/package.json",
      devHandoff: "docs/handoffs/dev-handoff.md",
      repoDiscoveryPrompt: "docs/prompts/repo-discovery.prompt.md"
    }
  };
}

function readBundledFile(path: string) {
  const value = repoFiles[path];
  if (!value) {
    throw new Error(`Unknown path: ${path}`);
  }
  return value;
}

function readTextFile(path: string, startLine?: number, endLine?: number) {
  const text = readBundledFile(path);
  const lines = text.split(/\r?\n/);
  const firstLine = Math.max(1, Number(startLine ?? 1));
  const lastLine = Math.min(lines.length, Number(endLine ?? lines.length));

  if (lastLine < firstLine) {
    throw new Error("endLine must be greater than or equal to startLine");
  }

  const content = lines
    .slice(firstLine - 1, lastLine)
    .map((line, index) => `${firstLine + index}: ${line}`)
    .join("\n");

  return {
    path,
    startLine: firstLine,
    endLine: lastLine,
    content
  };
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "health_check",
      {
        title: "Health Check",
        description: "Use this before other calls to confirm the remote MCP server is alive.",
        inputSchema: {}
      },
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "ok",
                service: "xps-ai-factory-control-plane",
                transport: "streamable-http",
                environment: process.env.VERCEL ? "vercel" : "local",
                timestamp: new Date().toISOString()
              },
              null,
              2
            )
          }
        ]
      })
    );

    server.registerTool(
      "read_bootstrap_status",
      {
        title: "Read Bootstrap Status",
        description: "Inspect the bundled control-plane package metadata and bootstrap entrypoints.",
        inputSchema: {}
      },
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                packageJsonPath: "apps/control-plane/package.json",
                scripts: buildRepoSummary().controlPlaneScripts,
                bundledPaths: visibleRepoPaths
              },
              null,
              2
            )
          }
        ]
      })
    );

    server.registerTool(
      "get_repo_summary",
      {
        title: "Get Repo Summary",
        description: "Use this first for repo discovery. It returns the key scripts, package names, and file entrypoints exposed by this MCP.",
        inputSchema: {}
      },
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(buildRepoSummary(), null, 2)
          }
        ]
      })
    );

    server.registerTool(
      "list_repo_files",
      {
        title: "List Repo Files",
        description: "List the bundled repo paths this remote MCP exposes.",
        inputSchema: {
          subpath: z.string().optional(),
          maxDepth: z.number().int().min(0).max(8).optional(),
          limit: z.number().int().min(1).max(500).optional()
        }
      },
      async ({ subpath, limit }) => {
        const prefix = subpath ? subpath.replace(/\/$/, "") : ".";
        const items = visibleRepoPaths
          .filter((item) => prefix === "." || item === prefix || item.startsWith(`${prefix}/`))
          .slice(0, limit ?? 200)
          .map((item) => ({
            path: item,
            type:
              item === "." ||
              item === "docs" ||
              item === "docs/handoffs" ||
              item === "docs/prompts" ||
              item === "apps" ||
              item === "apps/control-plane"
                ? "directory"
                : "file"
          }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(items, null, 2)
            }
          ]
        };
      }
    );

    server.registerTool(
      "read_text_file",
      {
        title: "Read Text File",
        description: "Read a bundled UTF-8 file from this remote MCP server, optionally constrained to a line range.",
        inputSchema: {
          path: z.string(),
          startLine: z.number().int().min(1).optional(),
          endLine: z.number().int().min(1).optional()
        }
      },
      async ({ path, startLine, endLine }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(readTextFile(path, startLine, endLine), null, 2)
          }
        ]
      })
    );

    for (const resource of resources) {
      server.registerResource(
        resource.name,
        resource.uri,
        {
          title: resource.name,
          description: resource.description,
          mimeType: resource.mimeType
        },
        async () => ({
          contents: [
            {
              uri: resource.uri,
              mimeType: resource.mimeType,
              text: readBundledFile(resource.path)
            }
          ]
        })
      );
    }

    server.registerPrompt(
      "repo_discovery",
      {
        title: "Repo Discovery",
        description: "Prompt template for orienting work inside AUTO BUILDER."
      },
      async () => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: readBundledFile("docs/prompts/repo-discovery.prompt.md")
            }
          }
        ]
      })
    );
  },
  {
    instructions:
      "Use this server for repo inspection and control-plane discovery tasks. Prefer get_repo_summary first, then list_repo_files, then read_text_file."
  },
  {
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: false
  }
);

export { handler as GET, handler as POST, handler as DELETE };

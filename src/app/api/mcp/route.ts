import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

import {
  audit,
  entryPrompts,
  factorySurfaces,
  providers,
  readiness,
  repoRoles,
  workflow
} from "@/lib/autobuilder";
import {
  buildCapabilityTestMatrix,
  buildPacketFromIdea,
  buildPassiveReverseEngineeringPlan,
  capabilityTests,
  classifyIdea,
  connectorOps,
  factoryReadiness,
  fastPathRoutes,
  hardeningPipeline,
  reverseEngineeringLanes,
  templateLibrary
} from "@/lib/factory";
import { registerSocialMcpTools } from "@/lib/autobuilder/social-mcp-tools";

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
  ),
  "factory/connector-ops.json": JSON.stringify(connectorOps, null, 2),
  "factory/template-library.json": JSON.stringify(templateLibrary, null, 2),
  "factory/capability-matrix.json": JSON.stringify(buildCapabilityTestMatrix(), null, 2),
  "factory/reverse-engineering-lanes.json": JSON.stringify(reverseEngineeringLanes, null, 2)
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
  },
  {
    uri: "xps://factory/connector-ops.json",
    name: "Connector Registry",
    description: "Connector readiness, mutation surfaces, and fallback modes.",
    mimeType: "application/json",
    path: "factory/connector-ops.json"
  },
  {
    uri: "xps://factory/template-library.json",
    name: "Template Library",
    description: "Reusable template packs for launch and automation systems.",
    mimeType: "application/json",
    path: "factory/template-library.json"
  },
  {
    uri: "xps://factory/capability-matrix.json",
    name: "Capability Matrix",
    description: "Capability tests, hardening, and connector readiness matrix.",
    mimeType: "application/json",
    path: "factory/capability-matrix.json"
  },
  {
    uri: "xps://factory/reverse-engineering-lanes.json",
    name: "Reverse Engineering Lanes",
    description: "Passive research and system extraction lanes.",
    mimeType: "application/json",
    path: "factory/reverse-engineering-lanes.json"
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
  "apps/control-plane/package.json",
  "factory",
  "factory/connector-ops.json",
  "factory/template-library.json",
  "factory/capability-matrix.json",
  "factory/reverse-engineering-lanes.json"
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
    repos: repoRoles,
    providers,
    workflow,
    factorySurfaces,
    keyPaths: {
      readme: "README.md",
      controlPlanePackage: "apps/control-plane/package.json",
      devHandoff: "docs/handoffs/dev-handoff.md",
      repoDiscoveryPrompt: "docs/prompts/repo-discovery.prompt.md",
      connectorRegistry: "factory/connector-ops.json",
      templateLibrary: "factory/template-library.json",
      capabilityMatrix: "factory/capability-matrix.json"
    }
  };
}

function buildSystemTopology() {
  return {
    system: "AUTO BUILDER Bridge Brain",
    repos: repoRoles,
    providers,
    workflow,
    factory: {
      readiness,
      readinessScore: factoryReadiness,
      surfaces: factorySurfaces,
      audit,
      entryPrompts
    },
    coverage: {
      fastPathRoutes: fastPathRoutes.length,
      templatePacks: templateLibrary.length,
      connectors: connectorOps.length,
      capabilityTests: capabilityTests.length,
      hardeningTests: hardeningPipeline.length,
      reverseEngineeringLanes: reverseEngineeringLanes.length
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

function buildConnectorActivationPlan(objective?: string, preferredConnectors?: string[]) {
  const selected = preferredConnectors?.length
    ? connectorOps.filter((connector) => preferredConnectors.includes(connector.connector))
    : connectorOps;

  return {
    objective: objective ?? "Maximum governed connectivity across the AUTO BUILDER operating stack.",
    selectionCount: selected.length,
    deploymentOrder: [
      "Read-only discovery and receipts",
      "Sandbox mutation tests",
      "Approval-gated live mutations",
      "Autonomous queue execution",
      "Analytics and optimization loop"
    ],
    connectors: selected,
    warnings: [
      "Universal connectivity does not mean every app can be mutated safely without app-specific auth and testing.",
      "High-risk surfaces remain approval-gated until validated.",
      "The fastest path is broad read access first, then controlled writes by connector class."
    ]
  };
}

function buildGovernancePolicy() {
  return {
    defaultMode: "Maximum governed autonomy",
    autonomousByDefault: [
      "read-only research",
      "stack inspection",
      "workflow design",
      "task packet creation",
      "connector planning",
      "content planning",
      "queue design",
      "capability testing plan generation",
      "reverse-engineering plan generation"
    ],
    approvalRequired: [
      "production deploys",
      "billing or financial mutations",
      "store writes",
      "schema migrations",
      "auto-publish to external channels",
      "external messages or outbound calls",
      "live environment variable changes"
    ],
    connectorPolicy: connectorOps.map((connector) => ({
      connector: connector.connector,
      readiness: connector.readiness,
      approvalGate: connector.approvalGate,
      fallbackReceiptMode: connector.fallbackReceiptMode
    })),
    hardeningRequired: hardeningPipeline.filter((test) => test.required)
  };
}

function buildContentCommerceMachine(args: {
  brandName: string;
  niche: string;
  offers?: string[];
  channels?: string[];
  monetization?: string[];
  autonomyLevel?: string;
}) {
  const offers = args.offers?.length ? args.offers : ["core offer", "entry offer", "upsell"];
  const channels = args.channels?.length
    ? args.channels
    : ["Instagram", "TikTok", "Facebook", "YouTube Shorts", "LinkedIn", "X"];
  const monetization = args.monetization?.length
    ? args.monetization
    : ["direct offer sales", "lead capture", "high-ticket closers", "digital products", "affiliate revenue"];

  return {
    brand: args.brandName,
    niche: args.niche,
    autonomyLevel: args.autonomyLevel ?? "governed-autonomous",
    offers,
    channels,
    monetization,
    operatingModel: {
      contentLoop: [
        "idea mining",
        "hook generation",
        "script generation",
        "asset creation",
        "clip repurposing",
        "approval gate",
        "publishing",
        "engagement analysis",
        "revenue attribution",
        "iteration"
      ],
      commerceLoop: [
        "offer selection",
        "traffic routing",
        "lead capture",
        "checkout or booking",
        "post-purchase follow-up",
        "upsell",
        "retention"
      ],
      intelligenceLoop: [
        "reverse engineering",
        "competitor pattern capture",
        "winner extraction",
        "template updates",
        "queue reprioritization"
      ]
    },
    stackUse: {
      commerce: ["Shopify", "Stripe"],
      orchestration: ["ChatGPT", "OpenAI", "Codex"],
      memoryAndLogs: ["Supabase", "Google Sheets", "Google Drive"],
      publishing: ["Xyla", "Facebook"],
      repurposing: ["Opus"],
      releaseAndDelivery: ["GitHub", "Vercel"]
    },
    automationQueues: [
      "idea-intake",
      "content-briefs",
      "asset-generation",
      "repurpose-queue",
      "approval-queue",
      "publish-queue",
      "analytics-sync",
      "revenue-attribution",
      "optimization-loop"
    ],
    firstSevenDays: [
      "Lock the fastest cash offer and one CTA.",
      "Generate 30 content hooks tied to that offer.",
      "Build 7 short-form scripts and 3 longer authority assets.",
      "Set one publishing cadence per primary channel.",
      "Connect attribution from content to lead capture to sale.",
      "Review winning hooks, CTR, leads, and revenue daily.",
      "Double down on the top 20 percent of outputs."
    ],
    constraints: [
      "Universal app connectivity still requires app-specific auth and testing.",
      "Autonomy increases only after each connector passes receipts, replay, and hardening checks.",
      "Publishing and financial surfaces should remain governed until proven stable."
    ]
  };
}

function buildUniversalIntegrationBlueprint(args: {
  businessObjective: string;
  sourceSystems?: string[];
  targetSystems?: string[];
  trigger?: string;
}) {
  const sourceSystems = args.sourceSystems?.length ? args.sourceSystems : ["Shopify", "Google Drive", "Supabase"];
  const targetSystems = args.targetSystems?.length ? args.targetSystems : ["Xyla", "Facebook", "Supabase", "Slack"];

  return {
    businessObjective: args.businessObjective,
    trigger: args.trigger ?? "new asset, new product event, or new campaign brief",
    sourceSystems,
    targetSystems,
    integrationPattern: {
      orchestrationBrain: "ChatGPT + AUTO BUILDER MCP",
      stateLayer: "Supabase",
      eventFlow: [
        "trigger received",
        "payload normalized",
        "routing decision",
        "queue receipt created",
        "worker execution",
        "approval gate when required",
        "delivery receipt",
        "analytics sync",
        "optimization feedback"
      ],
      reliability: [
        "idempotency key",
        "retry policy",
        "dead-letter queue",
        "audit receipt",
        "operator escalation"
      ]
    },
    connectorPlan: buildConnectorActivationPlan(args.businessObjective, [...sourceSystems, ...targetSystems]),
    minimumDataContract: {
      eventId: "stable unique ID",
      source: "origin system",
      target: "destination system",
      payloadVersion: "schema version",
      status: "queued | running | blocked | approved | delivered | failed",
      approvalState: "not-required | pending | approved | rejected",
      receipt: "URL, ID, or structured evidence",
      analyticsKey: "join key for attribution"
    }
  };
}

const handler = createMcpHandler(
  (server) => {
    registerSocialMcpTools(server as any);
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
                providers: providers.length,
                connectors: connectorOps.length,
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
                bundledPaths: visibleRepoPaths,
                repos: repoRoles,
                providers
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
              item === "apps/control-plane" ||
              item === "factory"
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

    server.registerTool(
      "get_system_topology",
      {
        title: "Get System Topology",
        description: "Return the full AUTO BUILDER stack map, workflow, providers, factory surfaces, and coverage counts.",
        inputSchema: {}
      },
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(buildSystemTopology(), null, 2)
          }
        ]
      })
    );

    server.registerTool(
      "classify_automation_opportunity",
      {
        title: "Classify Automation Opportunity",
        description: "Classify a business idea into the best factory route, risk class, speed path, and escalation posture.",
        inputSchema: {
          idea: z.string()
        }
      },
      async ({ idea }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(classifyIdea(idea), null, 2)
          }
        ]
      })
    );

    server.registerTool(
      "build_execution_packet",
      {
        title: "Build Execution Packet",
        description: "Turn a business idea into a fast-path or sandbox-first execution packet with modules, validation, and release posture.",
        inputSchema: {
          idea: z.string()
        }
      },
      async ({ idea }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(buildPacketFromIdea(idea), null, 2)
          }
        ]
      })
    );

    server.registerTool(
      "get_connector_registry",
      {
        title: "Get Connector Registry",
        description: "Return the connector catalog with readiness, secrets, mutation surfaces, and fallback modes.",
        inputSchema: {}
      },
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(connectorOps, null, 2)
          }
        ]
      })
    );

    server.registerTool(
      "plan_connector_activation",
      {
        title: "Plan Connector Activation",
        description: "Create a governed activation plan for maximum connectivity across selected apps and services.",
        inputSchema: {
          objective: z.string().optional(),
          preferredConnectors: z.array(z.string()).optional()
        }
      },
      async ({ objective, preferredConnectors }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(buildConnectorActivationPlan(objective, preferredConnectors), null, 2)
          }
        ]
      })
    );

    server.registerTool(
      "build_content_commerce_machine",
      {
        title: "Build Content Commerce Machine",
        description: "Generate an autonomous content, commerce, and analytics operating model for a brand, niche, and offer set.",
        inputSchema: {
          brandName: z.string(),
          niche: z.string(),
          offers: z.array(z.string()).optional(),
          channels: z.array(z.string()).optional(),
          monetization: z.array(z.string()).optional(),
          autonomyLevel: z.string().optional()
        }
      },
      async ({ brandName, niche, offers, channels, monetization, autonomyLevel }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              buildContentCommerceMachine({
                brandName,
                niche,
                offers,
                channels,
                monetization,
                autonomyLevel
              }),
              null,
              2
            )
          }
        ]
      })
    );

    server.registerTool(
      "build_universal_integration_blueprint",
      {
        title: "Build Universal Integration Blueprint",
        description: "Design a hub-and-spoke integration plan to connect multiple source and target systems with queues, receipts, and approval gates.",
        inputSchema: {
          businessObjective: z.string(),
          sourceSystems: z.array(z.string()).optional(),
          targetSystems: z.array(z.string()).optional(),
          trigger: z.string().optional()
        }
      },
      async ({ businessObjective, sourceSystems, targetSystems, trigger }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              buildUniversalIntegrationBlueprint({
                businessObjective,
                sourceSystems,
                targetSystems,
                trigger
              }),
              null,
              2
            )
          }
        ]
      })
    );

    server.registerTool(
      "get_capability_test_matrix",
      {
        title: "Get Capability Test Matrix",
        description: "Return the current connector readiness, capability tests, and hardening pipeline used to govern autonomy.",
        inputSchema: {}
      },
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(buildCapabilityTestMatrix(), null, 2)
          }
        ]
      })
    );

    server.registerTool(
      "build_reverse_engineering_plan",
      {
        title: "Build Reverse Engineering Plan",
        description: "Create the passive reverse-engineering and market-intelligence plan for a target system, competitor, niche, or media property.",
        inputSchema: {
          target: z.string()
        }
      },
      async ({ target }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(buildPassiveReverseEngineeringPlan(target), null, 2)
          }
        ]
      })
    );

    server.registerTool(
      "get_governance_policy",
      {
        title: "Get Governance Policy",
        description: "Return the autonomy rules, approval gates, and required hardening policy for the current stack.",
        inputSchema: {}
      },
      async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(buildGovernancePolicy(), null, 2)
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

    server.registerPrompt(
      "launch_content_machine",
      {
        title: "Launch Content Machine",
        description: "Prompt template for using the MCP as a launch surface for an autonomous content and commerce machine."
      },
      async () => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                "Use the AUTO BUILDER MCP to inspect the system topology, connector registry, governance policy, and capability matrix. Then build the fastest revenue-first content and commerce machine for the current brand, with queue design, approvals, publishing loop, attribution, and a seven-day execution plan."
            }
          }
        ]
      })
    );
  },
  {
    instructions:
      "Use this server as the governed operating surface for AUTO BUILDER. Prefer get_system_topology first, then get_connector_registry, then get_governance_policy, and then route into build_execution_packet, build_content_commerce_machine, or build_universal_integration_blueprint as needed."
  },
  {
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: false
  }
);

export { handler as GET, handler as POST, handler as DELETE };

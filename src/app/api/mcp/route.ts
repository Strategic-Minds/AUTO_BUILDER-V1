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
import { actionCatalog } from "@/lib/autobuilder-v2/action-catalog";
import { executeAutoBuilderV2Action } from "@/lib/autobuilder-v2/execution-router";
import { providerRegistry } from "@/lib/autobuilder-v2/provider-registry";
import { runAutoBuilderV2Validation } from "@/lib/autobuilder-v2/validation-runner";
import { runAutoBuilderV2Workflow } from "@/lib/autobuilder-v2/workflow-runner";

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
  { uri: "xps://README.md", name: "Repo README", description: "Top-level repository overview and MCP usage notes.", mimeType: "text/markdown", path: "README.md" },
  { uri: "xps://docs/handoffs/dev-handoff.md", name: "Dev Handoff", description: "Project handoff notes and operating assumptions.", mimeType: "text/markdown", path: "docs/handoffs/dev-handoff.md" },
  { uri: "xps://docs/prompts/repo-discovery.prompt.md", name: "Repo Discovery Prompt", description: "Prompt used to orient discovery inside this repo.", mimeType: "text/markdown", path: "docs/prompts/repo-discovery.prompt.md" },
  { uri: "xps://apps/control-plane/package.json", name: "Control Plane Package", description: "Package metadata for the control-plane app.", mimeType: "application/json", path: "apps/control-plane/package.json" },
  { uri: "xps://factory/connector-ops.json", name: "Connector Registry", description: "Connector readiness, mutation surfaces, and fallback modes.", mimeType: "application/json", path: "factory/connector-ops.json" },
  { uri: "xps://factory/template-library.json", name: "Template Library", description: "Reusable template packs for launch and automation systems.", mimeType: "application/json", path: "factory/template-library.json" },
  { uri: "xps://factory/capability-matrix.json", name: "Capability Matrix", description: "Capability tests, hardening, and connector readiness matrix.", mimeType: "application/json", path: "factory/capability-matrix.json" },
  { uri: "xps://factory/reverse-engineering-lanes.json", name: "Reverse Engineering Lanes", description: "Passive research and system extraction lanes.", mimeType: "application/json", path: "factory/reverse-engineering-lanes.json" }
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
      reverseEngineeringLanes: reverseEngineeringLanes.length,
      autobuilderV2Providers: providerRegistry.length,
      autobuilderV2Actions: actionCatalog.length
    }
  };
}

function readBundledFile(path: string) {
  const value = repoFiles[path];
  if (!value) throw new Error(`Unknown path: ${path}`);
  return value;
}

function readTextFile(path: string, startLine?: number, endLine?: number) {
  const text = readBundledFile(path);
  const lines = text.split(/\r?\n/);
  const firstLine = Math.max(1, Number(startLine ?? 1));
  const lastLine = Math.min(lines.length, Number(endLine ?? lines.length));
  if (lastLine < firstLine) throw new Error("endLine must be greater than or equal to startLine");
  return {
    path,
    startLine: firstLine,
    endLine: lastLine,
    content: lines.slice(firstLine - 1, lastLine).map((line, index) => `${firstLine + index}: ${line}`).join("\n")
  };
}

function buildConnectorActivationPlan(objective?: string, preferredConnectors?: string[]) {
  const selected = preferredConnectors?.length ? connectorOps.filter((connector) => preferredConnectors.includes(connector.connector)) : connectorOps;
  return {
    objective: objective ?? "Maximum governed connectivity across the AUTO BUILDER operating stack.",
    selectionCount: selected.length,
    deploymentOrder: ["Read-only discovery and receipts", "Sandbox mutation tests", "Approval-gated live mutations", "Autonomous queue execution", "Analytics and optimization loop"],
    connectors: selected,
    autobuilderV2Connectors: providerRegistry,
    warnings: ["Universal connectivity requires provider-specific auth and runtime validation."]
  };
}

function buildGovernancePolicy() {
  return {
    defaultMode: "Maximum governed autonomy",
    autonomousByDefault: ["read-only research", "stack inspection", "workflow design", "task packet creation", "connector planning", "content planning", "queue design", "capability testing plan generation", "reverse-engineering plan generation"],
    approvalRequired: ["production deploys", "billing or financial mutations", "store writes", "schema migrations", "auto-publish to external channels", "external messages or outbound calls", "live environment variable changes"],
    connectorPolicy: connectorOps.map((connector) => ({ connector: connector.connector, readiness: connector.readiness, approvalGate: connector.approvalGate, fallbackReceiptMode: connector.fallbackReceiptMode })),
    autobuilderV2: {
      providers: providerRegistry.length,
      actions: actionCatalog.length,
      n8nAuthType: providerRegistry.find((provider) => provider.providerId === "n8n")?.authType
    },
    hardeningRequired: hardeningPipeline.filter((test) => test.required)
  };
}

function buildContentCommerceMachine(args: { brandName: string; niche: string; offers?: string[]; channels?: string[]; monetization?: string[]; autonomyLevel?: string }) {
  const offers = args.offers?.length ? args.offers : ["core offer", "entry offer", "upsell"];
  const channels = args.channels?.length ? args.channels : ["Instagram", "TikTok", "Facebook", "YouTube Shorts", "LinkedIn", "X"];
  const monetization = args.monetization?.length ? args.monetization : ["direct offer sales", "lead capture", "high-ticket closers", "digital products", "affiliate revenue"];
  return {
    brand: args.brandName,
    niche: args.niche,
    autonomyLevel: args.autonomyLevel ?? "governed-autonomous",
    offers,
    channels,
    monetization,
    stackUse: { commerce: ["Shopify", "Stripe"], orchestration: ["ChatGPT", "OpenAI", "Codex"], memoryAndLogs: ["Supabase", "Google Sheets", "Google Drive"], publishing: ["Xyla", "Facebook"], repurposing: ["Opus"], releaseAndDelivery: ["GitHub", "Vercel"] },
    autobuilderV2: { providers: providerRegistry.length, actions: actionCatalog.length },
    firstSevenDays: ["Lock the fastest cash offer and one CTA.", "Generate 30 content hooks tied to that offer.", "Build 7 short-form scripts and 3 longer authority assets.", "Set one publishing cadence per primary channel.", "Connect attribution from content to lead capture to sale.", "Review winning hooks, CTR, leads, and revenue daily.", "Double down on the top 20 percent of outputs."]
  };
}

function buildUniversalIntegrationBlueprint(args: { businessObjective: string; sourceSystems?: string[]; targetSystems?: string[]; trigger?: string }) {
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
      eventFlow: ["trigger received", "payload normalized", "routing decision", "queue receipt created", "worker execution", "delivery receipt", "analytics sync", "optimization feedback"],
      reliability: ["idempotency key", "retry policy", "dead-letter queue", "audit receipt", "operator escalation"]
    },
    connectorPlan: buildConnectorActivationPlan(args.businessObjective, [...sourceSystems, ...targetSystems]),
    autobuilderV2: { providers: providerRegistry.length, actions: actionCatalog.length }
  };
}

function mcpText(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool("health_check", { title: "Health Check", description: "Confirm the remote MCP server is alive.", inputSchema: {} }, async () => mcpText({ status: "ok", service: "auto-builder-mcp", transport: "streamable-http", environment: process.env.VERCEL ? "vercel" : "local", providers: providers.length, connectors: connectorOps.length, autobuilderV2Providers: providerRegistry.length, autobuilderV2Actions: actionCatalog.length, timestamp: new Date().toISOString() }));
    server.registerTool("read_bootstrap_status", { title: "Read Bootstrap Status", description: "Inspect package metadata and bootstrap entrypoints.", inputSchema: {} }, async () => mcpText({ packageJsonPath: "apps/control-plane/package.json", scripts: buildRepoSummary().controlPlaneScripts, bundledPaths: visibleRepoPaths, repos: repoRoles, providers }));
    server.registerTool("get_repo_summary", { title: "Get Repo Summary", description: "Use this first for repo discovery.", inputSchema: {} }, async () => mcpText(buildRepoSummary()));
    server.registerTool("list_repo_files", { title: "List Repo Files", description: "List bundled repo paths.", inputSchema: { subpath: z.string().optional(), maxDepth: z.number().int().min(0).max(8).optional(), limit: z.number().int().min(1).max(500).optional() } }, async ({ subpath, limit }) => mcpText(visibleRepoPaths.filter((item) => !subpath || subpath === "." || item === subpath || item.startsWith(`${subpath.replace(/\/$/, "")}/`)).slice(0, limit ?? 200).map((path) => ({ path }))));
    server.registerTool("read_text_file", { title: "Read Text File", description: "Read bundled UTF-8 file.", inputSchema: { path: z.string(), startLine: z.number().int().min(1).optional(), endLine: z.number().int().min(1).optional() } }, async ({ path, startLine, endLine }) => mcpText(readTextFile(path, startLine, endLine)));
    server.registerTool("get_system_topology", { title: "Get System Topology", description: "Return the AUTO BUILDER stack map and v2 coverage.", inputSchema: {} }, async () => mcpText(buildSystemTopology()));
    server.registerTool("classify_automation_opportunity", { title: "Classify Automation Opportunity", description: "Classify a business idea into the best route.", inputSchema: { idea: z.string() } }, async ({ idea }) => mcpText(classifyIdea(idea)));
    server.registerTool("build_execution_packet", { title: "Build Execution Packet", description: "Turn an idea into an execution packet.", inputSchema: { idea: z.string() } }, async ({ idea }) => mcpText(buildPacketFromIdea(idea)));
    server.registerTool("get_connector_registry", { title: "Get Connector Registry", description: "Return connector catalog and v2 registry.", inputSchema: {} }, async () => mcpText({ legacyConnectorOps: connectorOps, autobuilderV2ProviderRegistry: providerRegistry }));
    server.registerTool("plan_connector_activation", { title: "Plan Connector Activation", description: "Create a governed activation plan.", inputSchema: { objective: z.string().optional(), preferredConnectors: z.array(z.string()).optional() } }, async ({ objective, preferredConnectors }) => mcpText(buildConnectorActivationPlan(objective, preferredConnectors)));
    server.registerTool("build_content_commerce_machine", { title: "Build Content Commerce Machine", description: "Generate content, commerce, and analytics model.", inputSchema: { brandName: z.string(), niche: z.string(), offers: z.array(z.string()).optional(), channels: z.array(z.string()).optional(), monetization: z.array(z.string()).optional(), autonomyLevel: z.string().optional() } }, async (args) => mcpText(buildContentCommerceMachine(args)));
    server.registerTool("build_universal_integration_blueprint", { title: "Build Universal Integration Blueprint", description: "Design hub-and-spoke integration plan.", inputSchema: { businessObjective: z.string(), sourceSystems: z.array(z.string()).optional(), targetSystems: z.array(z.string()).optional(), trigger: z.string().optional() } }, async (args) => mcpText(buildUniversalIntegrationBlueprint(args)));
    server.registerTool("get_capability_test_matrix", { title: "Get Capability Test Matrix", description: "Return capability and hardening matrix.", inputSchema: {} }, async () => mcpText(buildCapabilityTestMatrix()));
    server.registerTool("build_reverse_engineering_plan", { title: "Build Reverse Engineering Plan", description: "Create passive research plan.", inputSchema: { target: z.string() } }, async ({ target }) => mcpText(buildPassiveReverseEngineeringPlan(target)));
    server.registerTool("get_governance_policy", { title: "Get Governance Policy", description: "Return autonomy and connector policy.", inputSchema: {} }, async () => mcpText(buildGovernancePolicy()));

    server.registerTool("get_autobuilder_v2_capabilities", { title: "Get Auto Builder 2 Capabilities", description: "Return all Auto Builder 2 providers and actions exposed by the universal capability bus.", inputSchema: {} }, async () => mcpText({ providers: providerRegistry.length, actions: actionCatalog.length, providerRegistry, actionCatalog }));
    server.registerTool("get_autobuilder_v2_connectors", { title: "Get Auto Builder 2 Connectors", description: "Return the Auto Builder 2 provider registry including n8n access-token/server-url bindings.", inputSchema: {} }, async () => mcpText(providerRegistry));
    server.registerTool("get_autobuilder_v2_actions", { title: "Get Auto Builder 2 Actions", description: "Return the full Auto Builder 2 action catalog.", inputSchema: {} }, async () => mcpText(actionCatalog));
    server.registerTool("validate_autobuilder_v2", { title: "Validate Auto Builder 2", description: "Run Auto Builder 2 validation runner.", inputSchema: {} }, async () => mcpText(runAutoBuilderV2Validation()));
    server.registerTool("run_autobuilder_v2_workflow", { title: "Run Auto Builder 2 Workflow", description: "Run the 5-minute workflow logic on demand.", inputSchema: {} }, async () => mcpText(runAutoBuilderV2Workflow()));
    server.registerTool("execute_autobuilder_v2_action", { title: "Execute Auto Builder 2 Action", description: "Route an Auto Builder 2 action through the execution and provider router, returning a receipt.", inputSchema: { action: z.string(), providerId: z.string().optional(), category: z.any().optional(), payload: z.any().optional() } }, async ({ action, providerId, category, payload }) => mcpText(executeAutoBuilderV2Action({ action, providerId, category, payload })));

    for (const resource of resources) {
      server.registerResource(resource.name, resource.uri, { title: resource.name, description: resource.description, mimeType: resource.mimeType }, async () => ({ contents: [{ uri: resource.uri, mimeType: resource.mimeType, text: readBundledFile(resource.path) }] }));
    }

    server.registerPrompt("repo_discovery", { title: "Repo Discovery", description: "Prompt template for orienting work inside AUTO BUILDER." }, async () => ({ messages: [{ role: "user", content: { type: "text", text: readBundledFile("docs/prompts/repo-discovery.prompt.md") } }] }));
    server.registerPrompt("launch_content_machine", { title: "Launch Content Machine", description: "Prompt template for using the MCP as a launch surface." }, async () => ({ messages: [{ role: "user", content: { type: "text", text: "Use the AUTO BUILDER MCP to inspect topology, connector registry, governance, v2 capabilities, action catalog, and validation status. Then build the fastest revenue-first content and commerce machine with queues, receipts, and a seven-day execution plan." } }] }));
  },
  { instructions: "Use this server as the governed operating surface for AUTO BUILDER. Prefer get_system_topology, get_autobuilder_v2_capabilities, get_autobuilder_v2_connectors, validate_autobuilder_v2, then route through execute_autobuilder_v2_action or run_autobuilder_v2_workflow as needed." },
  { basePath: "/api", maxDuration: 60, verboseLogs: false }
);

export { handler as GET, handler as POST, handler as DELETE };

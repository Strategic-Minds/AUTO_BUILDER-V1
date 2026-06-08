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
import {
  browserClick,
  browserDownload,
  browserFormFill,
  browserLogin,
  browserPayment,
  browserPostSocial,
  browserScroll,
  browserSendMessage,
  browserUpload,
  runBrowserJob
} from "@/lib/autobuilder-v2/browser-job-runner";
import {
  driveCreateFolder,
  driveListTree,
  driveMoveFile,
  driveMoveFolder,
  driveUploadFile,
  driveUploadImage,
  driveWriteReceipt,
  runDriveJob
} from "@/lib/autobuilder-v2/drive-job-runner";
import {
  edenRuntimeStatus,
  edenTrendDiscoveryDryRun,
  edenTrendDiscoveryReadiness,
  runEdenJob
} from "@/lib/autobuilder-v2/eden-job-runner";
import { runUniversalJob } from "@/lib/autobuilder-v2/universal-job-runner";

export const runtime = "nodejs";

const browserToolNames = ["run_browser_job", "browser_login", "browser_payment", "browser_post_social", "browser_send_message", "browser_download", "browser_upload", "browser_click", "browser_scroll", "browser_form_fill"];
const driveToolNames = ["run_drive_job", "drive_list_tree", "drive_create_folder", "drive_upload_file", "drive_upload_image", "drive_move_file", "drive_move_folder", "drive_write_receipt"];
const edenToolNames = ["eden.runtime.status", "eden.trend_discovery.readiness", "eden.trend_discovery.dry_run", "run_eden_job", "eden_runtime_status", "eden_trend_discovery_readiness", "eden_trend_discovery_dry_run"];
const universalToolNames = ["run_universal_job", "run_job"];

const repoFiles: Record<string, string> = {
  "README.md": `# AUTO BUILDER Bridge\n\nGPT remains the orchestration brain. Cloud workers and bridges execute recurring operations. Codex is reserved for implementation runtime tasks.\n`,
  "docs/handoffs/dev-handoff.md": `# Dev Handoff\n\n## Current objective\nTransform xps-ai-factory into a top-ceiling autonomous platform that can:\n- build frontend/backend systems rapidly\n- onboard connectors quickly\n- validate browser/API flows\n- deploy to Railway\n- support XPS Intelligence and Contractor OS\n`,
  "docs/prompts/repo-discovery.prompt.md": `Inspect this repository completely before making changes.\nTreat GitHub remote as source of truth, Docker local as runtime truth, and Railway as deploy target.\nUse repo-local skills where relevant.\nProduce:\n1. repo map\n2. stack detection\n3. env/config contract\n4. validation plan\n5. top implementation priorities\nDo not implement yet.\n`,
  "apps/control-plane/package.json": JSON.stringify({ name: "@xps-ai-factory/control-plane", private: true, version: "0.1.0", scripts: { dev: "node server.js", start: "node server.js", lint: "echo lint placeholder", test: "echo test placeholder" } }, null, 2),
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

const visibleRepoPaths = [".", "README.md", "docs", "docs/handoffs", "docs/handoffs/dev-handoff.md", "docs/prompts", "docs/prompts/repo-discovery.prompt.md", "apps", "apps/control-plane", "apps/control-plane/package.json", "factory", "factory/connector-ops.json", "factory/template-library.json", "factory/capability-matrix.json", "factory/reverse-engineering-lanes.json"] as const;

function buildRepoSummary() {
  return { repoRoot: "remote-bundled-content", rootPackageName: "auto-builder-bridge", rootScripts: { dev: "next dev", build: "next build", start: "next start", "validate:factory": "node scripts/validate-factory.mjs" }, controlPlanePackageName: "@xps-ai-factory/control-plane", controlPlaneScripts: { dev: "node server.js", start: "node server.js", lint: "echo lint placeholder", test: "echo test placeholder" }, repos: repoRoles, providers, workflow, factorySurfaces, keyPaths: { readme: "README.md", controlPlanePackage: "apps/control-plane/package.json", devHandoff: "docs/handoffs/dev-handoff.md", repoDiscoveryPrompt: "docs/prompts/repo-discovery.prompt.md", connectorRegistry: "factory/connector-ops.json", templateLibrary: "factory/template-library.json", capabilityMatrix: "factory/capability-matrix.json" }, browserTools: browserToolNames, driveJobTools: driveToolNames, universalJobTools: universalToolNames, edenTools: edenToolNames };
}

function buildSystemTopology() {
  return { system: "AUTO BUILDER Bridge Brain", repos: repoRoles, providers, workflow, factory: { readiness, readinessScore: factoryReadiness, surfaces: factorySurfaces, audit, entryPrompts }, coverage: { fastPathRoutes: fastPathRoutes.length, templatePacks: templateLibrary.length, connectors: connectorOps.length, capabilityTests: capabilityTests.length, hardeningTests: hardeningPipeline.length, reverseEngineeringLanes: reverseEngineeringLanes.length, browserTools: browserToolNames.length, driveJobTools: driveToolNames.length, universalJobTools: universalToolNames.length, edenTools: edenToolNames.length } };
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
  return { path, startLine: firstLine, endLine: lastLine, content: lines.slice(firstLine - 1, lastLine).map((line, index) => `${firstLine + index}: ${line}`).join("\n") };
}

function buildConnectorActivationPlan(objective?: string, preferredConnectors?: string[]) {
  const selected = preferredConnectors?.length ? connectorOps.filter((connector) => preferredConnectors.includes(connector.connector)) : connectorOps;
  return { objective: objective ?? "Maximum governed connectivity across the AUTO BUILDER operating stack.", selectionCount: selected.length, deploymentOrder: ["Read-only discovery and receipts", "Sandbox mutation tests", "Approval-gated live mutations", "Autonomous queue execution", "Analytics and optimization loop"], connectors: selected, warnings: ["Universal connectivity does not mean every app can be mutated safely without app-specific auth and testing.", "High-risk surfaces remain approval-gated until validated.", "The fastest path is broad read access first, then controlled writes by connector class."] };
}

function buildGovernancePolicy() {
  return { defaultMode: "Maximum governed autonomy", autonomousByDefault: ["read-only research", "stack inspection", "workflow design", "task packet creation", "connector planning", "content planning", "queue design", "capability testing plan generation", "reverse-engineering plan generation"], approvalRequired: ["production deploys", "billing or financial mutations", "store writes", "schema migrations", "auto-publish to external channels", "external messages or outbound calls", "live environment variable changes", "browser login", "browser payment", "browser posting", "browser messaging", "browser upload", "browser download"], connectorPolicy: connectorOps.map((connector) => ({ connector: connector.connector, readiness: connector.readiness, approvalGate: connector.approvalGate, fallbackReceiptMode: connector.fallbackReceiptMode })), browserTools: browserToolNames, driveJobTools: driveToolNames, universalJobTools: universalToolNames, edenTools: edenToolNames, hardeningRequired: hardeningPipeline.filter((test) => test.required) };
}

function buildContentCommerceMachine(args: { brandName: string; niche: string; offers?: string[]; channels?: string[]; monetization?: string[]; autonomyLevel?: string }) {
  const offers = args.offers?.length ? args.offers : ["core offer", "entry offer", "upsell"];
  const channels = args.channels?.length ? args.channels : ["Instagram", "TikTok", "Facebook", "YouTube Shorts", "LinkedIn", "X"];
  const monetization = args.monetization?.length ? args.monetization : ["direct offer sales", "lead capture", "high-ticket closers", "digital products", "affiliate revenue"];
  return { brand: args.brandName, niche: args.niche, autonomyLevel: args.autonomyLevel ?? "governed-autonomous", offers, channels, monetization, stackUse: { commerce: ["Shopify", "Stripe"], orchestration: ["ChatGPT", "OpenAI", "Codex"], memoryAndLogs: ["Supabase", "Google Sheets", "Google Drive"], publishing: ["Xyla", "Facebook"], repurposing: ["Opus"], releaseAndDelivery: ["GitHub", "Vercel"] }, automationQueues: ["idea-intake", "content-briefs", "asset-generation", "repurpose-queue", "approval-queue", "publish-queue", "analytics-sync", "revenue-attribution", "optimization-loop"], firstSevenDays: ["Lock the fastest cash offer and one CTA.", "Generate 30 content hooks tied to that offer.", "Build 7 short-form scripts and 3 longer authority assets.", "Set one publishing cadence per primary channel.", "Connect attribution from content to lead capture to sale.", "Review winning hooks, CTR, leads, and revenue daily.", "Double down on the top 20 percent of outputs."] };
}

function buildUniversalIntegrationBlueprint(args: { businessObjective: string; sourceSystems?: string[]; targetSystems?: string[]; trigger?: string }) {
  const sourceSystems = args.sourceSystems?.length ? args.sourceSystems : ["Shopify", "Google Drive", "Supabase"];
  const targetSystems = args.targetSystems?.length ? args.targetSystems : ["Xyla", "Facebook", "Supabase", "Slack"];
  return { businessObjective: args.businessObjective, trigger: args.trigger ?? "new asset, new product event, or new campaign brief", sourceSystems, targetSystems, integrationPattern: { orchestrationBrain: "ChatGPT + AUTO BUILDER MCP", stateLayer: "Supabase", eventFlow: ["trigger received", "payload normalized", "routing decision", "queue receipt created", "worker execution", "approval gate when required", "delivery receipt", "analytics sync", "optimization feedback"], reliability: ["idempotency key", "retry policy", "dead-letter queue", "audit receipt", "operator escalation"] }, connectorPlan: buildConnectorActivationPlan(args.businessObjective, [...sourceSystems, ...targetSystems]), minimumDataContract: { eventId: "stable unique ID", source: "origin system", target: "destination system", payloadVersion: "schema version", status: "queued | running | blocked | approved | delivered | failed", approvalState: "not-required | pending | approved | rejected", receipt: "URL, ID, or structured evidence", analyticsKey: "join key for attribution" } };
}

function mcpText(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

const browserStepSchema = z.object({ action: z.string(), url: z.string().optional(), selector: z.string().optional(), text: z.string().optional(), value: z.string().optional(), x: z.number().optional(), y: z.number().optional(), direction: z.enum(["up", "down", "left", "right"]).optional(), amount: z.number().optional(), description: z.string().optional() });
const browserJobSchema = { job_id: z.string(), mode: z.enum(["dry_run", "rest", "headless", "headful"]).optional(), url: z.string().optional(), objective: z.string().optional(), actions: z.array(z.string()).optional(), steps: z.array(browserStepSchema).optional(), blocked_actions: z.array(z.string()).optional(), approval_required: z.boolean().optional(), approved_actions: z.array(z.string()).optional(), browser_worker_url: z.string().optional(), payload: z.record(z.string(), z.unknown()).optional() };
const browserSingleActionSchema = { job_id: z.string(), mode: z.enum(["dry_run", "rest", "headless", "headful"]).optional(), url: z.string().optional(), objective: z.string().optional(), selector: z.string().optional(), value: z.string().optional(), direction: z.enum(["up", "down", "left", "right"]).optional(), amount: z.number().optional(), steps: z.array(browserStepSchema).optional(), blocked_actions: z.array(z.string()).optional(), approval_required: z.boolean().optional(), approved_actions: z.array(z.string()).optional(), browser_worker_url: z.string().optional(), payload: z.record(z.string(), z.unknown()).optional() };
const driveJobSchema = { job_id: z.string(), mode: z.enum(["missing_only", "full_sync", "validate_only"]).optional(), root_folder_id: z.string(), dry_run: z.boolean().optional(), actions: z.array(z.string()), blocked_actions: z.array(z.string()).optional(), folders: z.array(z.object({ name: z.string(), parent_folder_id: z.string().optional(), path: z.string().optional() })).optional(), files: z.array(z.object({ name: z.string(), source_path: z.string().optional(), mime_type: z.string().optional(), parent_folder_id: z.string().optional() })).optional(), images: z.array(z.object({ name: z.string(), source_path: z.string().optional(), mime_type: z.string().optional(), parent_folder_id: z.string().optional() })).optional(), moves: z.array(z.object({ item_id: z.string(), from_folder_id: z.string().optional(), to_folder_id: z.string(), item_type: z.enum(["file", "folder"]) })).optional(), receipt_folder_id: z.string().optional() };
const universalJobSchema = { job_id: z.string(), mode: z.enum(["dry_run", "approval_gated", "execute"]).optional(), provider: z.string(), objective: z.string(), root_resource_id: z.string().optional(), actions: z.array(z.string()).optional(), blocked_actions: z.array(z.string()).optional(), approval_required: z.boolean().optional(), fallbacks: z.array(z.string()).optional(), payload: z.record(z.string(), z.unknown()).optional() };
const edenJobSchema = { job_id: z.string(), mode: z.enum(["status", "readiness", "dry_run", "execute"]).optional(), objective: z.string().optional(), actions: z.array(z.string()).optional(), blocked_actions: z.array(z.string()).optional(), approval_required: z.boolean().optional(), payload: z.record(z.string(), z.unknown()).optional() };
const runJobSchema = { job_id: z.string(), provider: z.string(), mode: z.string().optional(), objective: z.string().optional(), root_resource_id: z.string().optional(), actions: z.array(z.string()).optional(), blocked_actions: z.array(z.string()).optional(), approval_required: z.boolean().optional(), payload: z.record(z.string(), z.unknown()).optional() };

const handler = createMcpHandler(
  (server) => {
    server.registerTool("health_check", { title: "Health Check", description: "Use this before other calls to confirm the remote MCP server is alive.", inputSchema: {} }, async () => mcpText({ status: "ok", service: "xps-ai-factory-control-plane", transport: "streamable-http", environment: process.env.VERCEL ? "vercel" : "local", providers: providers.length, connectors: connectorOps.length, browserTools: browserToolNames.length, driveJobTools: driveToolNames.length, universalJobTools: universalToolNames.length, edenTools: edenToolNames.length, timestamp: new Date().toISOString() }));
    server.registerTool("read_bootstrap_status", { title: "Read Bootstrap Status", description: "Inspect the bundled control-plane package metadata and bootstrap entrypoints.", inputSchema: {} }, async () => mcpText({ packageJsonPath: "apps/control-plane/package.json", scripts: buildRepoSummary().controlPlaneScripts, bundledPaths: visibleRepoPaths, repos: repoRoles, providers }));
    server.registerTool("get_repo_summary", { title: "Get Repo Summary", description: "Use this first for repo discovery. It returns the key scripts, package names, and file entrypoints exposed by this MCP.", inputSchema: {} }, async () => mcpText(buildRepoSummary()));
    server.registerTool("list_repo_files", { title: "List Repo Files", description: "List the bundled repo paths this remote MCP exposes.", inputSchema: { subpath: z.string().optional(), maxDepth: z.number().int().min(0).max(8).optional(), limit: z.number().int().min(1).max(500).optional() } }, async ({ subpath, limit }) => mcpText(visibleRepoPaths.filter((item) => { const prefix = subpath ? subpath.replace(/\/$/, "") : "."; return prefix === "." || item === prefix || item.startsWith(`${prefix}/`); }).slice(0, limit ?? 200).map((item) => ({ path: item, type: item === "." || item === "docs" || item === "docs/handoffs" || item === "docs/prompts" || item === "apps" || item === "apps/control-plane" || item === "factory" ? "directory" : "file" }))));
    server.registerTool("read_text_file", { title: "Read Text File", description: "Read a bundled UTF-8 file from this remote MCP server, optionally constrained to a line range.", inputSchema: { path: z.string(), startLine: z.number().int().min(1).optional(), endLine: z.number().int().min(1).optional() } }, async ({ path, startLine, endLine }) => mcpText(readTextFile(path, startLine, endLine)));
    server.registerTool("get_system_topology", { title: "Get System Topology", description: "Return the full AUTO BUILDER stack map, workflow, providers, factory surfaces, and coverage counts.", inputSchema: {} }, async () => mcpText(buildSystemTopology()));
    server.registerTool("classify_automation_opportunity", { title: "Classify Automation Opportunity", description: "Classify a business idea into the best factory route, risk class, speed path, and escalation posture.", inputSchema: { idea: z.string() } }, async ({ idea }) => mcpText(classifyIdea(idea)));
    server.registerTool("build_execution_packet", { title: "Build Execution Packet", description: "Turn a business idea into a fast-path or sandbox-first execution packet with modules, validation, and release posture.", inputSchema: { idea: z.string() } }, async ({ idea }) => mcpText(buildPacketFromIdea(idea)));
    server.registerTool("get_connector_registry", { title: "Get Connector Registry", description: "Return the connector catalog with readiness, secrets, mutation surfaces, and fallback modes.", inputSchema: {} }, async () => mcpText(connectorOps));
    server.registerTool("plan_connector_activation", { title: "Plan Connector Activation", description: "Create a governed activation plan for maximum connectivity across selected apps and services.", inputSchema: { objective: z.string().optional(), preferredConnectors: z.array(z.string()).optional() } }, async ({ objective, preferredConnectors }) => mcpText(buildConnectorActivationPlan(objective, preferredConnectors)));
    server.registerTool("build_content_commerce_machine", { title: "Build Content Commerce Machine", description: "Generate an autonomous content, commerce, and analytics operating model for a brand, niche, and offer set.", inputSchema: { brandName: z.string(), niche: z.string(), offers: z.array(z.string()).optional(), channels: z.array(z.string()).optional(), monetization: z.array(z.string()).optional(), autonomyLevel: z.string().optional() } }, async (args) => mcpText(buildContentCommerceMachine(args)));
    server.registerTool("build_universal_integration_blueprint", { title: "Build Universal Integration Blueprint", description: "Design a hub-and-spoke integration plan to connect multiple source and target systems with queues, receipts, and approval gates.", inputSchema: { businessObjective: z.string(), sourceSystems: z.array(z.string()).optional(), targetSystems: z.array(z.string()).optional(), trigger: z.string().optional() } }, async (args) => mcpText(buildUniversalIntegrationBlueprint(args)));
    server.registerTool("get_capability_test_matrix", { title: "Get Capability Test Matrix", description: "Return the current connector readiness, capability tests, and hardening pipeline used to govern autonomy.", inputSchema: {} }, async () => mcpText(buildCapabilityTestMatrix()));
    server.registerTool("build_reverse_engineering_plan", { title: "Build Reverse Engineering Plan", description: "Create the passive reverse-engineering and market-intelligence plan for a target system, competitor, niche, or media property.", inputSchema: { target: z.string() } }, async ({ target }) => mcpText(buildPassiveReverseEngineeringPlan(target)));
    server.registerTool("get_governance_policy", { title: "Get Governance Policy", description: "Return the autonomy rules, approval gates, and required hardening policy for the current stack.", inputSchema: {} }, async () => mcpText(buildGovernancePolicy()));
    server.registerTool("run_browser_job", { title: "Run Browser Job", description: "Governed browser operation planner/runner for click, scroll, form fill, login, payment, posting, messaging, download, and upload workflows.", inputSchema: browserJobSchema }, async (payload) => mcpText(runBrowserJob(payload as never)));
    server.registerTool("browser_login", { title: "Browser Login", description: "Plan or run an approval-gated browser login workflow.", inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserLogin(payload as never)));
    server.registerTool("browser_payment", { title: "Browser Payment", description: "Plan or run an approval-gated browser payment workflow.", inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserPayment(payload as never)));
    server.registerTool("browser_post_social", { title: "Browser Post Social", description: "Plan or run an approval-gated social posting workflow.", inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserPostSocial(payload as never)));
    server.registerTool("browser_send_message", { title: "Browser Send Message", description: "Plan or run an approval-gated browser messaging workflow.", inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserSendMessage(payload as never)));
    server.registerTool("browser_download", { title: "Browser Download", description: "Plan or run an approval-gated browser download workflow.", inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserDownload(payload as never)));
    server.registerTool("browser_upload", { title: "Browser Upload", description: "Plan or run an approval-gated browser upload workflow.", inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserUpload(payload as never)));
    server.registerTool("browser_click", { title: "Browser Click", description: "Plan or run a browser click action.", inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserClick(payload as never)));
    server.registerTool("browser_scroll", { title: "Browser Scroll", description: "Plan or run a browser scroll action.", inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserScroll(payload as never)));
    server.registerTool("browser_form_fill", { title: "Browser Form Fill", description: "Plan or run a browser form-fill action.", inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserFormFill(payload as never)));
    server.registerTool("run_universal_job", { title: "Run Universal Job", description: "Governed universal automation runner with provider routing, dry-run, approvals, blocked actions, fallbacks, receipts, validation status, and rollback plan.", inputSchema: universalJobSchema }, async (payload) => mcpText(runUniversalJob(payload)));
    server.registerTool("run_job", { title: "Run Job", description: "Underscore-safe generic job alias. Routes Eden jobs to runEdenJob and all other providers to runUniversalJob.", inputSchema: runJobSchema }, async (payload) => mcpText(payload.provider?.toLowerCase() === "eden" ? runEdenJob(payload as never) : runUniversalJob(payload as never)));
    server.registerTool("eden.runtime.status", { title: "Eden Runtime Status", description: "Return Eden runtime status and readiness surface.", inputSchema: { job_id: z.string().optional() } }, async (payload) => mcpText(edenRuntimeStatus(payload)));
    server.registerTool("eden_runtime_status", { title: "Eden Runtime Status Alias", description: "Underscore-safe alias for Eden runtime status.", inputSchema: { job_id: z.string().optional() } }, async (payload) => mcpText(edenRuntimeStatus(payload)));
    server.registerTool("eden.trend_discovery.readiness", { title: "Eden Trend Discovery Readiness", description: "Check Eden trend discovery readiness.", inputSchema: edenJobSchema }, async (payload) => mcpText(edenTrendDiscoveryReadiness(payload)));
    server.registerTool("eden_trend_discovery_readiness", { title: "Eden Trend Discovery Readiness Alias", description: "Underscore-safe alias for Eden trend discovery readiness.", inputSchema: edenJobSchema }, async (payload) => mcpText(edenTrendDiscoveryReadiness(payload)));
    server.registerTool("eden.trend_discovery.dry_run", { title: "Eden Trend Discovery Dry Run", description: "Plan Eden trend discovery with no external mutation.", inputSchema: edenJobSchema }, async (payload) => mcpText(edenTrendDiscoveryDryRun({ ...payload, job_id: payload.job_id } as never)));
    server.registerTool("eden_trend_discovery_dry_run", { title: "Eden Trend Discovery Dry Run Alias", description: "Underscore-safe alias for Eden trend discovery dry-run.", inputSchema: edenJobSchema }, async (payload) => mcpText(edenTrendDiscoveryDryRun({ ...payload, job_id: payload.job_id } as never)));
    server.registerTool("run_eden_job", { title: "Run Eden Job", description: "Generic governed Eden job runner.", inputSchema: edenJobSchema }, async (payload) => mcpText(runEdenJob(payload as never)));
    server.registerTool("run_drive_job", { title: "Run Drive Job", description: "Run a generic Auto Builder Drive job with dry-run, blocked actions, receipts, and validation planning.", inputSchema: driveJobSchema }, async (payload) => mcpText(runDriveJob(payload)));
    server.registerTool("drive_list_tree", { title: "Drive List Tree", description: "Plan and validate listing a Drive folder tree.", inputSchema: { root_folder_id: z.string() } }, async ({ root_folder_id }) => mcpText(driveListTree(root_folder_id)));
    server.registerTool("drive_create_folder", { title: "Drive Create Folder", description: "Plan creation of a missing Google Drive folder.", inputSchema: { root_folder_id: z.string(), name: z.string(), parent_folder_id: z.string().optional(), dry_run: z.boolean().optional() } }, async (payload) => mcpText(driveCreateFolder(payload)));
    server.registerTool("drive_upload_file", { title: "Drive Upload File", description: "Plan upload of a file into Google Drive.", inputSchema: { root_folder_id: z.string(), name: z.string(), source_path: z.string().optional(), mime_type: z.string().optional(), parent_folder_id: z.string().optional(), dry_run: z.boolean().optional() } }, async (payload) => mcpText(driveUploadFile(payload)));
    server.registerTool("drive_upload_image", { title: "Drive Upload Image", description: "Plan upload of an image into Google Drive.", inputSchema: { root_folder_id: z.string(), name: z.string(), source_path: z.string().optional(), mime_type: z.string().optional(), parent_folder_id: z.string().optional(), dry_run: z.boolean().optional() } }, async (payload) => mcpText(driveUploadImage(payload)));
    server.registerTool("drive_move_file", { title: "Drive Move File", description: "Plan moving a Drive file to another folder.", inputSchema: { root_folder_id: z.string(), item_id: z.string(), to_folder_id: z.string(), from_folder_id: z.string().optional(), dry_run: z.boolean().optional() } }, async (payload) => mcpText(driveMoveFile(payload)));
    server.registerTool("drive_move_folder", { title: "Drive Move Folder", description: "Plan moving a Drive folder to another folder.", inputSchema: { root_folder_id: z.string(), item_id: z.string(), to_folder_id: z.string(), from_folder_id: z.string().optional(), dry_run: z.boolean().optional() } }, async (payload) => mcpText(driveMoveFolder(payload)));
    server.registerTool("drive_write_receipt", { title: "Drive Write Receipt", description: "Plan writing a Drive job receipt.", inputSchema: { root_folder_id: z.string(), job_id: z.string().optional(), receipt_folder_id: z.string().optional(), dry_run: z.boolean().optional() } }, async (payload) => mcpText(driveWriteReceipt(payload)));

    for (const resource of resources) server.registerResource(resource.name, resource.uri, { title: resource.name, description: resource.description, mimeType: resource.mimeType }, async () => ({ contents: [{ uri: resource.uri, mimeType: resource.mimeType, text: readBundledFile(resource.path) }] }));
    server.registerPrompt("repo_discovery", { title: "Repo Discovery", description: "Prompt template for orienting work inside AUTO BUILDER." }, async () => ({ messages: [{ role: "user", content: { type: "text", text: readBundledFile("docs/prompts/repo-discovery.prompt.md") } }] }));
    server.registerPrompt("launch_content_machine", { title: "Launch Content Machine", description: "Prompt template for using the MCP as a launch surface for an autonomous content and commerce machine." }, async () => ({ messages: [{ role: "user", content: { type: "text", text: "Use the AUTO BUILDER MCP to inspect browser tools, system topology, connector registry, governance policy, capability matrix, Drive job tools, universal job runner, Eden tools, and underscore-safe aliases. Then build the fastest revenue-first content and commerce machine for the current brand, with queue design, approvals, publishing loop, attribution, and a seven-day execution plan." } }] }));
  },
  { instructions: "Use this server as the governed operating surface for AUTO BUILDER. Prefer health_check first, then get_system_topology, then get_connector_registry, then get_governance_policy. Route browser work into run_browser_job, browser_click, browser_scroll, browser_form_fill, browser_login, browser_payment, browser_post_social, browser_send_message, browser_download, or browser_upload. Route Drive work into run_drive_job. Route Eden work into run_job, run_eden_job, or eden_trend_discovery_dry_run." },
  { basePath: "/api", maxDuration: 60, verboseLogs: false }
);

export { handler as GET, handler as POST, handler as DELETE };

import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';

import {
  audit,
  entryPrompts,
  factorySurfaces,
  providers,
  readiness,
  repoRoles,
  workflow
} from '@/lib/autobuilder';
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
} from '@/lib/factory';
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
} from '@/lib/autobuilder-v2/browser-job-runner';
import {
  driveUploadFile,
  driveUploadImage
} from '@/lib/autobuilder-v2/drive-job-runner';
import {
  edenRuntimeStatus,
  edenTrendDiscoveryDryRun,
  edenTrendDiscoveryReadiness,
  runEdenJob
} from '@/lib/autobuilder-v2/eden-job-runner';
import {
  createVercelSandbox,
  platformProvisioningTools
} from '@/lib/autobuilder-v2/platform-provisioning-runner';
import {
  activeOperatingMap,
  autoBuilder2ExecutionToolNames,
  createAiGatewayTool,
  createGithubRepoTool,
  createVercelAgentTool,
  createVercelProjectTool,
  createVercelWorkflowTool,
  driveCreateFolderTool,
  driveListTreeTool,
  driveMoveFileTool,
  driveMoveFolderTool,
  driveWriteReceiptTool,
  expectedCallableMcpToolNames,
  jobModes,
  requiredEnvNames,
  rollbackTool,
  runDriveJobTool,
  runJob,
  runPlatformProvisioningJobTool,
  runUniversalJob
} from '@/lib/autobuilder-v2/execution-tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const browserToolNames = ['run_browser_job', 'browser_login', 'browser_payment', 'browser_post_social', 'browser_send_message', 'browser_download', 'browser_upload', 'browser_click', 'browser_scroll', 'browser_form_fill'];
const driveToolNames = ['run_drive_job', 'drive_list_tree', 'drive_create_folder', 'drive_upload_file', 'drive_upload_image', 'drive_move_file', 'drive_move_folder', 'drive_write_receipt'];
const edenToolNames = ['eden.runtime.status', 'eden.trend_discovery.readiness', 'eden.trend_discovery.dry_run', 'run_eden_job', 'eden_runtime_status', 'eden_trend_discovery_readiness', 'eden_trend_discovery_dry_run'];
const universalToolNames = ['run_universal_job', 'run_job'];

const repoFiles: Record<string, string> = {
  'README.md': '# AUTO BUILDER Bridge\n\nGPT remains the orchestration brain. Cloud workers and bridges execute recurring operations. Codex is reserved for implementation runtime tasks.\n',
  'docs/handoffs/dev-handoff.md': '# Dev Handoff\n\nTransform xps-ai-factory into a governed autonomous platform with validated connectors, deployment handoffs, and approval-gated runtime operations.\n',
  'docs/prompts/repo-discovery.prompt.md': 'Inspect this repository completely before making changes. Produce a repo map, stack detection, env/config contract, validation plan, and top implementation priorities. Do not implement until the safe scope is clear.\n',
  'apps/control-plane/package.json': JSON.stringify({ name: '@xps-ai-factory/control-plane', private: true, version: '0.1.0', scripts: { dev: 'node server.js', start: 'node server.js', lint: 'echo lint placeholder', test: 'echo test placeholder' } }, null, 2),
  'factory/connector-ops.json': JSON.stringify(connectorOps, null, 2),
  'factory/template-library.json': JSON.stringify(templateLibrary, null, 2),
  'factory/capability-matrix.json': JSON.stringify(buildCapabilityTestMatrix(), null, 2),
  'factory/reverse-engineering-lanes.json': JSON.stringify(reverseEngineeringLanes, null, 2)
};

const visibleRepoPaths = ['.', 'README.md', 'docs', 'docs/handoffs', 'docs/handoffs/dev-handoff.md', 'docs/prompts', 'docs/prompts/repo-discovery.prompt.md', 'apps', 'apps/control-plane', 'apps/control-plane/package.json', 'factory', 'factory/connector-ops.json', 'factory/template-library.json', 'factory/capability-matrix.json', 'factory/reverse-engineering-lanes.json'] as const;

function buildRepoSummary() {
  return {
    repoRoot: 'remote-bundled-content',
    rootPackageName: 'auto-builder-bridge',
    rootScripts: { dev: 'next dev', build: 'next build', start: 'next start', 'validate:factory': 'node scripts/validate-factory.mjs', 'validate:mcp-tools': 'node scripts/validate-mcp-tools.mjs' },
    controlPlanePackageName: '@xps-ai-factory/control-plane',
    controlPlaneScripts: { dev: 'node server.js', start: 'node server.js', lint: 'echo lint placeholder', test: 'echo test placeholder' },
    repos: repoRoles,
    activeOperatingMap,
    providers,
    workflow,
    factorySurfaces,
    keyPaths: { readme: 'README.md', controlPlanePackage: 'apps/control-plane/package.json', devHandoff: 'docs/handoffs/dev-handoff.md', repoDiscoveryPrompt: 'docs/prompts/repo-discovery.prompt.md', connectorRegistry: 'factory/connector-ops.json', templateLibrary: 'factory/template-library.json', capabilityMatrix: 'factory/capability-matrix.json' },
    browserTools: browserToolNames,
    driveJobTools: driveToolNames,
    platformProvisioningTools,
    universalJobTools: universalToolNames,
    edenTools: edenToolNames,
    autoBuilder2ExecutionTools: autoBuilder2ExecutionToolNames,
    expectedCallableMcpTools: expectedCallableMcpToolNames
  };
}

function buildSystemTopology() {
  return {
    system: 'AUTO BUILDER Bridge Brain',
    repos: repoRoles,
    activeOperatingMap,
    providers,
    workflow,
    factory: { readiness, readinessScore: factoryReadiness, surfaces: factorySurfaces, audit, entryPrompts },
    coverage: { fastPathRoutes: fastPathRoutes.length, templatePacks: templateLibrary.length, connectors: connectorOps.length, capabilityTests: capabilityTests.length, hardeningTests: hardeningPipeline.length, reverseEngineeringLanes: reverseEngineeringLanes.length, browserTools: browserToolNames.length, driveJobTools: driveToolNames.length, platformProvisioningTools: platformProvisioningTools.length, universalJobTools: universalToolNames.length, edenTools: edenToolNames.length, autoBuilder2ExecutionTools: autoBuilder2ExecutionToolNames.length }
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
  if (lastLine < firstLine) throw new Error('endLine must be greater than or equal to startLine');
  return { path, startLine: firstLine, endLine: lastLine, content: lines.slice(firstLine - 1, lastLine).map((line, index) => `${firstLine + index}: ${line}`).join('\n') };
}

function buildConnectorActivationPlan(objective?: string, preferredConnectors?: string[]) {
  const selected = preferredConnectors?.length ? connectorOps.filter((connector) => preferredConnectors.includes(connector.connector)) : connectorOps;
  return { objective: objective ?? 'Maximum governed connectivity across the AUTO BUILDER operating stack.', selectionCount: selected.length, deploymentOrder: ['Read-only discovery and receipts', 'Sandbox mutation tests', 'Approval-gated live mutations', 'Autonomous queue execution', 'Analytics and optimization loop'], connectors: selected, warnings: ['Universal connectivity does not mean every app can be mutated safely without app-specific auth and testing.', 'High-risk surfaces remain approval-gated until validated.', 'The fastest path is broad read access first, then controlled writes by connector class.'] };
}

function buildGovernancePolicy() {
  return { defaultMode: 'Maximum governed autonomy', autonomousByDefault: ['read-only research', 'stack inspection', 'workflow design', 'task packet creation', 'connector planning', 'content planning', 'queue design', 'capability testing plan generation', 'reverse-engineering plan generation'], approvalRequired: ['production deploys', 'billing or financial mutations', 'store writes', 'schema migrations', 'auto-publish to external channels', 'external messages or outbound calls', 'live environment variable changes', 'browser login', 'browser payment', 'browser posting', 'browser messaging', 'browser upload', 'browser download', 'GitHub repo creation', 'Vercel project creation', 'Vercel workflow creation', 'Vercel sandbox creation', 'AI Gateway key creation', 'Vercel agent creation', 'Google Drive live folder creation'], activeOperatingMap, requiredEnvNames, connectorPolicy: connectorOps.map((connector) => ({ connector: connector.connector, readiness: connector.readiness, approvalGate: connector.approvalGate, fallbackReceiptMode: connector.fallbackReceiptMode })), browserTools: browserToolNames, driveJobTools: driveToolNames, platformProvisioningTools, universalJobTools: universalToolNames, edenTools: edenToolNames, autoBuilder2ExecutionTools: autoBuilder2ExecutionToolNames, hardeningRequired: hardeningPipeline.filter((test) => test.required) };
}

function buildContentCommerceMachine(args: { brandName: string; niche: string; offers?: string[]; channels?: string[]; monetization?: string[]; autonomyLevel?: string }) {
  return { brand: args.brandName, niche: args.niche, autonomyLevel: args.autonomyLevel ?? 'governed-autonomous', offers: args.offers?.length ? args.offers : ['core offer', 'entry offer', 'upsell'], channels: args.channels?.length ? args.channels : ['Instagram', 'TikTok', 'Facebook', 'YouTube Shorts', 'LinkedIn', 'X'], monetization: args.monetization?.length ? args.monetization : ['direct offer sales', 'lead capture', 'high-ticket closers', 'digital products', 'affiliate revenue'], stackUse: { commerce: ['Shopify', 'Stripe'], orchestration: ['ChatGPT', 'OpenAI', 'Codex'], memoryAndLogs: ['Supabase', 'Google Sheets', 'Google Drive'], publishing: ['Xyla', 'Facebook'], repurposing: ['Opus'], releaseAndDelivery: ['GitHub', 'Vercel'] }, automationQueues: ['idea-intake', 'content-briefs', 'asset-generation', 'repurpose-queue', 'approval-queue', 'publish-queue', 'analytics-sync', 'revenue-attribution', 'optimization-loop'] };
}

function buildUniversalIntegrationBlueprint(args: { businessObjective: string; sourceSystems?: string[]; targetSystems?: string[]; trigger?: string }) {
  const sourceSystems = args.sourceSystems?.length ? args.sourceSystems : ['Shopify', 'Google Drive', 'Supabase'];
  const targetSystems = args.targetSystems?.length ? args.targetSystems : ['Xyla', 'Facebook', 'Supabase', 'Slack'];
  return { businessObjective: args.businessObjective, trigger: args.trigger ?? 'new asset, new product event, or new campaign brief', sourceSystems, targetSystems, integrationPattern: { orchestrationBrain: 'ChatGPT + AUTO BUILDER MCP', stateLayer: 'Supabase', eventFlow: ['trigger received', 'payload normalized', 'routing decision', 'queue receipt created', 'worker execution', 'approval gate when required', 'delivery receipt', 'analytics sync', 'optimization feedback'], reliability: ['idempotency key', 'retry policy', 'dead-letter queue', 'audit receipt', 'operator escalation'] }, connectorPlan: buildConnectorActivationPlan(args.businessObjective, [...sourceSystems, ...targetSystems]), minimumDataContract: { eventId: 'stable unique ID', source: 'origin system', target: 'destination system', payloadVersion: 'schema version', status: 'queued | running | blocked | approved | delivered | failed', approvalState: 'not-required | pending | approved | rejected', receipt: 'URL, ID, or structured evidence', analyticsKey: 'join key for attribution' } };
}

function mcpText(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] };
}

const browserStepSchema = z.object({ action: z.string(), url: z.string().optional(), selector: z.string().optional(), text: z.string().optional(), value: z.string().optional(), x: z.number().optional(), y: z.number().optional(), direction: z.enum(['up', 'down', 'left', 'right']).optional(), amount: z.number().optional(), description: z.string().optional() });
const browserJobSchema = { job_id: z.string(), mode: z.enum(['dry_run', 'rest', 'headless', 'headful']).optional(), url: z.string().optional(), objective: z.string().optional(), actions: z.array(z.string()).optional(), steps: z.array(browserStepSchema).optional(), blocked_actions: z.array(z.string()).optional(), approval_required: z.boolean().optional(), approved_actions: z.array(z.string()).optional(), browser_worker_url: z.string().optional(), payload: z.record(z.string(), z.unknown()).optional() };
const browserSingleActionSchema = { ...browserJobSchema, selector: z.string().optional(), value: z.string().optional(), direction: z.enum(['up', 'down', 'left', 'right']).optional(), amount: z.number().optional() };
const jobModeSchema = z.enum(jobModes);
const platformModeValues = [...jobModes, 'approval_gated'] as const;
const driveModeValues = [...jobModes, 'missing_only', 'full_sync', 'validate_only'] as const;
const looseRecordSchema = z.record(z.string(), z.unknown());
const optionalRecordArraySchema = z.array(looseRecordSchema).optional();
const platformProvisioningSchema = { job_id: z.string(), mode: z.enum(platformModeValues).optional(), command_folder_id: z.string().optional(), platform_actions: optionalRecordArraySchema, actions: z.array(z.string()).optional(), name: z.string().optional(), description: z.string().optional(), owner: z.string().optional(), repo_name: z.string().optional(), visibility: z.enum(['private', 'public', 'internal']).optional(), initialize_readme: z.boolean().optional(), github_owner: z.string().optional(), github_repo: z.string().optional(), github_private: z.boolean().optional(), team_id: z.string().optional(), project_name: z.string().optional(), project_id: z.string().optional(), git_repo: z.string().optional(), route: z.string().optional(), schedule: z.string().optional(), timezone: z.string().optional(), gateway_name: z.string().optional(), providers: z.array(z.string()).optional(), models: z.array(z.string()).optional(), vercel_team_id: z.string().optional(), vercel_project_name: z.string().optional(), framework: z.string().optional(), root_directory: z.string().optional(), git_repository_url: z.string().optional(), workflow_name: z.string().optional(), workflow_entrypoint: z.string().optional(), workflow_topics: z.array(z.string()).optional(), sandbox_name: z.string().optional(), ai_gateway_key_name: z.string().optional(), agent_name: z.string().optional(), agent_scope: z.string().optional(), allowed_tools: z.array(z.string()).optional(), agent_model: z.string().optional(), approval_required: z.boolean().optional(), approved_actions: z.array(z.string()).optional(), approval_phrase: z.string().optional(), blocked_actions: z.array(z.string()).optional(), payload: looseRecordSchema.optional(), receipt: looseRecordSchema.optional(), rollback: looseRecordSchema.optional() };
const driveJobSchema = { job_id: z.string().optional(), mode: z.enum(driveModeValues).optional(), command_folder_id: z.string().optional(), root_folder_id: z.string().optional(), folder_id: z.string().optional(), dry_run: z.boolean().optional(), drive_actions: optionalRecordArraySchema, actions: z.array(z.string()).optional(), blocked_actions: z.array(z.string()).optional(), approved_actions: z.array(z.string()).optional(), approval_phrase: z.string().optional(), folders: z.array(z.object({ name: z.string(), parent_folder_id: z.string().optional(), path: z.string().optional() })).optional(), files: z.array(z.object({ name: z.string(), source_path: z.string().optional(), mime_type: z.string().optional(), parent_folder_id: z.string().optional() })).optional(), images: z.array(z.object({ name: z.string(), source_path: z.string().optional(), mime_type: z.string().optional(), parent_folder_id: z.string().optional() })).optional(), moves: z.array(z.object({ item_id: z.string(), from_folder_id: z.string().optional(), to_folder_id: z.string(), item_type: z.enum(['file', 'folder']) })).optional(), max_depth: z.number().int().min(0).max(10).optional(), parent_folder_id: z.string().optional(), folder_name: z.string().optional(), name: z.string().optional(), file_id: z.string().optional(), destination_parent_folder_id: z.string().optional(), current_parent_folder_id: z.string().optional(), item_id: z.string().optional(), to_folder_id: z.string().optional(), from_folder_id: z.string().optional(), receipt_folder_id: z.string().optional(), system: z.string().optional(), action: z.string().optional(), status: z.string().optional(), summary: z.string().optional(), inputs: looseRecordSchema.optional(), outputs: looseRecordSchema.optional(), receipt: looseRecordSchema.optional(), rollback: looseRecordSchema.optional() };
const universalJobSchema = { job_id: z.string(), mode: jobModeSchema.optional(), target_system: z.string().optional(), action: z.string().optional(), command_folder_id: z.string().optional(), provider: z.string().optional(), objective: z.string().optional(), root_resource_id: z.string().optional(), actions: z.array(z.string()).optional(), blocked_actions: z.array(z.string()).optional(), approval_required: z.boolean().optional(), fallbacks: z.array(z.string()).optional(), payload: looseRecordSchema.optional(), receipt: looseRecordSchema.optional(), rollback: looseRecordSchema.optional() };
const edenJobSchema = { job_id: z.string(), mode: z.enum(['status', 'readiness', 'dry_run', 'execute']).optional(), objective: z.string().optional(), actions: z.array(z.string()).optional(), blocked_actions: z.array(z.string()).optional(), approval_required: z.boolean().optional(), payload: z.record(z.string(), z.unknown()).optional() };
const runJobSchema = { ...universalJobSchema, provider: z.string().optional() };
const rollbackSchema = { job_id: z.string(), mode: z.enum(['dry_run', 'rollback']).optional(), original_job_id: z.string(), rollback_type: z.string(), rollback_payload: looseRecordSchema.optional(), command_folder_id: z.string().optional(), receipt: looseRecordSchema.optional(), rollback: looseRecordSchema.optional() };

const handler = createMcpHandler(
  (server) => {
    server.registerTool('extended_status', { title: 'Extended Route Status', description: 'Confirm the non-primary extended MCP route is alive.', inputSchema: {} }, async () => mcpText({ status: 'ok', route: '/api/mcp-extended', primaryRoute: '/api/mcp', warning: 'This route restores excluded tools outside the primary ChatGPT strict-20 connector.', browserTools: browserToolNames, driveJobTools: driveToolNames, platformProvisioningTools, universalJobTools, edenTools: edenToolNames, expectedCallableMcpTools: expectedCallableMcpToolNames }));
    server.registerTool('get_system_topology', { title: 'Get System Topology', description: 'Return the full AUTO BUILDER stack map.', inputSchema: {} }, async () => mcpText(buildSystemTopology()));
    server.registerTool('classify_automation_opportunity', { title: 'Classify Automation Opportunity', description: 'Classify a business idea into the best factory route.', inputSchema: { idea: z.string() } }, async ({ idea }) => mcpText(classifyIdea(idea)));
    server.registerTool('build_execution_packet', { title: 'Build Execution Packet', description: 'Turn a business idea into an execution packet.', inputSchema: { idea: z.string() } }, async ({ idea }) => mcpText(buildPacketFromIdea(idea)));
    server.registerTool('get_connector_registry', { title: 'Get Connector Registry', description: 'Return the connector catalog.', inputSchema: {} }, async () => mcpText(connectorOps));
    server.registerTool('plan_connector_activation', { title: 'Plan Connector Activation', description: 'Create a governed activation plan.', inputSchema: { objective: z.string().optional(), preferredConnectors: z.array(z.string()).optional() } }, async ({ objective, preferredConnectors }) => mcpText(buildConnectorActivationPlan(objective, preferredConnectors)));
    server.registerTool('build_content_commerce_machine', { title: 'Build Content Commerce Machine', description: 'Generate an autonomous content, commerce, and analytics operating model.', inputSchema: { brandName: z.string(), niche: z.string(), offers: z.array(z.string()).optional(), channels: z.array(z.string()).optional(), monetization: z.array(z.string()).optional(), autonomyLevel: z.string().optional() } }, async (args) => mcpText(buildContentCommerceMachine(args)));
    server.registerTool('build_universal_integration_blueprint', { title: 'Build Universal Integration Blueprint', description: 'Design a hub-and-spoke integration plan.', inputSchema: { businessObjective: z.string(), sourceSystems: z.array(z.string()).optional(), targetSystems: z.array(z.string()).optional(), trigger: z.string().optional() } }, async (args) => mcpText(buildUniversalIntegrationBlueprint(args)));
    server.registerTool('get_capability_test_matrix', { title: 'Get Capability Test Matrix', description: 'Return connector readiness and hardening tests.', inputSchema: {} }, async () => mcpText(buildCapabilityTestMatrix()));
    server.registerTool('build_reverse_engineering_plan', { title: 'Build Reverse Engineering Plan', description: 'Create the passive reverse-engineering plan.', inputSchema: { target: z.string() } }, async ({ target }) => mcpText(buildPassiveReverseEngineeringPlan(target)));
    server.registerTool('get_governance_policy', { title: 'Get Governance Policy', description: 'Return autonomy rules and approval gates.', inputSchema: {} }, async () => mcpText(buildGovernancePolicy()));

    server.registerTool('create_vercel_sandbox', { title: 'Create Vercel Sandbox', description: 'Plan approval-gated Vercel sandbox provisioning.', inputSchema: platformProvisioningSchema }, async (payload) => mcpText(createVercelSandbox(payload as never)));
    server.registerTool('run_browser_job', { title: 'Run Browser Job', description: 'Governed browser operation planner/runner.', inputSchema: browserJobSchema }, async (payload) => mcpText(runBrowserJob(payload as never)));
    server.registerTool('browser_login', { title: 'Browser Login', description: 'Plan or run an approval-gated browser login workflow.', inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserLogin(payload as never)));
    server.registerTool('browser_payment', { title: 'Browser Payment', description: 'Plan or run an approval-gated browser payment workflow.', inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserPayment(payload as never)));
    server.registerTool('browser_post_social', { title: 'Browser Post Social', description: 'Plan or run an approval-gated social posting workflow.', inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserPostSocial(payload as never)));
    server.registerTool('browser_send_message', { title: 'Browser Send Message', description: 'Plan or run an approval-gated browser messaging workflow.', inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserSendMessage(payload as never)));
    server.registerTool('browser_download', { title: 'Browser Download', description: 'Plan or run an approval-gated browser download workflow.', inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserDownload(payload as never)));
    server.registerTool('browser_upload', { title: 'Browser Upload', description: 'Plan or run an approval-gated browser upload workflow.', inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserUpload(payload as never)));
    server.registerTool('browser_click', { title: 'Browser Click', description: 'Plan or run a browser click action.', inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserClick(payload as never)));
    server.registerTool('browser_scroll', { title: 'Browser Scroll', description: 'Plan or run a browser scroll action.', inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserScroll(payload as never)));
    server.registerTool('browser_form_fill', { title: 'Browser Form Fill', description: 'Plan or run a browser form-fill action.', inputSchema: browserSingleActionSchema }, async (payload) => mcpText(browserFormFill(payload as never)));

    server.registerTool('drive_upload_file', { title: 'Drive Upload File', description: 'Plan or run an approval-gated Google Drive file upload.', inputSchema: driveJobSchema }, async (payload) => mcpText(driveUploadFile(payload as never)));
    server.registerTool('drive_upload_image', { title: 'Drive Upload Image', description: 'Plan or run an approval-gated Google Drive image upload.', inputSchema: driveJobSchema }, async (payload) => mcpText(driveUploadImage(payload as never)));

    server.registerTool('run_eden_job', { title: 'Run Eden Job', description: 'Route Eden jobs through Eden handlers.', inputSchema: edenJobSchema }, async (payload) => mcpText(runEdenJob(payload as never)));
    server.registerTool('eden.runtime.status', { title: 'Eden Runtime Status', description: 'Return Eden runtime status and readiness surface.', inputSchema: { job_id: z.string().optional() } }, async (payload) => mcpText(edenRuntimeStatus(payload)));
    server.registerTool('eden_runtime_status', { title: 'Eden Runtime Status Alias', description: 'Underscore-safe alias for Eden runtime status.', inputSchema: { job_id: z.string().optional() } }, async (payload) => mcpText(edenRuntimeStatus(payload)));
    server.registerTool('eden.trend_discovery.readiness', { title: 'Eden Trend Discovery Readiness', description: 'Check Eden trend discovery readiness.', inputSchema: edenJobSchema }, async (payload) => mcpText(edenTrendDiscoveryReadiness(payload)));
    server.registerTool('eden_trend_discovery_readiness', { title: 'Eden Trend Discovery Readiness Alias', description: 'Underscore-safe alias for Eden trend discovery readiness.', inputSchema: edenJobSchema }, async (payload) => mcpText(edenTrendDiscoveryReadiness(payload)));
    server.registerTool('eden.trend_discovery.dry_run', { title: 'Eden Trend Discovery Dry Run', description: 'Dry-run Eden trend discovery.', inputSchema: edenJobSchema }, async (payload) => mcpText(edenTrendDiscoveryDryRun(payload)));
    server.registerTool('eden_trend_discovery_dry_run', { title: 'Eden Trend Discovery Dry Run Alias', description: 'Underscore-safe alias for Eden trend discovery dry-run.', inputSchema: edenJobSchema }, async (payload) => mcpText(edenTrendDiscoveryDryRun(payload)));

    server.registerTool('extended_repo_summary', { title: 'Extended Repo Summary', description: 'Return extended repo summary including restored tool groups.', inputSchema: {} }, async () => mcpText(buildRepoSummary()));
    server.registerTool('extended_read_text_file', { title: 'Extended Read Text File', description: 'Read a bundled UTF-8 file from this extended route.', inputSchema: { path: z.string(), startLine: z.number().int().min(1).optional(), endLine: z.number().int().min(1).optional() } }, async ({ path, startLine, endLine }) => mcpText(readTextFile(path, startLine, endLine)));
  },
  {
    instructions: 'AUTO BUILDER 2 extended MCP route. Restores browser, upload, Eden, sandbox, and factory planning tools outside the primary strict /api/mcp connector. Prefer dry_run and approval-gated modes.'
  },
  {
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: false
  }
);

export { handler as GET, handler as POST, handler as DELETE };

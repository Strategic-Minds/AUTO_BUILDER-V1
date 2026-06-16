import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';

import { getVercelRedeployReadiness, triggerVercelRedeploy } from '@/lib/bridges/vercelRedeployBridge';
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

const connectorSchemaVersion = 'strict-20-2026-06-10';
const productionMcpUrl = 'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp';
const productionManifestUrl = 'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/manifest';
const productionToolsUrl = 'https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/tools';

const visibleRepoPaths = [
  'README.md',
  'docs/handoffs/dev-handoff.md',
  'docs/prompts/repo-discovery.prompt.md',
  'apps/control-plane/package.json',
  'factory/connector-ops.json',
  'factory/template-library.json',
  'factory/capability-matrix.json',
  'factory/reverse-engineering-lanes.json'
] as const;

const jobModeSchema = z.enum(jobModes);
const dryRunExecuteModeSchema = z.enum(['dry_run', 'execute']);
const dryRunRollbackModeSchema = z.enum(['dry_run', 'rollback']);
const passthroughPayloadSchema = z.object({}).passthrough();

const listRepoFilesSchema = {
  subpath: z.string().optional(),
  maxDepth: z.number().int().min(0).max(8).optional(),
  limit: z.number().int().min(1).max(500).optional()
};

const readTextFileSchema = {
  path: z.string(),
  startLine: z.number().int().min(1).optional(),
  endLine: z.number().int().min(1).optional()
};

const universalJobSchema = {
  job_id: z.string(),
  mode: jobModeSchema.optional(),
  action: z.string().optional(),
  actions: z.array(z.string()).optional(),
  target_system: z.string().optional(),
  provider: z.string().optional(),
  command_folder_id: z.string().optional(),
  root_resource_id: z.string().optional(),
  objective: z.string().optional(),
  approval_required: z.boolean().optional(),
  blocked_actions: z.array(z.string()).optional(),
  fallbacks: z.array(z.string()).optional(),
  payload: passthroughPayloadSchema.optional(),
  project_id: z.string().optional(),
  projectId: z.string().optional(),
  repo_id: z.string().optional(),
  repoId: z.string().optional(),
  ref: z.string().optional(),
  sha: z.string().optional(),
  approvedProductionDeploy: z.boolean().optional(),
  approvalPhrase: z.string().optional()
};

const driveJobSchema = {
  job_id: z.string().optional(),
  mode: z.enum(['dry_run', 'approved_write', 'read', 'draft', 'execute', 'rollback']).optional(),
  approved: z.boolean().optional(),
  approvalId: z.string().optional(),
  approvalPhrase: z.string().optional(),
  command_folder_id: z.string().optional(),
  root_folder_id: z.string().optional(),
  create_missing_folders: z.boolean().optional(),
  folder_manifest: z.array(z.string()).optional(),
  write_receipts: z.boolean().optional(),
  blocked_actions: z.array(z.string()).optional(),
  folder_id: z.string().optional(),
  parent_folder_id: z.string().optional(),
  folder_name: z.string().optional(),
  file_id: z.string().optional(),
  destination_parent_folder_id: z.string().optional(),
  current_parent_folder_id: z.string().optional(),
  receipt_folder_id: z.string().optional(),
  system: z.string().optional(),
  action: z.string().optional(),
  status: z.string().optional(),
  summary: z.string().optional()
};

const platformProvisioningSchema = {
  job_id: z.string(),
  mode: dryRunExecuteModeSchema.optional(),
  command_folder_id: z.string().optional(),
  owner: z.string().optional(),
  repo_name: z.string().optional(),
  visibility: z.enum(['private', 'public', 'internal']).optional(),
  description: z.string().optional(),
  initialize_readme: z.boolean().optional(),
  team_id: z.string().optional(),
  project_id: z.string().optional(),
  project_name: z.string().optional(),
  workflow_name: z.string().optional(),
  route: z.string().optional(),
  schedule: z.string().optional(),
  timezone: z.string().optional(),
  agent_name: z.string().optional(),
  agent_scope: z.string().optional(),
  allowed_tools: z.array(z.string()).optional(),
  gateway_name: z.string().optional(),
  providers: z.array(z.string()).optional(),
  models: z.array(z.string()).optional(),
  git_repo: z.string().optional(),
  framework: z.string().optional(),
  root_directory: z.string().optional()
};

const rollbackSchema = {
  job_id: z.string(),
  mode: dryRunRollbackModeSchema.optional(),
  original_job_id: z.string(),
  rollback_type: z.string(),
  command_folder_id: z.string().optional()
};

type JsonRecord = Record<string, unknown>;

function mcpText(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] };
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function boolValue(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function payloadFor(input: JsonRecord): JsonRecord {
  return isRecord(input.payload) ? input.payload : {};
}

function actionTerms(input: JsonRecord) {
  const action = stringValue(input.action) ?? '';
  const objective = stringValue(input.objective) ?? '';
  const actions = Array.isArray(input.actions) ? input.actions.filter((item): item is string => typeof item === 'string') : [];
  return [action, objective, ...actions].map((item) => item.toLowerCase());
}

function shouldRouteVercelRedeploy(input: JsonRecord) {
  const provider = stringValue(input.provider)?.toLowerCase();
  const targetSystem = stringValue(input.target_system)?.toLowerCase();
  const hasRedeployIntent = actionTerms(input).some((term) => term.includes('redeploy'));
  return provider === 'vercel' && hasRedeployIntent && (targetSystem === undefined || targetSystem === 'auto_builder' || targetSystem === 'eden_skye_studios');
}

async function runVercelRedeployTool(input: JsonRecord) {
  const payload = payloadFor(input);
  const mode = stringValue(input.mode) ?? 'dry_run';
  const targetSystem = stringValue(payload.targetSystem) ?? stringValue(payload.target_system) ?? stringValue(input.target_system) ?? 'auto_builder';
  const redeployMode = payload.mode === 'production' || payload.target === 'production' ? 'production' : 'preview';
  const productionApproved = boolValue(payload.approvedProductionDeploy ?? input.approvedProductionDeploy) === true;
  const approvalPhrase = stringValue(payload.approvalPhrase) ?? stringValue(input.approvalPhrase);

  if (redeployMode === 'production' && !(productionApproved && approvalPhrase === 'APPROVE PRODUCTION DEPLOY')) {
    return {
      job_id: input.job_id,
      status: 'blocked',
      mode,
      action: 'redeploy_preview',
      target_system: targetSystem,
      timestamp: new Date().toISOString(),
      receipt: { required: true, status: 'production_redeploy_blocked' },
      rollback: { available: false, status: 'not_required_for_blocked_action' },
      data: {
        routed_to: 'vercel_redeploy_bridge',
        validation_status: 'blocked',
        blocked_operations: [{ action: 'production_redeploy', status: 'blocked_by_policy' }],
        requiredApprovalPhrase: 'APPROVE PRODUCTION DEPLOY'
      },
      errors: []
    };
  }

  if (mode !== 'execute') {
    return {
      job_id: input.job_id,
      status: 'dry_run_complete',
      mode,
      action: 'redeploy_preview',
      target_system: targetSystem,
      timestamp: new Date().toISOString(),
      receipt: { required: true, status: 'vercel_redeploy_plan_ready' },
      rollback: { available: true, status: 'prior_deployment_can_be_redeployed_or_promoted' },
      data: {
        routed_to: 'vercel_redeploy_bridge',
        validation_status: 'planned',
        readiness: getVercelRedeployReadiness(),
        planned_operations: [{ provider: 'vercel', action: 'preview_redeploy', target_system: targetSystem, dry_run: true }],
        next_actions: ['Run mode=execute for preview redeploy.', 'Poll Vercel deployment and verify routes.']
      },
      errors: []
    };
  }

  const providerResult = await triggerVercelRedeploy({
    targetSystem: targetSystem === 'eden_skye_studios' ? 'eden_skye_studios' : 'auto_builder',
    mode: redeployMode,
    ref: stringValue(payload.ref) ?? stringValue(input.ref) ?? 'main',
    sha: stringValue(payload.sha) ?? stringValue(input.sha),
    requestedBy: 'AUTO BUILDER 2 MCP runner',
    projectId: stringValue(payload.projectId) ?? stringValue(payload.project_id) ?? stringValue(input.projectId) ?? stringValue(input.project_id),
    repoId: stringValue(payload.repoId) ?? stringValue(payload.repo_id) ?? stringValue(input.repoId) ?? stringValue(input.repo_id),
    approvedProductionDeploy: productionApproved,
    approvalPhrase,
    metadata: { source: 'auto-builder-2-mcp-runner' }
  });

  return {
    job_id: input.job_id,
    status: providerResult.ok ? 'accepted' : providerResult.blocked ? 'blocked' : 'failed',
    mode,
    action: 'redeploy_preview',
    target_system: targetSystem,
    timestamp: new Date().toISOString(),
    receipt: { required: true, status: providerResult.ok ? 'vercel_redeploy_submitted' : 'vercel_redeploy_failed' },
    rollback: { available: true, status: 'prior_deployment_can_be_redeployed_or_promoted' },
    data: {
      routed_to: 'vercel_redeploy_bridge',
      validation_status: providerResult.ok ? 'queued' : providerResult.blocked ? 'blocked' : 'failed',
      provider_result: providerResult,
      next_actions: providerResult.ok
        ? ['Poll Vercel deployment until READY or ERROR.', 'Verify deployment commit and required runtime routes.']
        : ['Inspect provider_result status/error.', 'Use BROWSER_WORKER_URL fallback only if a browser worker is configured.']
    },
    errors: []
  };
}

async function runJobWithVercelAdapter(input: unknown) {
  const record = isRecord(input) ? input : {};
  if (shouldRouteVercelRedeploy(record)) return runVercelRedeployTool(record);
  return runJob(record as never);
}

async function runUniversalJobWithVercelAdapter(input: unknown) {
  const record = isRecord(input) ? input : {};
  if (shouldRouteVercelRedeploy(record)) return runVercelRedeployTool(record);
  return runUniversalJob(record as never);
}

function connectorIntegrity() {
  return {
    connector_schema_version: connectorSchemaVersion,
    expected_tool_count: expectedCallableMcpToolNames.length,
    production_mcp_url: productionMcpUrl,
    production_manifest_url: productionManifestUrl,
    production_tools_url: productionToolsUrl,
    stale_schema_instructions: 'If ChatGPT exposes fewer than 20 AUTO_BUILDER_2 tools, refresh or re-register the connector against production_mcp_url until api_tool.list_resources reports 20 tools.',
    server_truth: 'Production MCP manifest and tools endpoints are the authoritative strict-20 surfaces.',
    no_write_fix_rule: 'Do not run Drive writes, folder creation, uploads, or approved_write jobs to fix connector registration.'
  };
}

function strictStatus() {
  return {
    status: 'ok',
    service: 'auto-builder-2-strict-mcp',
    transport: 'streamable-http',
    environment: process.env.VERCEL ? 'vercel' : 'local',
    connectorIntegrity: connectorIntegrity(),
    connector_schema_version: connectorSchemaVersion,
    expected_tool_count: expectedCallableMcpToolNames.length,
    activeOperatingMap,
    expectedCallableMcpTools: expectedCallableMcpToolNames,
    executionTools: autoBuilder2ExecutionToolNames,
    requiredEnvNames,
    governance: {
      primaryRoute: '/api/mcp',
      toolSurface: 'strict-20',
      defaultMode: 'dry_run',
      removedFromPrimaryRoute: [
        'browser tools',
        'drive upload tools',
        'eden tools',
        'dotted aliases',
        'vercel sandbox tools',
        'loose z.unknown record schemas'
      ]
    }
  };
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool('health_check', { title: 'Health Check', description: 'Confirm the Auto Builder 2 strict MCP server is alive and diagnose stale ChatGPT connector registration.', inputSchema: {} }, async () =>
      mcpText({ ...strictStatus(), timestamp: new Date().toISOString() })
    );
    server.registerTool('get_repo_summary', { title: 'Get Repo Summary', description: 'Return Auto Builder 2 operating map and expected callable tool summary.', inputSchema: {} }, async () => mcpText(strictStatus()));
    server.registerTool('list_repo_files', { title: 'List Repo Files', description: 'List safe bundled repo files exposed for read-only inspection.', inputSchema: listRepoFilesSchema }, async ({ subpath, limit }) => {
      const prefix = subpath ? subpath.replace(/\/$/, '') : '';
      const files = visibleRepoPaths.filter((path) => !prefix || path === prefix || path.startsWith(`${prefix}/`)).slice(0, limit ?? 200).map((path) => ({ path, type: 'file' }));
      return mcpText(files);
    });
    server.registerTool('read_bootstrap_status', { title: 'Read Bootstrap Status', description: 'Inspect bootstrap status, callable tool expectations, and stale ChatGPT connector diagnostics.', inputSchema: {} }, async () => mcpText(strictStatus()));
    server.registerTool('read_text_file', { title: 'Read Text File', description: 'Read safe bundled control-plane file metadata by path.', inputSchema: readTextFileSchema }, async ({ path, startLine, endLine }) => mcpText({ path, startLine, endLine, connectorIntegrity: connectorIntegrity(), note: 'Strict MCP route exposes safe bundled file metadata. Use GitHub for exact source audit when needed.' }));
    server.registerTool('run_job', { title: 'Run Job', description: 'Generic dry-run-first Auto Builder 2 job entrypoint.', inputSchema: universalJobSchema }, async (input) => mcpText(await runJobWithVercelAdapter(input)));
    server.registerTool('run_universal_job', { title: 'Run Universal Job', description: 'Dry-run-first universal automation runner.', inputSchema: universalJobSchema }, async (input) => mcpText(await runUniversalJobWithVercelAdapter(input)));
    server.registerTool('run_drive_job', { title: 'Run Drive Job', description: 'Governed Google Drive job runner for dry-run folder manifests and approved folder creation.', inputSchema: driveJobSchema }, async (input) => mcpText(await runDriveJobTool(input as never)));
    server.registerTool('drive_list_tree', { title: 'Drive List Tree', description: 'Read or plan a Google Drive folder tree listing.', inputSchema: driveJobSchema }, async (input) => mcpText(driveListTreeTool(input as never)));
    server.registerTool('drive_create_folder', { title: 'Drive Create Folder', description: 'Dry-run-first Google Drive folder creation planner.', inputSchema: { ...driveJobSchema, mode: dryRunExecuteModeSchema.optional() } }, async (input) => mcpText(await driveCreateFolderTool(input as never)));
    server.registerTool('drive_move_folder', { title: 'Drive Move Folder', description: 'Dry-run-first Google Drive folder move planner.', inputSchema: driveJobSchema }, async (input) => mcpText(driveMoveFolderTool(input as never)));
    server.registerTool('drive_move_file', { title: 'Drive Move File', description: 'Dry-run-first Google Drive file move planner.', inputSchema: driveJobSchema }, async (input) => mcpText(driveMoveFileTool(input as never)));
    server.registerTool('drive_write_receipt', { title: 'Drive Write Receipt', description: 'Dry-run-first Google Drive receipt planner.', inputSchema: driveJobSchema }, async (input) => mcpText(driveWriteReceiptTool(input as never)));
    server.registerTool('run_platform_provisioning_job', { title: 'Run Platform Provisioning Job', description: 'Dry-run-first GitHub/Vercel/AI Gateway provisioning planner.', inputSchema: platformProvisioningSchema }, async (input) => mcpText(await runPlatformProvisioningJobTool(input as never)));
    server.registerTool('create_github_repo', { title: 'Create GitHub Repo', description: 'Dry-run-first GitHub repository creation planner.', inputSchema: platformProvisioningSchema }, async (input) => mcpText(await createGithubRepoTool(input as never)));
    server.registerTool('create_vercel_project', { title: 'Create Vercel Project', description: 'Dry-run-first Vercel project creation planner.', inputSchema: platformProvisioningSchema }, async (input) => mcpText(await createVercelProjectTool(input as never)));
    server.registerTool('create_vercel_workflow', { title: 'Create Vercel Workflow', description: 'Dry-run-first Vercel workflow or cron planner.', inputSchema: platformProvisioningSchema }, async (input) => mcpText(createVercelWorkflowTool(input as never)));
    server.registerTool('create_vercel_agent', { title: 'Create Vercel Agent', description: 'Dry-run-first Vercel agent planner.', inputSchema: platformProvisioningSchema }, async (input) => mcpText(createVercelAgentTool(input as never)));
    server.registerTool('create_ai_gateway', { title: 'Create AI Gateway', description: 'Dry-run-first AI Gateway planner.', inputSchema: platformProvisioningSchema }, async (input) => mcpText(createAiGatewayTool(input as never)));
    server.registerTool('rollback', { title: 'Rollback', description: 'Dry-run rollback planner. Live rollback requires explicit rollback mode.', inputSchema: rollbackSchema }, async (input) => mcpText(rollbackTool(input as never)));
  },
  { instructions: 'AUTO BUILDER 2 strict ChatGPT MCP route. Exposes exactly the 20 required tools. Write-capable tools are dry-run-first and require explicit execute or rollback mode. Health and bootstrap tools include connector_schema_version strict-20-2026-06-10 and stale connector diagnostics.' },
  { basePath: '/api', maxDuration: 60, verboseLogs: false }
);

export { handler as GET, handler as POST, handler as DELETE };

import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';

import {
  activeOperatingMap,
  createAiGatewayTool,
  createGithubRepoTool,
  createVercelAgentTool,
  createVercelProjectTool,
  createVercelWorkflowTool,
  defaultCommandFolderId,
  driveCreateFolderTool,
  driveListTreeTool,
  driveMoveFileTool,
  driveMoveFolderTool,
  driveWriteReceiptTool,
  expectedCallableMcpToolNames,
  rollbackTool,
  runDriveJobTool,
  runJob,
  runPlatformProvisioningJobTool,
  runUniversalJob
} from '@/lib/autobuilder-v2/execution-tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const jobModeSchema = z.enum(['read', 'dry_run', 'draft', 'execute', 'rollback']);
const driveModeSchema = z.enum(['read', 'dry_run', 'draft', 'execute', 'rollback', 'approved_write']);
const dryRunExecuteModeSchema = z.enum(['dry_run', 'execute']);
const dryRunRollbackModeSchema = z.enum(['dry_run', 'rollback']);
const payloadSchema = z.object({}).passthrough().optional();
const universalJobSchema = { job_id: z.string(), mode: jobModeSchema.optional(), action: z.string().optional(), target_system: z.string().optional(), provider: z.string().optional(), command_folder_id: z.string().optional(), payload: payloadSchema };
const driveJobSchema = {
  job_id: z.string().optional(),
  mode: driveModeSchema.optional(),
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
const platformSchema = { job_id: z.string(), mode: dryRunExecuteModeSchema.optional(), command_folder_id: z.string().optional(), owner: z.string().optional(), repo_name: z.string().optional(), visibility: z.enum(['private', 'public', 'internal']).optional(), description: z.string().optional(), initialize_readme: z.boolean().optional(), team_id: z.string().optional(), project_id: z.string().optional(), project_name: z.string().optional(), workflow_name: z.string().optional(), route: z.string().optional(), schedule: z.string().optional(), timezone: z.string().optional(), agent_name: z.string().optional(), agent_scope: z.string().optional(), allowed_tools: z.array(z.string()).optional(), gateway_name: z.string().optional(), providers: z.array(z.string()).optional(), models: z.array(z.string()).optional(), git_repo: z.string().optional(), framework: z.string().optional(), root_directory: z.string().optional() };
const rollbackSchema = { job_id: z.string(), mode: dryRunRollbackModeSchema.optional(), original_job_id: z.string(), rollback_type: z.string(), command_folder_id: z.string().optional(), rollback_payload: payloadSchema };

function mcpText(value: unknown) { return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] }; }
function readBootstrapStatus() { return { route: '/api/mcp-minimal/mcp', purpose: 'Minimal Auto Builder 2 MCP route for ChatGPT ingestion-safe discovery.', activeOperatingMap, expectedCallableMcpTools: expectedCallableMcpToolNames, defaultCommandFolderId, constraints: ['Only the 20 required Auto Builder 2 tools are registered.', 'No browser tools are registered.', 'No Eden dotted aliases are registered.', 'Write-capable tools default to dry_run unless mode=execute or governed approved_write is explicitly supplied.'] }; }

const handler = createMcpHandler(
  (server) => {
    server.registerTool('health_check', { title: 'Health Check', description: 'Confirm the minimal Auto Builder 2 MCP route is alive.', inputSchema: {} }, async () => mcpText({ status: 'ok', service: 'auto-builder-2-minimal-mcp', transport: 'streamable-http', environment: process.env.VERCEL ? 'vercel' : 'local', route: '/api/mcp-minimal/mcp', callableTools: expectedCallableMcpToolNames.length, timestamp: new Date().toISOString() }));
    server.registerTool('get_repo_summary', { title: 'Get Repo Summary', description: 'Return minimal Auto Builder 2 operating map and tool summary.', inputSchema: {} }, async () => mcpText(readBootstrapStatus()));
    server.registerTool('list_repo_files', { title: 'List Repo Files', description: 'Return the minimal route files relevant to this MCP surface.', inputSchema: { subpath: z.string().optional(), maxDepth: z.number().int().min(0).max(8).optional(), limit: z.number().int().min(1).max(500).optional() } }, async () => mcpText([{ path: 'src/app/api/mcp-minimal/[transport]/route.ts', type: 'file' }, { path: 'src/lib/autobuilder-v2/execution-tools.ts', type: 'file' }, { path: 'scripts/validate-mcp-tools.mjs', type: 'file' }]));
    server.registerTool('read_bootstrap_status', { title: 'Read Bootstrap Status', description: 'Inspect minimal route status and expected callable tools.', inputSchema: {} }, async () => mcpText(readBootstrapStatus()));
    server.registerTool('read_text_file', { title: 'Read Text File', description: 'Return a safe summary for minimal MCP route source files.', inputSchema: { path: z.string(), startLine: z.number().int().min(1).optional(), endLine: z.number().int().min(1).optional() } }, async ({ path }) => mcpText({ path, route: '/api/mcp-minimal/mcp', note: 'Minimal MCP route source is in GitHub. Use GitHub fetch_file for exact source content.', expectedCallableMcpTools: expectedCallableMcpToolNames }));
    server.registerTool('run_job', { title: 'Run Job', description: 'Generic dry-run-first Auto Builder 2 job entrypoint.', inputSchema: universalJobSchema }, async (payload) => mcpText(runJob(payload as never)));
    server.registerTool('run_universal_job', { title: 'Run Universal Job', description: 'Dry-run-first universal automation runner.', inputSchema: universalJobSchema }, async (payload) => mcpText(runUniversalJob(payload as never)));
    server.registerTool('run_drive_job', { title: 'Run Drive Job', description: 'Governed Google Drive job runner for dry-run folder manifests and approved folder creation.', inputSchema: driveJobSchema }, async (payload) => mcpText(await runDriveJobTool(payload as never)));
    server.registerTool('drive_list_tree', { title: 'Drive List Tree', description: 'Read/planning tool for Google Drive tree listing.', inputSchema: driveJobSchema }, async (payload) => mcpText(driveListTreeTool(payload as never)));
    server.registerTool('drive_create_folder', { title: 'Drive Create Folder', description: 'Dry-run or explicit execute Google Drive folder creation.', inputSchema: { ...driveJobSchema, mode: dryRunExecuteModeSchema.optional() } }, async (payload) => mcpText(await driveCreateFolderTool(payload as never)));
    server.registerTool('drive_move_folder', { title: 'Drive Move Folder', description: 'Dry-run-first Google Drive folder move planner.', inputSchema: driveJobSchema }, async (payload) => mcpText(driveMoveFolderTool(payload as never)));
    server.registerTool('drive_move_file', { title: 'Drive Move File', description: 'Dry-run-first Google Drive file move planner.', inputSchema: driveJobSchema }, async (payload) => mcpText(driveMoveFileTool(payload as never)));
    server.registerTool('drive_write_receipt', { title: 'Drive Write Receipt', description: 'Dry-run-first Google Drive receipt planner.', inputSchema: driveJobSchema }, async (payload) => mcpText(driveWriteReceiptTool(payload as never)));
    server.registerTool('run_platform_provisioning_job', { title: 'Run Platform Provisioning Job', description: 'Dry-run-first GitHub/Vercel/AI Gateway provisioning planner.', inputSchema: platformSchema }, async (payload) => mcpText(await runPlatformProvisioningJobTool(payload as never)));
    server.registerTool('create_github_repo', { title: 'Create GitHub Repo', description: 'Dry-run or explicit execute GitHub repo creation.', inputSchema: platformSchema }, async (payload) => mcpText(await createGithubRepoTool(payload as never)));
    server.registerTool('create_vercel_project', { title: 'Create Vercel Project', description: 'Dry-run or explicit execute Vercel project creation.', inputSchema: platformSchema }, async (payload) => mcpText(await createVercelProjectTool(payload as never)));
    server.registerTool('create_vercel_workflow', { title: 'Create Vercel Workflow', description: 'Dry-run-first Vercel workflow/cron planner.', inputSchema: platformSchema }, async (payload) => mcpText(createVercelWorkflowTool(payload as never)));
    server.registerTool('create_vercel_agent', { title: 'Create Vercel Agent', description: 'Dry-run-first Vercel agent planner.', inputSchema: platformSchema }, async (payload) => mcpText(createVercelAgentTool(payload as never)));
    server.registerTool('create_ai_gateway', { title: 'Create AI Gateway', description: 'Dry-run-first AI Gateway planner.', inputSchema: platformSchema }, async (payload) => mcpText(createAiGatewayTool(payload as never)));
    server.registerTool('rollback', { title: 'Rollback', description: 'Dry-run rollback planner. Live rollback requires explicit rollback mode and provider adapter.', inputSchema: rollbackSchema }, async (payload) => mcpText(rollbackTool(payload as never)));
  },
  { instructions: 'Minimal Auto Builder 2 MCP surface. This route intentionally registers only the 20 required tools with simple schemas and dry-run-first behavior.' },
  { basePath: '/api/mcp-minimal', maxDuration: 60, verboseLogs: false }
);

export { handler as GET, handler as POST, handler as DELETE };

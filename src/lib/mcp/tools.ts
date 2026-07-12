import type { MCPTool } from './server';

// DOMAIN: system (T-001 to T-006)
export const systemTools: MCPTool[] = [
  {
    name: 'system.health',
    description: 'Return gateway and dependency health status',
    inputSchema: { type: 'object', properties: {}, required: [] },
    scope: 'system:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'system.capabilities',
    description: 'List all registered MCP capabilities and their versions',
    inputSchema: { type: 'object', properties: {}, required: [] },
    scope: 'system:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'system.audit_trail',
    description: 'Retrieve recent audit events and receipts for a project',
    inputSchema: { type: 'object', properties: { project_id: { type: 'string' }, limit: { type: 'number', default: 20 } }, required: [] },
    scope: 'system:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'system.version',
    description: 'Return gateway version, protocol version, and environment',
    inputSchema: { type: 'object', properties: {}, required: [] },
    scope: 'system:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'NONE'
  },
  {
    name: 'system.policy_check',
    description: 'Evaluate a proposed action against governance policy without executing it',
    inputSchema: { type: 'object', properties: { action: { type: 'string' }, environment: { type: 'string', enum: ['preview', 'production'] }, project_id: { type: 'string' } }, required: ['action', 'environment'] },
    scope: 'system:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'system.cost_status',
    description: 'Return current cost consumption against budget gates for a project',
    inputSchema: { type: 'object', properties: { project_id: { type: 'string' } }, required: [] },
    scope: 'system:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  }
];

// DOMAIN: base44 bridge (T-007 to T-014)
export const base44Tools: MCPTool[] = [
  {
    name: 'base44.list_apps',
    description: 'List Base44 apps accessible to the authenticated operator',
    inputSchema: { type: 'object', properties: { filter: { type: 'string' } }, required: [] },
    scope: 'base44:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'base44.read_entity',
    description: 'Read records from a Base44 entity with optional filters',
    inputSchema: { type: 'object', properties: { app_id: { type: 'string' }, entity: { type: 'string' }, query: { type: 'object' }, limit: { type: 'number', default: 50 } }, required: ['app_id', 'entity'] },
    scope: 'base44:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'base44.write_entity',
    description: 'Create or update a record in a Base44 entity',
    inputSchema: { type: 'object', properties: { app_id: { type: 'string' }, entity: { type: 'string' }, data: { type: 'object' }, record_id: { type: 'string' } }, required: ['app_id', 'entity', 'data'] },
    scope: 'base44:write', risk: 'MEDIUM', requiresApproval: false, receiptBehavior: 'FULL'
  },
  {
    name: 'base44.list_automations',
    description: 'List automations for a Base44 app',
    inputSchema: { type: 'object', properties: { app_id: { type: 'string' } }, required: ['app_id'] },
    scope: 'base44:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'base44.get_schema',
    description: 'Get entity schemas for a Base44 app',
    inputSchema: { type: 'object', properties: { app_id: { type: 'string' } }, required: ['app_id'] },
    scope: 'base44:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'base44.trigger_automation',
    description: 'Trigger a named automation in a Base44 app',
    inputSchema: { type: 'object', properties: { app_id: { type: 'string' }, automation_id: { type: 'string' }, payload: { type: 'object' } }, required: ['app_id', 'automation_id'] },
    scope: 'base44:write', risk: 'MEDIUM', requiresApproval: true, receiptBehavior: 'FULL'
  },
  {
    name: 'base44.scoring_summary',
    description: 'Read the current REALITY OS ceiling score from ScoringRegistry',
    inputSchema: { type: 'object', properties: { app_id: { type: 'string' } }, required: [] },
    scope: 'base44:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'base44.validation_report',
    description: 'Read the latest AutoValidation results from Base44',
    inputSchema: { type: 'object', properties: { app_id: { type: 'string' }, cycle: { type: 'number' } }, required: [] },
    scope: 'base44:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  }
];

// DOMAIN: github (T-015 to T-022)
export const githubTools: MCPTool[] = [
  {
    name: 'github.list_repos',
    description: 'List repositories for the Strategic-Minds organization',
    inputSchema: { type: 'object', properties: { filter: { type: 'string' } }, required: [] },
    scope: 'github:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'github.read_file',
    description: 'Read a file from a GitHub repository',
    inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, path: { type: 'string' }, ref: { type: 'string', default: 'main' } }, required: ['owner', 'repo', 'path'] },
    scope: 'github:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'github.list_branches',
    description: 'List branches in a repository',
    inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' } }, required: ['owner', 'repo'] },
    scope: 'github:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'github.list_prs',
    description: 'List pull requests in a repository',
    inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, state: { type: 'string', enum: ['open', 'closed', 'all'], default: 'open' } }, required: ['owner', 'repo'] },
    scope: 'github:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'github.create_branch',
    description: 'Create a new branch from a base SHA (preview/draft mode only)',
    inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, branch: { type: 'string' }, from_sha: { type: 'string' } }, required: ['owner', 'repo', 'branch', 'from_sha'] },
    scope: 'github:write', risk: 'MEDIUM', requiresApproval: false, receiptBehavior: 'FULL'
  },
  {
    name: 'github.write_file',
    description: 'Write a file to a non-default branch (never main)',
    inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, branch: { type: 'string' }, path: { type: 'string' }, content: { type: 'string' }, message: { type: 'string' } }, required: ['owner', 'repo', 'branch', 'path', 'content', 'message'] },
    scope: 'github:write', risk: 'MEDIUM', requiresApproval: false, receiptBehavior: 'FULL'
  },
  {
    name: 'github.open_draft_pr',
    description: 'Open a draft pull request from a feature branch to main',
    inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, head: { type: 'string' }, base: { type: 'string', default: 'main' }, title: { type: 'string' }, body: { type: 'string' } }, required: ['owner', 'repo', 'head', 'title'] },
    scope: 'github:write', risk: 'MEDIUM', requiresApproval: false, receiptBehavior: 'FULL'
  },
  {
    name: 'github.get_ci_status',
    description: 'Get CI/check status for a commit or PR',
    inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, ref: { type: 'string' } }, required: ['owner', 'repo', 'ref'] },
    scope: 'github:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  }
];

// DOMAIN: workflow/orchestration (T-023 to T-030)
export const workflowTools: MCPTool[] = [
  {
    name: 'workflow.create_run',
    description: 'Create a new pipeline workflow run with idempotency key',
    inputSchema: { type: 'object', properties: { project_id: { type: 'string' }, workflow_type: { type: 'string' }, payload: { type: 'object' }, idempotency_key: { type: 'string' } }, required: ['project_id', 'workflow_type'] },
    scope: 'workflow:write', risk: 'MEDIUM', requiresApproval: false, receiptBehavior: 'FULL'
  },
  {
    name: 'workflow.get_status',
    description: 'Get current status and steps for a workflow run',
    inputSchema: { type: 'object', properties: { run_id: { type: 'string' } }, required: ['run_id'] },
    scope: 'workflow:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'workflow.list_runs',
    description: 'List workflow runs for a project',
    inputSchema: { type: 'object', properties: { project_id: { type: 'string' }, status: { type: 'string' }, limit: { type: 'number', default: 20 } }, required: [] },
    scope: 'workflow:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'workflow.request_approval',
    description: 'Submit a protected action for operator approval',
    inputSchema: { type: 'object', properties: { run_id: { type: 'string' }, action: { type: 'string' }, scope: { type: 'string' }, environment: { type: 'string' }, rollback_ref: { type: 'string' } }, required: ['action', 'scope', 'environment'] },
    scope: 'workflow:write', risk: 'HIGH', requiresApproval: false, receiptBehavior: 'FULL'
  },
  {
    name: 'workflow.cancel',
    description: 'Cancel a running workflow and trigger compensation',
    inputSchema: { type: 'object', properties: { run_id: { type: 'string' }, reason: { type: 'string' } }, required: ['run_id'] },
    scope: 'workflow:write', risk: 'HIGH', requiresApproval: true, receiptBehavior: 'FULL'
  },
  {
    name: 'workflow.get_receipt',
    description: 'Retrieve a specific action or validation receipt',
    inputSchema: { type: 'object', properties: { receipt_id: { type: 'string' } }, required: ['receipt_id'] },
    scope: 'workflow:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'NONE'
  },
  {
    name: 'workflow.list_approvals',
    description: 'List pending approval requests for a project',
    inputSchema: { type: 'object', properties: { project_id: { type: 'string' }, status: { type: 'string', default: 'pending' } }, required: [] },
    scope: 'workflow:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'workflow.decide_approval',
    description: 'Approve or deny a pending protected action (operator only)',
    inputSchema: { type: 'object', properties: { approval_id: { type: 'string' }, decision: { type: 'string', enum: ['approve', 'deny'] }, reason: { type: 'string' } }, required: ['approval_id', 'decision'] },
    scope: 'workflow:approve', risk: 'CRITICAL', requiresApproval: false, receiptBehavior: 'FULL'
  }
];

// DOMAIN: intelligence/validation (T-031 to T-044)
export const intelligenceTools: MCPTool[] = [
  {
    name: 'intel.scoring_dashboard',
    description: 'Return the full REALITY OS ceiling scoring dashboard with all 7 dimensions',
    inputSchema: { type: 'object', properties: { cycle: { type: 'number' } }, required: [] },
    scope: 'intel:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'intel.validation_matrix',
    description: 'Return the 16-test AutoValidation matrix results for a cycle',
    inputSchema: { type: 'object', properties: { cycle: { type: 'number' } }, required: [] },
    scope: 'intel:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'intel.self_reflection_report',
    description: 'Retrieve the latest or a specific self-reflection report',
    inputSchema: { type: 'object', properties: { cycle: { type: 'number' } }, required: [] },
    scope: 'intel:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'intel.repair_queue',
    description: 'List open repair items and their auto-fix status',
    inputSchema: { type: 'object', properties: { status: { type: 'string' }, severity: { type: 'string' } }, required: [] },
    scope: 'intel:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'intel.source_truth_audit',
    description: 'Run a discovery audit of all source truth registries',
    inputSchema: { type: 'object', properties: { scope: { type: 'string', enum: ['full', 'repos', 'base44', 'vercel', 'supabase'] } }, required: [] },
    scope: 'intel:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'FULL'
  },
  {
    name: 'intel.drift_report',
    description: 'Compare claimed vs actual system state and report drift',
    inputSchema: { type: 'object', properties: { system_slug: { type: 'string' } }, required: [] },
    scope: 'intel:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'FULL'
  }
];


// DOMAIN: ChatGPT Connector required tools (search + fetch)
// ChatGPT's MCP connector REQUIRES these two tools to accept the connection
export const chatgptConnectorTools: MCPTool[] = [
  {
    name: 'search',
    description: 'Search the AUTO BUILDER intelligence system — repos, projects, validation records, scoring, audit logs, and system registry',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query — e.g. "repair queue", "scoring summary", "open PRs", "system health"' }
      },
      required: ['query']
    },
    scope: 'system:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  },
  {
    name: 'fetch',
    description: 'Fetch a specific document or record from the AUTO BUILDER intelligence system by ID or URL',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Document or record ID to fetch — e.g. a receipt ID, PR number, validation ID, or repo file path' }
      },
      required: ['id']
    },
    scope: 'system:read', risk: 'LOW', requiresApproval: false, receiptBehavior: 'TRACE'
  }
];

export const ALL_TOOLS: MCPTool[] = [
  ...systemTools,
  ...base44Tools,
  ...githubTools,
  ...workflowTools,
  ...intelligenceTools,
  ...chatgptConnectorTools
];
